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

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}
