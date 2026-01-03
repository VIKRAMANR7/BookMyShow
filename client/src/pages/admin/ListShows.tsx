import { useEffect, useState } from "react";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import { dateFormat } from "../../lib/dateFormat";
import type { AdminShowItem } from "../../types/show";
import api from "../../lib/api";

const currency = import.meta.env.VITE_CURRENCY ?? "$";

export default function ListShows() {
  const { getToken, user } = useAppContext();

  const [shows, setShows] = useState<AdminShowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getAllShows() {
      try {
        const token = await getToken();
        const { data } = await api.get<{ shows: AdminShowItem[] }>("/api/admin/all-shows", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setShows(data.shows);
      } catch {
        setShows([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) getAllShows();
  }, [user, getToken]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Reserved Seats</th>
              <th className="p-2 font-medium">Earnings (Approx)</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows.map((show) => {
              const reservedCount = Object.keys(show.occupiedSeats).length;

              return (
                <tr
                  key={show._id}
                  className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                  <td className="p-2">{dateFormat(show.showDateTime)}</td>
                  <td className="p-2">{reservedCount}</td>
                  <td className="p-2">
                    {currency} {reservedCount * show.showPrice}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
