import type { Request, Response } from "express";
import axios from "axios";

import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { cacheFetch, CacheKeys, delCache } from "../utils/cache.js";

import type { TMDBListResponse, TMDBMovie, TMDBVideo } from "../types/tmdb.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

interface ShowTimeSlot {
  time: Date;
  showId: string;
}

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN!}` },
});

export const getTrendingMovies = asyncHandler(async (_req: Request, res: Response) => {
  const movies = await cacheFetch<TMDBMovie[]>(CacheKeys.trending, async () => {
    const data = await tmdb.get<TMDBListResponse<TMDBMovie>>("/trending/movie/week");
    return data.data.results.slice(0, 8);
  });

  return res.json({ success: true, movies });
});

export const getHomePageTrailers = asyncHandler(async (_req: Request, res: Response) => {
  const trailers = await cacheFetch(CacheKeys.homeTrailers, async () => {
    const data = await tmdb.get<TMDBListResponse<TMDBMovie>>("/trending/movie/week");
    const topEight = data.data.results.slice(0, 8);

    const results = await Promise.all(
      topEight.map(async (movie) => {
        try {
          const v = await tmdb.get<{ results: TMDBVideo[] }>(`/movie/${movie.id}/videos`);

          const vid =
            v.data.results.find((x) => x.site === "YouTube" && x.type === "Trailer") ??
            v.data.results.find((x) => x.site === "YouTube" && x.type === "Teaser");

          if (!vid) return null;

          return {
            movieId: movie.id,
            title: movie.title,
            image: `https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`,
            videoUrl: `https://www.youtube.com/watch?v=${vid.key}`,
          };
        } catch {
          return null;
        }
      })
    );

    return results.filter(Boolean);
  });

  return res.json({ success: true, trailers });
});

export const getNowPlayingMovies = asyncHandler(async (_req: Request, res: Response) => {
  const data = await tmdb.get<TMDBListResponse<TMDBMovie>>("/movie/now_playing?region=US");

  return res.json({
    success: true,
    movies: data.data.results.slice(0, 20),
  });
});

export const addShow = asyncHandler(async (req: Request, res: Response) => {
  const { movieId, showsInput, showPrice } = req.body;

  if (typeof movieId !== "string" || !Array.isArray(showsInput) || typeof showPrice !== "number") {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  let movie = await Movie.findById(movieId);

  if (!movie) {
    const details = await tmdb.get<TMDBMovie>(`/movie/${movieId}`);

    movie = await Movie.create({
      _id: movieId,
      title: details.data.title,
      poster_path: details.data.poster_path,
      backdrop_path: details.data.backdrop_path,
      overview: "",
      release_date: details.data.release_date,
      genres: [],
      casts: [],
      vote_average: details.data.vote_average,
      runtime: 0,
    });
  }

  const docs = showsInput.flatMap((s: { date: string; time: string[] }) =>
    s.time.map((t) => ({
      movie: movieId,
      showDateTime: new Date(`${s.date}T${t}:00.000Z`),
      showPrice,
      occupiedSeats: {},
    }))
  );

  if (docs.length > 0) {
    await Show.insertMany(docs);
  }

  delCache(CacheKeys.homeTrailers);

  return res.json({ success: true, message: "Show added successfully" });
});

export const getShows = asyncHandler(async (_req: Request, res: Response) => {
  const shows = await Show.find({
    showDateTime: { $gte: new Date() },
  })
    .populate("movie")
    .sort({ showDateTime: 1 });

  const movies = Array.from(new Set(shows.map((s) => s.movie)));

  return res.json({ success: true, shows: movies });
});

export const getShow = asyncHandler(async (req: Request, res: Response) => {
  const { movieId } = req.params;

  const shows = await Show.find({
    movie: movieId,
    showDateTime: { $gte: new Date() },
  });

  const movie = await Movie.findById(movieId);

  const grouped: Record<string, ShowTimeSlot[]> = {};

  for (const s of shows) {
    const iso = s.showDateTime.toISOString();
    const date = iso.split("T")[0];

    if (!grouped[date]) grouped[date] = [];

    grouped[date].push({
      time: s.showDateTime,
      showId: s._id.toString(),
    });
  }

  return res.json({ success: true, movie, dateTime: grouped });
});
