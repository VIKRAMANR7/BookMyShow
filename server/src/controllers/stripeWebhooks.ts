import type { Request, Response } from "express";
import Stripe from "stripe";

import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET);

/**
 * POST /api/stripe
 * Webhook endpoint (receives raw body)
 */
export const stripeWebhooks = async (req: Request, res: Response): Promise<Response> => {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    return res.status(400).send("Missing Stripe signature header");
  }

  let event: Stripe.Event;

  /* 1. Verify webhook signature */
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer (from express.raw())
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature";
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  /* 2. Handle only the events we care about */
  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // fetch checkout session related to this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessions.data[0];
      const bookingId = session?.metadata?.bookingId;

      if (!session || !bookingId) {
        return res.status(400).send("Missing bookingId metadata on session");
      }

      // mark booking as paid
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: "",
      });

      // trigger a confirmation email via Inngest
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
    } else {
      console.log("Unhandled event type:", event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected webhook error";
    console.error("Webhook Error:", error);
    return res.status(500).send(`Internal Server Error: ${message}`);
  }
};
