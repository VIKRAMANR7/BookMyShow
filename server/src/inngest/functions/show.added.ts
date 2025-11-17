import { inngest } from "../client.js";
import User from "../../models/User.js";
import sendEmail from "../../configs/nodeMailer.js";

/**
 * Event payload for a newly added show.
 */
interface NewShowEvent {
  data: {
    movieTitle: string;
  };
}

/**
 * Send a simple notification email to all users when a new show is added.
 * Logic unchanged. Uses typed loops and clear variable names.
 */
export const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },

  async ({ event }: { event: NewShowEvent }) => {
    const { movieTitle } = event.data;

    const users = await User.find({});

    for (const userDoc of users) {
      await sendEmail({
        to: userDoc.email,
        subject: `New Show Added: ${movieTitle}`,
        body: `<div>
          <h2>Hello ${userDoc.name},</h2>
          <p>A new show titled <strong>${movieTitle}</strong> is now available.</p>
        </div>`,
      });
    }

    return { sent: users.length };
  }
);
