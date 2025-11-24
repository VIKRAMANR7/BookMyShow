import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type { MovieItem } from "../types/movie";
import api from "../lib/api";

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
  imageBaseUrl: string;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<MovieItem[]>([]);

  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = user?.id ?? null;
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  async function fetchIsAdmin(): Promise<void> {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        toast.error("You are not an admin");
        navigate("/");
      }
    } catch {
      /* UI already handles fallback */
    }
  }

  async function refreshMovies(): Promise<void> {
    try {
      const { data } = await api.get("/api/show/all");
      if (data.success) setMovies(data.shows);
      else toast.error(data.message);
    } catch {
      /* silent fail is fine for homepage */
    }
  }

  async function fetchFavoriteMovies(): Promise<void> {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) setFavoriteMovies(data.movies);
      else toast.error(data.message);
    } catch {
      /* avoid breaking UI */
    }
  }

  useEffect(() => {
    refreshMovies();
  }, []);

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

    navigate: (path) => navigate(path),
    imageBaseUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
