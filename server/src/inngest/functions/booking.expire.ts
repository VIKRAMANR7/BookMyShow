import { inngest } from "../client.js";
import Booking from "../../models/Booking.js";
import Show from "../../models/Show.js";

/*
  After 10 minutes, checks if booking is still unpaid.
  If unpaid → release seats + delete booking.
*/
export const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },

  async ({ event, step }) => {
    const bookingId = event.data.bookingId;
    if (!bookingId) return;

    // Wait 10 minutes before checking payment
    const waitUntil = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-10-min", waitUntil);

    await step.run("check-payment", async () => {
      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      // If user paid on time, nothing to do
      if (booking.isPaid) return;

      // Release seats back into the show
      const show = await Show.findById(booking.show);
      if (show) {
        for (const seat of booking.bookedSeats) {
          delete show.occupiedSeats[seat];
        }

        show.markModified("occupiedSeats");
        await show.save();
      }

      // Delete unpaid booking
      await Booking.findByIdAndDelete(bookingId);
    });
  }
);
