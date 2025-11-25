import type { Request, Response } from "express";
import { clerkClient, type User } from "@clerk/express";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Extract simple user name from Clerk user object
function getUserName(user: User): string {
  return user.fullName || user.username || user.firstName || user.lastName || "Unknown User";
}

/* GET /api/admin/is-admin
   Admin is already validated in middleware */
export const isAdmin = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, isAdmin: true });
});

export const getDashboardData = asyncHandler(async (_req: Request, res: Response) => {
  const paidBookings = await Booking.find({ isPaid: true });

  const activeShows = await Show.find({
    showDateTime: { $gte: new Date() },
  }).populate("movie");

  const users = await clerkClient.users.getUserList();
  const totalUsers = users.totalCount ?? users.data.length;

  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.amount, 0);

  res.status(200).json({
    success: true,
    dashboardData: {
      totalBookings: paidBookings.length,
      totalRevenue,
      activeShows,
      totalUsers,
    },
  });
});

export const getAllShows = asyncHandler(async (_req: Request, res: Response) => {
  const shows = await Show.find({
    showDateTime: { $gte: new Date() },
  })
    .populate("movie")
    .sort({ showDateTime: 1 });

  const paidBookings = await Booking.find({ isPaid: true });

  const formatted = shows.map((show) => {
    const showId = String(show._id);

    const booked = paidBookings
      .filter((b) => String(b.show) === showId)
      .flatMap((b) => b.bookedSeats);

    return {
      _id: show._id,
      movie: show.movie,
      showDateTime: show.showDateTime,
      showPrice: show.showPrice,
      occupiedSeats: booked,
    };
  });

  res.status(200).json({ success: true, shows: formatted });
});

export const getAllBookings = asyncHandler(async (_req: Request, res: Response) => {
  const bookings = await Booking.find()
    .populate({
      path: "show",
      populate: { path: "movie" },
    })
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(
    bookings.map(async (booking) => {
      let userName = "Unknown User";

      try {
        const user = await clerkClient.users.getUser(booking.user);
        userName = getUserName(user);
      } catch {
        console.log("User not found:", booking.user);
      }

      return {
        ...booking.toObject(),
        user: { name: userName },
      };
    })
  );

  res.status(200).json({ success: true, bookings: enriched });
});
