export interface TMDBListResponse<T> {
  results: T[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface TMDBMovieDetails {
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: Array<{ id: number; name: string }>;
  original_language?: string;
  tagline?: string;
  vote_average: number;
  runtime: number;
}

export interface TMDBCredits {
  cast: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
    character?: string;
  }>;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}
