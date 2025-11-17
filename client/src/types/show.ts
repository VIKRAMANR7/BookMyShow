import type { MovieItem } from "./movie";

export interface SeatTime {
  time: string;
  showId: string;
}

export interface ShowResponse {
  success: boolean;
  movie: MovieItem;
  dateTime: Record<string, { time: string; showId: string }[]>;
}

export interface SeatStatusResponse {
  success: boolean;
  occupiedSeats: string[];
}

export interface AdminShowItem {
  _id: string;
  movie: MovieItem;
  showDateTime: string;
  showPrice: number;
  occupiedSeats: string[];
}
