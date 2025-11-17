import type mongoose from "mongoose";

import { inngest } from "../client.js";
import Show from "../../models/Show.js";
import User from "../../models/User.js";
import sendEmail from "../../configs/nodeMailer.js";

/**
 * Minimal movie info used when populating Show.movie
 */
interface MovieBasic {
  title: string;
}

/**
 * Shape of a populated show document
 */
interface PopulatedShow {
  movie: MovieBasic;
  showDateTime: Date;
  occupiedSeats: Record<string, string>;
}

/**
 * Minimal user shape needed for sending emails
 */
interface UserBasic {
  email: string;
  name: string;
}

export const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },

  // Accept payload as unknown to avoid leaking types
  async (payload: unknown) => {
    // Safely extract step from payload
    const { step } = payload as {
      step: {
        run: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
        sleepUntil: (name: string, date: Date) => Promise<void>;
      };
    };

    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    const reminders = await step.run("prepare-reminders", async () => {
      const shows = await Show.find({
        showDateTime: { $gte: windowStart, $lte: in8Hours },
      }).populate<{ movie: MovieBasic }>("movie", "title");

      const list: { email: string; name: string; movie: string; time: Date }[] = [];

      for (const doc of shows) {
        const show = doc as unknown as mongoose.Document & PopulatedShow;

        const userIds = Object.values(show.occupiedSeats);
        if (userIds.length === 0) continue;

        const users = await User.find({ _id: { $in: userIds } }).select("email name");

        for (const u of users) {
          const user = u as mongoose.Document & UserBasic;

          list.push({
            email: user.email,
            name: user.name,
            movie: show.movie.title,
            time: show.showDateTime,
          });
        }
      }

      return list;
    });

    if (!reminders.length) {
      return { message: "No reminders to send" };
    }

    await step.run("send-emails", async () => {
      for (const item of reminders) {
        await sendEmail({
          to: item.email,
          subject: `Reminder: "${item.movie}" starts soon`,
          body: `
          <div>
            <h2>Hello ${item.name},</h2>
            <p>Your movie <strong>${item.movie}</strong> starts soon.</p>
            <p>${item.time.toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            })}</p>
          </div>`,
        });
      }
    });

    return { sent: reminders.length };
  }
);
