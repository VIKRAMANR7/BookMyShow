import type { Request, Response } from "express";
import { clerkClient, type User } from "@clerk/express";

import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

interface UserPrivateMetadata {
  favorites?: string[];
}

/* Extract favorites from a Clerk user object.*/
function getFavoriteIds(user: User): string[] {
  const meta = user.privateMetadata as UserPrivateMetadata | undefined;
  return meta?.favorites ?? [];
}

/* GET /api/user/bookings */
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

/* POST /api/user/update-favorite */
export const updateFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.auth();
    const movieId = req.body.movieId as string | undefined;

    if (!userId || !movieId) {
      res.status(400).json({ success: false, message: "Invalid request" });
      return;
    }

    const user = await clerkClient.users.getUser(userId);

    const favorites = getFavoriteIds(user);

    // Toggle favorite
    const updated = favorites.includes(movieId)
      ? favorites.filter((id) => id !== movieId)
      : [...favorites, movieId];

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { favorites: updated },
    });

    res.status(200).json({ success: true, message: "Favorite movies updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

/* GET /api/user/favorites */
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    const favoriteIds = getFavoriteIds(user);

    const movies = await Movie.find({ _id: { $in: favoriteIds } });

    res.status(200).json({ success: true, movies });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
