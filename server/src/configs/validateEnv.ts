import { AppError } from "../server.js";

const requiredEnvs = [
  "MONGODB_URI",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "TMDB_ACCESS_TOKEN",
] as const;

export function validateEnv(): void {
  const missing = requiredEnvs.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new AppError(`Missing required environment variables: ${missing.join(", ")}`, 500);
  }
}
