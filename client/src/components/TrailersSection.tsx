import { useEffect, useState, useCallback } from "react";
import ReactPlayer from "react-player";
import { PlayCircleIcon } from "lucide-react";

import { useAppContext } from "../context/AppContext";
import BlurCircle from "./BlurCircle";

interface TrailerItem {
  movieId: number;
  title: string;
  image: string;
  videoUrl: string;
}

interface TrailerResponse {
  success: boolean;
  trailers: TrailerItem[];
}

/* Displays the main trailer player*/
export default function TrailersSection() {
  const { axios, getToken } = useAppContext();

  const [trailers, setTrailers] = useState<TrailerItem[]>([]);
  const [currentTrailer, setCurrentTrailer] = useState<TrailerItem | null>(null);

  const loadTrailers = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get<TrailerResponse>("/api/show/home-trailers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.trailers) && data.trailers.length > 0) {
        setTrailers(data.trailers);
        setCurrentTrailer(data.trailers[0] ?? null);
      }
    } catch (err) {
      console.error("Trailer load error:", err);
    }
  }, [axios, getToken]);

  useEffect(() => {
    loadTrailers();
  }, [loadTrailers]);

  if (!currentTrailer) return null;

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <h2 className="text-gray-300 font-medium text-lg">Trailers</h2>

      {/* Main Trailer Player */}
      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />

        <ReactPlayer
          url={currentTrailer.videoUrl}
          controls
          width="960px"
          height="540px"
          className="mx-auto max-w-full"
        />
      </div>

      {/* Trailer Thumbnails */}
      <div className="group grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-8 max-w-5xl mx-auto">
        {trailers.map((t) => (
          <button
            key={t.movieId}
            type="button"
            onClick={() => setCurrentTrailer(t)}
            className="relative hover:-translate-y-1 transition select-none"
          >
            <img
              src={t.image}
              alt={t.title}
              className="w-full h-full rounded-lg object-cover brightness-90"
            />

            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 text-white"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
