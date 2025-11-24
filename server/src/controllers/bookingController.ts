import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";

import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";
import { getUserId } from "../utils/auth.js";

/* Ensures the populated movie contains a title. */
interface PopulatedMovie {
  title: string;
}

function isPopulatedMovie(movie: unknown): movie is PopulatedMovie {
  return (
    typeof movie === "object" &&
    movie !== null &&
    "title" in movie &&
    typeof (movie as { title: unknown }).title === "string"
  );
}

/* Checks if selected seats are free for the given show. */
async function checkSeatsAvailability(showId: string, selectedSeats: string[]): Promise<boolean> {
  try {
    const show = await Show.findById(showId);
    if (!show) return false;

    const occupied = show.occupiedSeats ?? {};
    return !selectedSeats.some((seat) => Boolean(occupied[seat]));
  } catch {
    return false;
  }
}

/* Creates a booking, locks seats, creates Stripe session,
    and triggers auto-expiry workflow . */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = getUserId(req);
    const { showId, selectedSeats } = req.body as {
      showId: string;
      selectedSeats: string[];
    };

    const origin = req.headers.origin ?? "";

    if (!userId || !showId || !Array.isArray(selectedSeats)) {
      res.status(400).json({ success: false, message: "Invalid booking request" });
      return;
    }

    // 1. Check if seats are free
    const available = await checkSeatsAvailability(showId, selectedSeats);
    if (!available) {
      res.status(400).json({ success: false, message: "Selected seats are already taken" });
      return;
    }

    // 2. Fetch show + movie details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData || !showData.movie) {
      res.status(404).json({ success: false, message: "Show not found" });
      return;
    }

    if (!isPopulatedMovie(showData.movie)) {
      res.status(500).json({ success: false, message: "Movie details not loaded correctly" });
      return;
    }

    const movie = showData.movie;

    // 3. Create booking document
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // 4. Mark seats as occupied
    for (const seat of selectedSeats) {
      showData.occupiedSeats[seat] = userId;
    }
    showData.markModified("occupiedSeats");
    await showData.save();

    // 5. Create Stripe checkout session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

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
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    booking.paymentLink = session.url ?? "";
    await booking.save();

    // 6. Trigger delayed auto-cancel workflow
    await inngest.send({
      name: "app/checkpayment",
      data: { bookingId: booking._id.toString() },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
}

/* Returns list of seats currently occupied for a show. */
export async function getOccupiedSeats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId);
    if (!show) {
      res.status(404).json({ success: false, message: "Show not found" });
      return;
    }

    const occupiedSeats = Object.keys(show.occupiedSeats ?? {});
    res.status(200).json({ success: true, occupiedSeats });
  } catch (err) {
    next(err);
  }
}
