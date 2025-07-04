import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { functions, inngest } from "./inngest/index.js";
import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import showRouter from "./routes/showRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

await connectDB();

//Stripe Webhooks Route
app.use(
  "/api/stripe",
  express.raw({
    type: "application/json",
  }),
  stripeWebhooks
);

//API Routes
app.get("/", (req, res) => {
  res.send("Server is Live");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
