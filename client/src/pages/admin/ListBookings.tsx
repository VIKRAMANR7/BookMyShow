import { useEffect, useState } from "react";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import { dateFormat } from "../../lib/dateFormat";
import type { AdminBookingItem } from "../../types/booking";
import api from "../../lib/api";

export default function ListBookings() {
  const { getToken, userId } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY ?? "₹";

  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAllBookings(): Promise<void> {
    try {
      const token = await getToken();

      const { data } = await api.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("fetchAllBookings error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      fetchAllBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">User Name</th>
              <th className="p-2 font-medium">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Seats</th>
              <th className="p-2 font-medium">Amount</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {bookings.map((b) => (
              <tr
                key={b._id}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{b.user?.name ?? "Unknown User"}</td>

                <td className="p-2">{b.show.movie.title}</td>

                <td className="p-2">{dateFormat(b.show.showDateTime)}</td>

                <td className="p-2">{b.bookedSeats.join(", ")}</td>

                <td className="p-2">
                  {currency} {b.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
