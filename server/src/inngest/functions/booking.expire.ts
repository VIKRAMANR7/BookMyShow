import { inngest } from "../client.js";
import Booking from "../../models/Booking.js";
import Show from "../../models/Show.js";

/**
 * Event shape for payment check scheduling
 */
interface CheckPaymentEvent {
  data: {
    bookingId: string;
  };
}

/**
 * Schedules a delayed check (10 minutes) to confirm payment; if unpaid, release seats and delete booking.
 */
export const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },

  async ({
    event,
    step,
  }: {
    event: CheckPaymentEvent;
    step: {
      sleepUntil: (name: string, date: Date) => Promise<void>;
      run: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
    };
  }) => {
    const scheduledTime = new Date(Date.now() + 10 * 60 * 1000);

    await step.sleepUntil("wait-10-min", scheduledTime);

    await step.run("check-payment-status", async () => {
      const { bookingId } = event.data;
      if (!bookingId) return;

      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      if (booking.isPaid) return;

      const show = await Show.findById(booking.show);

      if (show) {
        for (const seat of booking.bookedSeats) {
          // delete is fine; markModified ensures mongoose notices the change
          delete show.occupiedSeats[seat];
        }

        show.markModified("occupiedSeats");
        await show.save();
      }

      await Booking.findByIdAndDelete(bookingId);
    });
  }
);
