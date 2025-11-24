import mongoose from "mongoose";

export interface IBooking {
  _id: string;
  user: string;
  show: string;
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
  paymentLink?: string;
}

const bookingSchema = new mongoose.Schema<IBooking>(
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

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
