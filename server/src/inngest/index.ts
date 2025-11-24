import { inngest } from "./client.js";
import { releaseSeatsAndDeleteBooking } from "./functions/booking.expire.js";
import { sendBookingConfirmationEmail } from "./functions/booking.email.js";

export const functions = [releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];

export { inngest };
