import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import Loading from "../../components/Loading";
import { useAppContext } from "../../context/AppContext";
import { dateFormat } from "../../lib/dateFormat";

import type { DashboardData } from "../../types/dashboard";

export default function Dashboard() {
  const currency = import.meta.env.VITE_CURRENCY ?? "₹";

  const { axios, getToken, user, imageBaseUrl } = useAppContext();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBookings: 0,
    totalRevenue: 0,
    totalUser: 0,
    activeShows: [],
  });

  const [loading, setLoading] = useState(true);

  /* Fetch dashboard statistics (bookings, revenue, users, upcoming shows)*/
  async function fetchDashboardData(): Promise<void> {
    try {
      const token = await getToken();

      const { data } = await axios.get<{
        success: boolean;
        dashboardData: DashboardData;
      }>("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error("Failed to load dashboard");
      }
    } catch (err) {
      console.error("fetchDashboardData error:", err);
      toast.error("Error fetching dashboard");
    } finally {
      setLoading(false);
    }
  }

  // Fetch data when admin user becomes available
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <Loading />;

  /* Dashboard stats cards */
  const dashboardCards = [
    {
      title: "Total Bookings",
      value: String(dashboardData.totalBookings),
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue}`,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Total Users",
      value: String(dashboardData.totalUser),
      icon: UsersIcon,
    },
    {
      title: "Active Shows",
      value: String(dashboardData.activeShows.length),
      icon: PlayCircleIcon,
    },
  ];

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* Dashboard Summary Cards */}
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0px" />

        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>

              <card.icon className="size-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Active Shows Section */}
      <p className="mt-10 text-lg font-medium">Active Shows</p>

      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10%" />

        {dashboardData.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-55 rounded-lg overflow-hidden pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
          >
            <img
              src={imageBaseUrl + show.movie.poster_path}
              alt={show.movie.title}
              className="h-60 w-full object-cover"
            />

            <p className="font-medium p-2 truncate">{show.movie.title}</p>

            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium">
                {currency} {show.showPrice}
              </p>

              {/* Rating */}
              <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                <StarIcon className="size-4 text-primary fill-primary" />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>

            <p className="px-2 pt-2 text-sm text-gray-400">{dateFormat(show.showDateTime)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
