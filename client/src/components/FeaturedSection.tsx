import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import type { MovieItem } from "../types/movie";

export default function FeaturedSection() {
  const navigate = useNavigate();
  const { movies } = useAppContext();

  const featuredMovies: MovieItem[] = Array.isArray(movies) ? movies.slice(0, 4) : [];

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <BlurCircle top="0" right="-80px" />

        <p className="text-gray-300 font-medium text-lg">Now Showing</p>

        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300"
        >
          View All <ArrowRight className="size-4.5 transition group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
        {featuredMovies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  );
}
