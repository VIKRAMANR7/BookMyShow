import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

import type { MovieItem } from "../types/movie";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

/** Context shape */
interface AppContextState {
  fetchIsAdmin: () => Promise<void>;
  fetchFavoriteMovies: () => Promise<void>;
  refreshMovies: () => Promise<void>;
  getToken: () => Promise<string | null>;

  userId: string | null;
  userEmail: string | null;
  user: ReturnType<typeof useUser>["user"] | null;

  isAdmin: boolean;
  movies: MovieItem[];
  favoriteMovies: MovieItem[];

  navigate: (path: string) => void;
  axios: typeof axios;
  imageBaseUrl: string;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<MovieItem[]>([]);

  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const userId = user?.id ?? null;
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /** Admin check */
  async function fetchIsAdmin(): Promise<void> {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        toast.error("You are not an admin");
        navigate("/");
      }
    } catch (err) {
      console.error("fetchIsAdmin error:", err);
    }
  }

  /** Fetch all movies from backend */
  async function refreshMovies(): Promise<void> {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setMovies(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("refreshMovies error:", err);
    }
  }

  /** Fetch favorite movies from backend */
  async function fetchFavoriteMovies(): Promise<void> {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("fetchFavoriteMovies error:", err);
    }
  }

  /** Initial load — movies */
  useEffect(() => {
    refreshMovies();
  }, []);

  /** Load user-specific data */
  useEffect(() => {
    if (userId) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value: AppContextState = {
    fetchIsAdmin,
    fetchFavoriteMovies,
    refreshMovies,
    getToken,

    userId,
    userEmail,
    user,
    isAdmin,
    movies,
    favoriteMovies,

    navigate: (path: string) => navigate(path),
    axios,
    imageBaseUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
