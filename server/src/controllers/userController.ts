import type { Request, Response, NextFunction } from "express";
import { clerkClient, type User } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

/** Extract favorites from Clerk metadata */
interface UserPrivateMetadata {
  favorites?: string[];
}

function getFavoriteIds(user: User): string[] {
  const meta = user.privateMetadata as UserPrivateMetadata | undefined;
  return meta?.favorites ?? [];
}

export async function getUserBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
  } catch (err) {
    next(err);
  }
}

export async function updateFavorite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.auth();
    const movieId = req.body.movieId as string | undefined;

    if (!userId || !movieId) {
      res.status(400).json({ success: false, message: "Invalid request" });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = getFavoriteIds(user);

    const updated = favorites.includes(movieId)
      ? favorites.filter((id) => id !== movieId)
      : [...favorites, movieId];

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { favorites: updated },
    });

    res.status(200).json({ success: true, message: "Favorites updated" });
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  } catch (err) {
    next(err);
  }
}
