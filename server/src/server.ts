import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "./configs/db.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import { functions, inngest } from "./inngest/index.js";
import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import showRouter from "./routes/showRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { validateEnv } from "./configs/validateEnv.js";

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      const whitelist = [process.env.CLIENT_URL, "http://localhost:5173"];

      const isVercelPreview = origin?.endsWith(".vercel.app");

      if (!origin || whitelist.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// WEBHOOKS (Stripe requires raw body)
app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());
app.use(clerkMiddleware());
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});
// HEALTH CHECK
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// GLOBAL ERROR HANDLER
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("⚠️ Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// START SERVER
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

void start();

// GRACEFUL SHUTDOWN
async function gracefulShutdown(): Promise<void> {
  console.log("⛔ Shutting down gracefully...");
  await mongoose.connection.close().catch((err) => console.error(err));
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  void gracefulShutdown();
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  void gracefulShutdown();
});
