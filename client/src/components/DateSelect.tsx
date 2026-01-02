import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import BlurCircle from "./BlurCircle";

interface DateTimeItem {
  time: string | Date;
  showId: string;
}

interface DateSelectProps {
  dateTime: Record<string, DateTimeItem[]>;
  id: string;
}

export default function DateSelect({ dateTime, id }: DateSelectProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleBook = () => {
    if (!selectedDate) {
      toast("Please select a date");
      return;
    }

    navigate(`/movies/${id}/${selectedDate}`);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const dates = Object.keys(dateTime);

  return (
    <section id="dateSelect" className="pt-30">
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-8 bg-primary/10 border border-primary/20 rounded-lg overflow-hidden">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0" />

        <div>
          <p className="text-lg font-semibold">Choose Date</p>

          <div className="flex items-center gap-6 text-sm mt-5">
            <ChevronLeftIcon width={28} />

            <div className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {dates.map((date) => {
                const parsed = new Date(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={[
                      "flex flex-col items-center justify-center size-14 aspect-square rounded cursor-pointer",
                      isSelected ? "bg-primary text-white" : "border border-primary/70",
                    ].join(" ")}
                  >
                    <span>{parsed.getDate()}</span>
                    <span>{parsed.toLocaleDateString("en-US", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>

            <ChevronRightIcon width={28} />
          </div>
        </div>

        <button
          onClick={handleBook}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </section>
  );
}
