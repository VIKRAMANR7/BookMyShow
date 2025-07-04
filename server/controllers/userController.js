import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

//API Controller function to get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API Controller function to update favorite movie in clerk user metadata
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;
    const user = await clerkClient.users.getUser(userId);
    if (!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = [];
    }
    if (!user.privateMetadata.favorites.includes(movieId)) {
      user.privateMetadata.favorites.push(movieId);
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
        (id) => id !== movieId
      );
    }
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });
    res.status(200).json({ success: true, message: "Favorite movies updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId);
    const getUser = user.privateMetadata.favorites;
    //Getting movies from database
    const movies = await Movie.find({ _id: { $in: getUser } });

    res.status(200).json({ success: true, movies });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
