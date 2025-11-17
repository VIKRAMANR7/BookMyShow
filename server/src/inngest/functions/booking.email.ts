import type mongoose from "mongoose";

import { inngest } from "../client.js";
import Booking from "../../models/Booking.js";
import sendEmail from "../../configs/nodeMailer.js";

/**
 * Minimal types used when populating booking -> show -> movie and booking -> user
 */
interface PopulatedMovie {
  title: string;
}

interface PopulatedShow {
  movie: PopulatedMovie;
  showDateTime: Date;
}

interface PopulatedUser {
  email: string;
  name: string;
}

interface BookingConfirmationEvent {
  data: {
    bookingId: string;
  };
}

/**
 * Sends booking confirmation email after a successful booking event.
 * Logic preserved exactly; replaced uncertain casts with explicit expected types.
 */
export const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },

  async ({ event }: { event: BookingConfirmationEvent }) => {
    const booking = await Booking.findById(event.data.bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie", select: "title" },
      })
      .populate("user", "email name");

    if (!booking) return;

    const show = booking.show as unknown as mongoose.Document & PopulatedShow;
    const movie = show.movie;
    const user = booking.user as unknown as mongoose.Document & PopulatedUser;

    const date = new Date(show.showDateTime);

    await sendEmail({
      to: user.email,
      subject: `Payment Confirmation: "${movie.title}" booked!`,
      body: `<div>
        <h2>Hi ${user.name},</h2>
        <p>Your booking for <strong>${movie.title}</strong> is confirmed.</p>
        <p>
          <strong>Date:</strong> ${date.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>
        <p>Enjoy the show 🍿</p>
      </div>`,
    });
  }
);
