import { useCallback, useMemo } from "react";
import { z } from "zod";
import type { AuthPayload, Movie, Review, User } from "../types";

type UseApiArgs = {
  apiBase: string;
  accessToken: string;
  setAccessToken: (value: string) => void;
  refreshToken: string;
  setRefreshToken: (value: string) => void;
  setUser: (value: User | null) => void;
  showToast: (message: string) => void;
};

const numberLike = z.preprocess((value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return value;
}, z.number());

const stringLike = z.preprocess((value) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}, z.string());

const userSchema = z.object({
  id: numberLike,
  email: z.string().email(),
  username: z.string().nullable().optional(),
  role: z.enum(["USER", "ADMIN"]),
});

const movieSchema = z.object({
  id: numberLike,
  title: z.string(),
  description: z.string().nullable().optional(),
  release_date: stringLike,
  genres: z.preprocess((value) => (Array.isArray(value) ? value : []), z.array(z.string())),
  average_rating: numberLike,
  review_count: numberLike,
});

const reviewSchema = z.object({
  id: numberLike,
  user_id: numberLike,
  movie_id: numberLike,
  rating: numberLike,
  comment: z.string().nullable().optional(),
});

const paginatedMoviesSchema = z.object({
  items: z.array(movieSchema),
  total: numberLike,
  page: numberLike.optional(),
  limit: numberLike.optional(),
});

const authSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

const parseWithSchema = <T,>(schema: z.ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed", result.error.flatten(), data);
    throw new Error("Invalid response from server.");
  }
  return result.data;
};

const normalizeApiBase = (value: string) => value.replace(/\/+$/, "");

const decodeTokenExp = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const decoded = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isAccessValid = (token: string) => {
  const expMs = decodeTokenExp(token);
  if (!expMs) return false;
  return Date.now() < expMs;
};

const shouldRefreshSoon = (token: string, thresholdMs = 2 * 60 * 1000) => {
  const expMs = decodeTokenExp(token);
  if (!expMs) return true;
  return expMs - Date.now() < thresholdMs;
};

export const useApi = ({
  apiBase,
  accessToken,
  setAccessToken,
  refreshToken,
  setRefreshToken,
  setUser,
  showToast,
}: UseApiArgs) => {
  const base = useMemo(() => normalizeApiBase(apiBase), [apiBase]);

  const saveTokens = useCallback(
    (data: AuthPayload) => {
      setUser(data.user);
      setAccessToken(data.accessToken || "");
      setRefreshToken(data.refreshToken || "");
      localStorage.setItem("movieo_access", data.accessToken || "");
      localStorage.setItem("movieo_refresh", data.refreshToken || "");
      localStorage.setItem("movieo_user", JSON.stringify(data.user));
    },
    [setAccessToken, setRefreshToken, setUser],
  );

  const clearTokens = useCallback(() => {
    setUser(null);
    setAccessToken("");
    setRefreshToken("");
    localStorage.removeItem("movieo_access");
    localStorage.removeItem("movieo_refresh");
    localStorage.removeItem("movieo_user");
  }, [setAccessToken, setRefreshToken, setUser]);

  const api = useCallback(
    async <T,>(path: string, options: RequestInit = {}, schema?: z.ZodType<T>): Promise<T> => {
      const headers = new Headers(options.headers || {});
      headers.set("Content-Type", "application/json");
      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const response = await fetch(`${base}${path}`, { ...options, headers });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(payload?.error?.message || "Request failed");
        (error as Error & { status?: number }).status = response.status;
        throw error;
      }
      const data = payload?.data ?? payload;
      return schema ? parseWithSchema(schema, data) : (data as T);
    },
    [accessToken, base],
  );

  const hydrateSession = useCallback(async () => {
    if (!refreshToken) return;
    if (accessToken && isAccessValid(accessToken) && !shouldRefreshSoon(accessToken)) {
      return;
    }
    try {
      const data = await api<AuthPayload>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        },
        authSchema,
      );
      saveTokens(data);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if ((status === 401 || status === 403) && !accessToken) {
        clearTokens();
      }
    }
  }, [accessToken, api, clearTokens, refreshToken, saveTokens]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      try {
        const data = await api<AuthPayload>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          authSchema,
        );
        saveTokens(data);
        showToast("Logged in.");
        return true;
      } catch (err) {
        showToast((err as Error).message);
        return false;
      }
    },
    [api, saveTokens, showToast],
  );

  const register = useCallback(
    async (payload: { email: string; password: string; username?: string }) => {
      try {
        const data = await api<AuthPayload>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          authSchema,
        );
        saveTokens(data);
        showToast("Account created.");
        return true;
      } catch (err) {
        showToast((err as Error).message);
        return false;
      }
    },
    [api, saveTokens, showToast],
  );

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await api("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      clearTokens();
      showToast("Logged out.");
    }
  }, [api, clearTokens, refreshToken, showToast]);

  const loadMovies = useCallback(
    async (params: URLSearchParams) => {
      return api<{ items: Movie[]; total: number }>(
        `/movies?${params.toString()}`,
        {},
        paginatedMoviesSchema,
      );
    },
    [api],
  );

  const loadMovie = useCallback(
    async (id: number) => api<Movie>(`/movies/${id}`, {}, movieSchema),
    [api],
  );

  const loadReviews = useCallback(
    async (movieId: number) => api<Review[]>(`/reviews/movie/${movieId}`, {}, z.array(reviewSchema)),
    [api],
  );

  const createReview = useCallback(
    async (payload: { movieId: number; rating: number; comment?: string | null }) =>
      api<Review>(
        "/reviews",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        reviewSchema,
      ),
    [api],
  );

  const createMovie = useCallback(
    async (payload: { title: string; releaseDate: string; genres: string[]; description?: string | null }) =>
      api<Movie>(
        "/movies",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        movieSchema,
      ),
    [api],
  );

  const updateMovie = useCallback(
    async (id: number, payload: { title: string; releaseDate: string; genres: string[]; description?: string | null }) =>
      api<Movie>(
        `/movies/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        movieSchema,
      ),
    [api],
  );

  const deleteMovie = useCallback(
    async (id: number) => api<Movie>(`/movies/${id}`, { method: "DELETE" }, movieSchema),
    [api],
  );

  return {
    saveTokens,
    clearTokens,
    hydrateSession,
    login,
    register,
    logout,
    loadMovies,
    loadMovie,
    loadReviews,
    createReview,
    createMovie,
    updateMovie,
    deleteMovie,
  };
};

export const apiHelpers = {
  decodeTokenExp,
  isAccessValid,
  shouldRefreshSoon,
};
