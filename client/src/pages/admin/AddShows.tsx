import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import { kConverter } from "../../lib/kConverter";
import api from "../../lib/api";

import type { NowPlayingMovie } from "../../types/nowPlaying";

interface DateTimeSelection {
  [date: string]: string[];
}

const currency = import.meta.env.VITE_CURRENCY ?? "$";

export default function AddShows() {
  const { getToken, user, imageBaseUrl } = useAppContext();

  const [nowPlayingMovies, setNowPlayingMovies] = useState<NowPlayingMovie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const [dateTimeSelection, setDateTimeSelection] = useState<DateTimeSelection>({});
  const [dateTimeInput, setDateTimeInput] = useState("");

  const [showPrice, setShowPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchNowPlayingMovies() {
      try {
        const token = await getToken();

        const { data } = await api.get<{
          success: boolean;
          movies: NowPlayingMovie[];
        }>("/api/show/now-playing", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setNowPlayingMovies(data.movies);
        }
      } catch {
        setNowPlayingMovies([]);
      }
    }

    if (user) fetchNowPlayingMovies();
  }, [user, getToken]);

  function handleDateTimeAdd() {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const existing = prev[date] ?? [];
      if (existing.includes(time)) return prev;

      return { ...prev, [date]: [...existing, time] };
    });
  }

  function handleRemoveTime(date: string, time: string) {
    setDateTimeSelection((prev) => {
      const existing = prev[date];
      if (!existing) return prev;

      const filtered = existing.filter((t) => t !== time);

      if (filtered.length === 0) {
        const clone = { ...prev };
        delete clone[date];
        return clone;
      }

      return { ...prev, [date]: filtered };
    });
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!selectedMovieId) {
        toast.error("Please select a movie");
        return;
      }

      if (Object.keys(dateTimeSelection).length === 0) {
        toast.error("Please select at least one date & time");
        return;
      }

      if (!showPrice) {
        toast.error("Please enter a show price");
        return;
      }

      const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times,
      }));

      const payload = {
        movieId: selectedMovieId,
        showsInput,
        showPrice: Number(showPrice),
      };

      const token = await getToken();

      const { data } = await api.post("/api/show/add", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        setSelectedMovieId(null);
        setDateTimeSelection({});
        setShowPrice("");
        setDateTimeInput("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (nowPlayingMovies.length === 0) return <Loading />;

  return (
    <>
      <Title text1="Add" text2="Shows" />

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => {
            const isSelected = selectedMovieId === movie.id;

            return (
              <div
                key={movie.id}
                onClick={() => setSelectedMovieId(movie.id)}
                className={[
                  "relative max-w-40 cursor-pointer transition duration-300",
                  "group-hover:not-hover:opacity-40 hover:-translate-y-1",
                ].join(" ")}
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={imageBaseUrl + movie.poster_path}
                    alt={movie.title}
                    className="w-full object-cover brightness-90"
                  />

                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 absolute bottom-0 left-0 w-full">
                    <p className="flex items-center gap-1 text-gray-400">
                      <StarIcon className="size-4 text-primary fill-primary" />
                      {movie.vote_average.toFixed(1)}
                    </p>
                    <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primary size-6 rounded">
                    <CheckIcon className="size-4 text-white" strokeWidth={2.5} />
                  </div>
                )}

                <p className="font-medium truncate">{movie.title}</p>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>

        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>

          <input
            type="number"
            min={0}
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter Show Price"
            className="outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Select Date & Time</label>

        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md bg-transparent"
          />

          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-medium">Selected Date-Time</h2>

          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium">{date}</div>

                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>

                      <DeleteIcon
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => handleRemoveTime(date, time)}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
      >
        Add Show
      </button>
    </>
  );
}
