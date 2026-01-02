const requiredEnvs = [
  "MONGODB_URI",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "TMDB_ACCESS_TOKEN",
  "SMTP_USER",
  "SMTP_PASS",
  "SENDER_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

export function validateEnv() {
  const missing = requiredEnvs.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
