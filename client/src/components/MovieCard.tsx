import { StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";
import { timeFormat } from "../lib/timeFormat";
import type { MovieItem } from "../types/movie";

interface MovieCardProps {
  movie: MovieItem;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  const { imageBaseUrl } = useAppContext();

  const goToMovie = () => {
    navigate(`/movies/${movie._id}`);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const year = new Date(movie.release_date).getFullYear();
  const genreText =
    movie.genres
      ?.slice(0, 2)
      .map((g) => g.name)
      .join(" | ") || "Unknown Genre";

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66">
      <img
        onClick={goToMovie}
        src={imageBaseUrl + movie.backdrop_path}
        alt={movie.title}
        className="rounded-lg h-52 w-full object-cover object-bottom-right cursor-pointer"
      />

      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      <p className="text-sm text-gray-400 mt-2">
        {year} &bull; {genreText} &bull; {timeFormat(movie.runtime)}
      </p>

      <div className="flex items-center justify-between mt-4 pb-3">
        <button
          onClick={goToMovie}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
          <StarIcon className="size-4 text-primary fill-primary" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
