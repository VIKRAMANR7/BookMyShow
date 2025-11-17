import type { MovieItem } from "./movie";

export interface BookingShowItem {
  _id: string;
  showDateTime: string;
  showPrice: number;
  movie: MovieItem;
}

export interface BookingItem {
  _id: string;
  user: string;
  show: BookingShowItem;
  amount: number;
  bookedSeats: string[];
  isPaid: boolean;
  paymentLink?: string;
}

export interface AdminBookingItem {
  _id: string;
  user: {
    name: string;
  };
  show: {
    movie: {
      title: string;
      poster_path: string;
      runtime: number;
    };
    showDateTime: string;
  };
  bookedSeats: string[];
  amount: number;
  isPaid: boolean;
}
