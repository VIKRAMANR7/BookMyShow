import mongoose from "mongoose";

export interface IBooking {
  user: string;
  show: string;
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
  paymentLink?: string;
}

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: Number, required: true },
    bookedSeats: { type: [String], required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: String,
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
