import type { Request, Response } from "express";
import { clerkClient, type User } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

interface UserPrivateMetadata {
  favorites?: string[];
}

function getFavoriteIds(user: User): string[] {
  const meta = user.privateMetadata as UserPrivateMetadata | undefined;
  return meta?.favorites ?? [];
}

export const getUserBookings = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth();

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const bookings = await Booking.find({ user: userId })
    .populate({
      path: "show",
      populate: { path: "movie" },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, bookings });
});

export const updateFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth();
  const { movieId } = req.body;

  if (!userId || !movieId) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const user = await clerkClient.users.getUser(userId);
  const favorites = getFavoriteIds(user);

  const updated = favorites.includes(movieId)
    ? favorites.filter((id) => id !== movieId)
    : [...favorites, movieId];

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: { favorites: updated },
  });

  return res.status(200).json({ success: true, message: "Favorites updated" });
});

export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth();

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await clerkClient.users.getUser(userId);
  const favoriteIds = getFavoriteIds(user);

  const movies = await Movie.find({ _id: { $in: favoriteIds } });

  return res.status(200).json({ success: true, movies });
});
