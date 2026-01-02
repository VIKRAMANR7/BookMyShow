import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import { isoTimeFormat } from "../lib/isoTimeFormat";
import { assets } from "../assets/assets";
import api from "../lib/api";

import type { SeatTime, ShowResponse, SeatStatusResponse } from "../types/show";

const GROUP_ROWS: string[][] = [
  ["A", "B"],
  ["C", "D"],
  ["E", "F"],
  ["G", "H"],
  ["I", "J"],
];

export default function SeatLayout() {
  const { id, date } = useParams<{ id: string; date: string }>();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<SeatTime | null>(null);
  const [showData, setShowData] = useState<ShowResponse | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  const { getToken, userId } = useAppContext();

  const fetchShow = useCallback(async () => {
    try {
      const { data } = await api.get<ShowResponse>(`/api/show/${id}`);
      if (data.success) {
        setShowData(data);
      }
    } catch {
      setShowData(null);
    }
  }, [id]);

  const fetchOccupiedSeats = useCallback(async (showId: string) => {
    try {
      const { data } = await api.get<SeatStatusResponse>(`/api/booking/seats/${showId}`);

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error("Failed to load seat availability");
      }
    } catch {
      setOccupiedSeats([]);
    }
  }, []);

  function handleSeatClick(seatId: string) {
    if (!selectedTime) return toast("Please select a time first");

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast("You can select a maximum of 5 seats");
    }

    if (occupiedSeats.includes(seatId)) {
      return toast("This seat is already booked");
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  }

  function renderSeats(row: string, count = 9) {
    return (
      <div key={row} className="flex gap-2 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            const isSelected = selectedSeats.includes(seatId);
            const isOccupied = occupiedSeats.includes(seatId);

            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                className={[
                  "size-8 rounded border border-primary/60 cursor-pointer",
                  isSelected && "bg-primary text-white",
                  isOccupied && "opacity-50 cursor-not-allowed",
                ].join(" ")}
              >
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  async function bookTickets() {
    try {
      if (!userId) return toast.error("Please login to continue");
      if (!selectedTime || selectedSeats.length === 0)
        return toast.error("Please select time and seats");

      const token = await getToken();

      const { data } = await api.post(
        "/api/booking/create",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  }

  useEffect(() => {
    fetchShow();
  }, [fetchShow]);

  useEffect(() => {
    if (selectedTime) {
      fetchOccupiedSeats(selectedTime.showId);
    }
  }, [selectedTime, fetchOccupiedSeats]);

  if (!showData || !date) return <Loading />;

  const timings = showData.dateTime[date] ?? [];

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>

        <div className="mt-5 space-y-1">
          {timings.map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={[
                "flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition",
                selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20",
              ].join(" ")}
            >
              <ClockIcon className="size-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>

        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center text-gray-300 text-xs mt-10">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {GROUP_ROWS[0]!.map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {GROUP_ROWS.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((r) => renderSeats(r))}</div>
            ))}
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="size-4" />
        </button>
      </div>
    </div>
  );
}
