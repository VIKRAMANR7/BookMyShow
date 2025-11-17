import type { MovieItem } from "./movie";

export interface ActiveShowItem {
  _id: string;
  movie: MovieItem;
  showDateTime: string;
  showPrice: number;
  occupiedSeats: Record<string, string>;
}

export interface DashboardData {
  totalBookings: number;
  totalRevenue: number;
  totalUser: number;
  activeShows: ActiveShowItem[];
}
