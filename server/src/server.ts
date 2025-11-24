import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "./configs/db.js";
import { validateEnv } from "./configs/validateEnv.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import { functions, inngest } from "./inngest/index.js";

import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import showRouter from "./routes/showRoutes.js";
import userRouter from "./routes/userRoutes.js";

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL ?? "",
  "http://localhost:5173",
  "https://book-my-show-green-seven.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Stripe requires raw body
app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());
app.use(clerkMiddleware());

// Simple request logger
app.use((req: Request, _res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live");
});

// Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// Global error handler
app.use(errorHandler);

// Start server
async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch {
    console.error("Failed to start server");
    process.exit(1);
  }
}

start();

export default app;
