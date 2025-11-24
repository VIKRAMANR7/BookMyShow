import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarIcon } from "lucide-react";

import { GENRE_MAP } from "../constants/tmdbGenres";
import { useAppContext } from "../context/AppContext";
import api from "../lib/api";

interface HeroMovie {
  title: string;
  year: number;
  genres: string[];
  description: string;
  backdrop: string;
}

interface TMDBTrendingMovie {
  title: string;
  release_date: string;
  overview: string;
  backdrop_path: string;
  genre_ids: number[];
}

/**
 * Homepage hero banner.
 * Automatically cycles through trending movies every 5 seconds.
 */
export default function HeroSection() {
  const navigate = useNavigate();
  const { getToken } = useAppContext();

  const [heroMovies, setHeroMovies] = useState<HeroMovie[]>([]);
  const [index, setIndex] = useState(0);

  // Fetch trending movies
  useEffect(() => {
    async function loadMovies() {
      try {
        const token = await getToken();
        const { data } = await api.get("/api/show/trending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
          const top8 = data.movies.slice(0, 8);

          const mappedMovies: HeroMovie[] = top8.map((m: TMDBTrendingMovie) => ({
            title: m.title,
            year: Number(m.release_date?.split("-")[0]),
            genres: m.genre_ids?.map((id) => GENRE_MAP[id]) ?? [],
            description: m.overview,
            backdrop: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          }));

          setHeroMovies(mappedMovies);
        }
      } catch (err) {
        console.error("Trending error:", err);
      }
    }

    loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance hero slider every 5 seconds
  useEffect(() => {
    if (heroMovies.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroMovies]);

  // Prevent rendering until data is loaded
  if (heroMovies.length === 0) return null;
  const hero = heroMovies[index];

  if (!hero) return null;

  return (
    <div
      className="relative flex flex-col justify-center min-h-screen pt-20 pb-24 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${hero.backdrop})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 lg:px-36 max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">{hero.title}</h1>

        <div className="flex items-center gap-4 text-gray-300 mt-3 flex-wrap text-sm md:text-base">
          <span>{hero.genres.join(" | ")}</span>

          <div className="flex items-center gap-1">
            <CalendarIcon className="size-4" /> {hero.year}
          </div>
        </div>

        <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3">
          {hero.description}
        </p>

        <button
          onClick={() => navigate("/movies")}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary rounded-full text-sm font-medium hover:bg-primary-dull transition"
        >
          Explore Movies <ArrowRight className="size-5" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroMovies.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition cursor-pointer hover:scale-110 ${
              i === index ? "bg-primary w-8" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
