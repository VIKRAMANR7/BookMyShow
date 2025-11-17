import express from "express";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
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

// Validate all envs
validateEnv();

const app = express();

// Database Connection
await connectDB();

app.use(
  cors({
    origin: (origin, callback) => {
      const whitelist = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "https://book-my-show-green-seven.vercel.app",
      ];
      const isVercelPreview = origin?.endsWith(".vercel.app");

      if (!origin || whitelist.includes(origin) || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Stripe webhook (RAW body)
app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Body Parser
app.use(express.json());

// Clerk
app.use(clerkMiddleware());

// Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// Health Check
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

// Error Class
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global Error Handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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
};

app.use(errorHandler);

export default app;
