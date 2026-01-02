import type { Request, Response } from "express";
import Stripe from "stripe";

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";
import { getUserId } from "../utils/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { IMovie } from "../models/Movie.js";

async function checkSeatsAvailability(showId: string, selectedSeats: string[]) {
  const show = await Show.findById(showId);
  if (!show) return false;

  const occupied = show.occupiedSeats ?? {};
  return !selectedSeats.some((seat) => Boolean(occupied[seat]));
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { showId, selectedSeats } = req.body;

  const origin = req.headers.origin ?? "";

  if (!userId || typeof showId !== "string" || !Array.isArray(selectedSeats)) {
    return res.status(400).json({ success: false, message: "Invalid booking request" });
  }

  const available = await checkSeatsAvailability(showId, selectedSeats);
  if (!available) {
    return res.status(400).json({ success: false, message: "Selected seats are already taken" });
  }

  const showData = await Show.findById(showId).populate<{ movie: IMovie }>("movie");
  if (!showData || !showData.movie) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  const movie = showData.movie;

  const booking = await Booking.create({
    user: userId,
    show: showId,
    amount: showData.showPrice * selectedSeats.length,
    bookedSeats: selectedSeats,
  });

  for (const seat of selectedSeats) {
    showData.occupiedSeats[seat] = userId;
  }
  showData.markModified("occupiedSeats");
  await showData.save();

  const session = await stripe.checkout.sessions.create({
    success_url: `${origin}/loading/my-bookings`,
    cancel_url: `${origin}/my-bookings`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: movie.title },
          unit_amount: booking.amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: { bookingId: booking._id.toString() },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  booking.paymentLink = session.url ?? "";
  await booking.save();

  await inngest.send({
    name: "app/checkpayment",
    data: { bookingId: booking._id.toString() },
  });

  return res.status(200).json({ success: true, url: session.url });
});

export const getOccupiedSeats = asyncHandler(async (req: Request, res: Response) => {
  const { showId } = req.params;

  const show = await Show.findById(showId);
  if (!show) {
    return res.status(404).json({ success: false, message: "Show not found" });
  }

  const occupiedSeats = Object.keys(show.occupiedSeats ?? {});
  return res.status(200).json({ success: true, occupiedSeats });
});
