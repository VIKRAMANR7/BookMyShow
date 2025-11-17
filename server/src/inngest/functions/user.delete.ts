import { inngest } from "../client.js";
import User from "../../models/User.js";

/**
 * Clerk user.deleted event shape
 */
interface UserDeletedEvent {
  data: { id: string };
}

/**
 * Remove user from our DB when Clerk deletes the account.
 */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event }: { event: UserDeletedEvent }) => {
    const userId = event.data.id;
    if (!userId) return;

    await User.findByIdAndDelete(userId);
  }
);
