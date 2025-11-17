import https from "https";

import axios from "axios";
import type { Request, Response } from "express";

import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";
import { cacheFetch, CacheKeys, delCache } from "../utils/cache.js";
import type {
  TMDBListResponse,
  TMDBMovie,
  TMDBMovieDetails,
  TMDBCredits,
  TMDBVideo,
} from "../types/tmdb.js";

/* TMDB CLIENT */
const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
  httpsAgent: new https.Agent({ keepAlive: false }),
  timeout: 12000,
});

async function tmdbGet<T>(url: string): Promise<T> {
  const res = await tmdb.get<T>(url);
  return res.data;
}

/* Date + Time → UTC ISO */
function makeShowDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00.000Z`);
}

/* INNGEST Debounce */
const notifyCache = new Set<string>();

function debounceInngestSend(title: string) {
  if (notifyCache.has(title)) return;
  notifyCache.add(title);

  setTimeout(() => notifyCache.delete(title), 8000);

  inngest
    .send({ name: "app/show.added", data: { movieTitle: title } })
    .catch((e) => console.warn("Inngest send error:", e));
}

/* GET /api/show/trending */
export const getTrendingMovies = async (_req: Request, res: Response) => {
  try {
    const movies = await cacheFetch<TMDBMovie[]>(
      CacheKeys.trending,
      async () => {
        const data = await tmdbGet<TMDBListResponse<TMDBMovie>>("/trending/movie/week");
        return data.results ?? [];
      },
      4 * 60 * 60
    );

    return res.json({ success: true, movies });
  } catch (err) {
    console.error("Trending error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending movies",
    });
  }
};

/* GET /api/show/home-trailers */
export const getHomePageTrailers = async (_req: Request, res: Response) => {
  try {
    const trailers = await cacheFetch<
      Array<{
        movieId: number;
        title: string;
        image: string;
        videoUrl: string;
      }>
    >(
      CacheKeys.homeTrailers,
      async () => {
        const pages = await Promise.all(
          Array.from({ length: 5 }, (_, i) =>
            tmdbGet<TMDBListResponse<TMDBMovie>>(`/trending/movie/week?page=${i + 1}`)
          )
        );

        const movies = pages.flatMap((p) => p.results).slice(0, 80);

        const results = await Promise.all(
          movies.map((m) =>
            tmdbGet<{ results: TMDBVideo[] }>(`/movie/${m.id}/videos`)
              .then((v) => ({ movie: m, videos: v.results }))
              .catch(() => null)
          )
        );

        /* Remove nulls → build trailer list */
        const final = results
          .flatMap((entry) => {
            if (!entry) return [];

            const video =
              entry.videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
              entry.videos.find((v) => v.site === "YouTube" && v.type === "Teaser");

            if (!video) return [];

            return [
              {
                movieId: entry.movie.id,
                title: entry.movie.title,
                image: `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`,
                videoUrl: `https://www.youtube.com/watch?v=${video.key}`,
              },
            ];
          })
          .slice(0, 8);

        return final;
      },
      6 * 60 * 60
    );

    return res.json({ success: true, trailers });
  } catch (err) {
    console.error("Home trailers error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      trailers: [],
      message: "Failed to load homepage trailers",
    });
  }
};

/* GET /api/show/now-playing (ADMIN) */
export const getNowPlayingMovies = async (_req: Request, res: Response) => {
  try {
    const data = await tmdbGet<TMDBListResponse<TMDBMovie>>("/movie/now_playing");

    return res.json({ success: true, movies: data.results });
  } catch (err) {
    console.error("Now playing error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      message: "Failed to fetch now playing movies",
    });
  }
};

/* POST /api/show/add (ADMIN) */
export const addShow = async (req: Request, res: Response) => {
  try {
    const { movieId, showsInput, showPrice } = req.body as {
      movieId: string;
      showsInput: Array<{ date: string; time: string[] }>;
      showPrice: number;
    };

    let movie = await Movie.findById(movieId);

    /* Fetch & cache TMDB details only once */
    if (!movie) {
      const [details, credits] = await Promise.all([
        cacheFetch<TMDBMovieDetails>(
          CacheKeys.tmdbMovie(Number(movieId)),
          () => tmdbGet(`/movie/${movieId}`),
          3600
        ),

        cacheFetch<TMDBCredits>(
          CacheKeys.tmdbCredits(Number(movieId)),
          () => tmdbGet(`/movie/${movieId}/credits`),
          3600
        ),
      ]);

      movie = await Movie.create({
        _id: movieId,
        title: details.title,
        overview: details.overview,
        release_date: details.release_date,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        genres: details.genres,
        casts: credits.cast,
        original_language: details.original_language,
        tagline: details.tagline ?? "",
        vote_average: details.vote_average,
        runtime: details.runtime,
      });
    }

    /* Build show docs */
    const docs = showsInput.flatMap((s) =>
      s.time.map((t) => ({
        movie: movieId,
        showDateTime: makeShowDate(s.date, t),
        showPrice,
        occupiedSeats: {},
      }))
    );

    if (docs.length > 0) {
      await Show.insertMany(docs);
    }

    debounceInngestSend(movie.title);

    delCache(CacheKeys.homeTrailers).catch(() => {});

    return res.json({ success: true, message: "Show added successfully" });
  } catch (err) {
    console.error("Add show error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      message: "Failed to add show",
    });
  }
};

/* GET /api/show/all */
export const getShows = async (_req: Request, res: Response) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const movies = Array.from(new Set(shows.map((s) => s.movie)));

    return res.json({ success: true, shows: movies });
  } catch (err) {
    console.error("Get shows error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shows",
    });
  }
};

/* GET /api/show/:movieId */
export const getShow = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);

    const grouped: Record<string, Array<{ time: Date; showId: string }>> = {};

    for (const s of shows) {
      const iso = s.showDateTime.toISOString();
      const date = iso.split("T")[0];
      if (!date) continue;

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        time: s.showDateTime,
        showId: s._id.toString(),
      });
    }

    return res.json({ success: true, movie, dateTime: grouped });
  } catch (err) {
    console.error("Get show error:", err instanceof Error ? err.message : String(err));

    return res.status(500).json({
      success: false,
      message: "Failed to fetch show",
    });
  }
};
