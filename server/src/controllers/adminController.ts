import type { Request, Response } from "express";
import { clerkClient, type User } from "@clerk/express";

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

/**
 * GET /api/admin/is-admin
 * Since admin access is validated in middleware, this simply returns `true`.
 */
export const isAdmin = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, isAdmin: true });
};

/**
 * GET /api/admin/dashboard
 * Returns:
 * - total paid bookings
 * - revenue generated
 * - active upcoming shows
 * - total user count from Clerk
 */
export const getDashboardData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const paidBookings = await Booking.find({ isPaid: true });

    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const users = await clerkClient.users.getUserList();
    const totalUser = users.totalCount ?? users.data.length;

    res.status(200).json({
      success: true,
      dashboardData: {
        totalBookings: paidBookings.length,
        totalRevenue: paidBookings.reduce((sum, b) => sum + b.amount, 0),
        activeShows,
        totalUser,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to load dashboard data",
    });
  }
};

/**
 * GET /api/admin/all-shows
 * Returns all upcoming shows with:
 * - booked seats (aggregated from paid bookings)
 * - populated movie data
 */
export const getAllShows = async (_req: Request, res: Response): Promise<void> => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const paidBookings = await Booking.find({ isPaid: true });

    const response = shows.map((show) => {
      const showId = String(show._id);

      const bookedSeats = paidBookings
        .filter((b) => String(b.show) === showId)
        .flatMap((b) => b.bookedSeats);

      return {
        _id: show._id,
        movie: show.movie,
        showDateTime: show.showDateTime,
        showPrice: show.showPrice,
        occupiedSeats: bookedSeats,
      };
    });

    res.status(200).json({ success: true, shows: response });
  } catch (error) {
    console.error("Get all shows error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch shows",
    });
  }
};

/**
 * GET /api/admin/all-bookings
 * Returns all bookings with:
 * - movie (populated)
 * - show (populated)
 * - user name (from Clerk)
 */
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    // Enrich each booking with user info from Clerk
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        let userName = "Unknown User";

        try {
          const user: User = await clerkClient.users.getUser(booking.user);
          userName =
            user.fullName || user.username || user.firstName || user.lastName || "Unknown User";
        } catch {
          console.log("Clerk user not found:", booking.user);
        }

        return {
          ...booking.toObject(),
          user: { name: userName },
        };
      })
    );

    res.status(200).json({ success: true, bookings: enriched });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch bookings",
    });
  }
};
