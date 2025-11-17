import { inngest } from "../client.js";
import User from "../../models/User.js";

/**
 * Clerk webhook payload slice for email addresses
 */
interface ClerkEmail {
  email_address: string;
}

/**
 * Clerk user event shape used by this function
 */
interface ClerkUserEvent {
  data: {
    id: string;
    first_name?: string;
    last_name?: string;
    email_addresses: ClerkEmail[];
    image_url?: string;
  };
}

/**
 * Sync a new user from Clerk into our MongoDB Users collection.
 * Logic unchanged — only types and readability improved.
 */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event }: { event: ClerkUserEvent }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const email = email_addresses?.[0]?.email_address;
    if (!email) return;

    await User.create({
      _id: id,
      email,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      image: image_url ?? "",
    });
  }
);
