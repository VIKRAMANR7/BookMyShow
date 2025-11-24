import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import { dateFormat } from "../lib/dateFormat";
import { timeFormat } from "../lib/timeFormat";
import type { BookingItem } from "../types/booking";
import api from "../lib/api";

export default function MyBookings() {
  const currency = import.meta.env.VITE_CURRENCY ?? "₹";

  const { getToken, userId, imageBaseUrl } = useAppContext();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getMyBookings(): Promise<void> {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("getMyBookings error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      getMyBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-medium mb-4">My Bookings</h1>

      {bookings.map((item) => (
        <div
          key={item._id}
          className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={imageBaseUrl + item.show.movie.poster_path}
              alt={item.show.movie.title}
              className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
            />

            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">{timeFormat(item.show.movie.runtime)}</p>
              <p className="text-gray-400 text-sm mt-auto">{dateFormat(item.show.showDateTime)}</p>
            </div>
          </div>

          <div className="flex flex-col md:items-end md:text-right justify-between p-4">
            <div className="flex flex-col gap-4">
              <p className="text-2xl font-semibold mb-3">
                {currency} {item.amount}
              </p>

              {!item.isPaid && item.paymentLink && (
                <Link
                  to={item.paymentLink}
                  className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                >
                  Pay Now
                </Link>
              )}
            </div>

            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Tickets: </span>
                {item.bookedSeats.length}
              </p>

              <p>
                <span className="text-gray-400">Seat Number: </span>
                {item.bookedSeats.join(", ")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
