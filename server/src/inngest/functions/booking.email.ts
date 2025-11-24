import { inngest } from "../client.js";
import Booking from "../../models/Booking.js";
import sendEmail from "../../configs/nodeMailer.js";

interface PopulatedShow {
  movie: { title: string };
  showDateTime: Date;
}

interface PopulatedUser {
  name: string;
  email: string;
}

export const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },

  async ({ event }) => {
    const bookingId = event.data.bookingId;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", select: "title" },
      })
      .populate("user", "email name");

    if (!booking || !booking.show || !booking.user) return;

    // Cast using `unknown` first to prevent TS structural overlap errors
    const show = booking.show as unknown as PopulatedShow;
    const user = booking.user as unknown as PopulatedUser;

    const dateString = new Date(show.showDateTime).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    await sendEmail({
      to: user.email,
      subject: `Booking Confirmed: ${show.movie.title}`,
      body: `
        <div>
          <h2>Hello ${user.name},</h2>
          <p>Your booking for <strong>${show.movie.title}</strong> is confirmed.</p>
          <p><strong>Showtime:</strong> ${dateString}</p>
          <p>Enjoy your movie! 🍿</p>
        </div>
      `,
    });
  }
);
