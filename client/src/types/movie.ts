export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  name: string;
  profile_path: string;
}

export interface MovieItem {
  _id: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  genres: Genre[];
  casts: CastMember[];
  release_date: string;
  original_language?: string;
  tagline?: string;
  vote_average: number;
  runtime: number;
}

export interface ShowDateEntry {
  time: string;
  showId: string;
}

export interface ShowResponse {
  success: boolean;
  movie: MovieItem;
  dateTime: Record<string, ShowDateEntry[]>;
}
