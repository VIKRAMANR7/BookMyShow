import { inngest } from "./client.js";
import { syncUserCreation } from "./functions/user.create.js";
import { syncUserDeletion } from "./functions/user.delete.js";
import { syncUserUpdation } from "./functions/user.update.js";
import { releaseSeatsAndDeleteBooking } from "./functions/booking.expire.js";
import { sendBookingConfirmationEmail } from "./functions/booking.email.js";
import { sendShowReminders } from "./functions/show.reminder.js";
import { sendNewShowNotifications } from "./functions/show.added.js";

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,

  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,

  sendShowReminders,
  sendNewShowNotifications,
];

export { inngest };
