import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";

import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!secretKey || !webhookSecret) {
  throw new Error("Missing Stripe environment variables");
}

const stripe = new Stripe(secretKey);

export async function stripeWebhooks(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["stripe-signature"];

  if (typeof signature !== "string") {
    res.status(400).send("Missing Stripe signature header");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        res.status(400).send("Missing bookingId in metadata");
        return;
      }

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: "",
      });

      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
