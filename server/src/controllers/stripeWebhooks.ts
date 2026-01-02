import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";

import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function stripeWebhooks(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["stripe-signature"];

  if (typeof signature !== "string") {
    return res.status(400).send("Missing Stripe signature header");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        return res.status(400).send("Missing bookingId in metadata");
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

    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
