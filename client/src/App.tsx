import { useEffect, useMemo, useState } from "react";
import type { Movie, Review, User } from "./types";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import Catalog from "./components/Catalog";
import DetailPanel from "./components/DetailPanel";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Toast from "./components/Toast";
import { useSession } from "./hooks/useSession";

type DraftFilters = { search: string; genre: string; year: string };

type CreateForm = { title: string; releaseDate: string; genres: string; description: string };

type UpdateForm = { title: string; releaseDate: string; genres: string; description: string };

const fallbackMovies: Movie[] = [
  {
    id: 1,
    title: "Arrival",
    release_date: "2016-11-11",
    average_rating: 4.35,
    review_count: 120,
    genres: ["Sci-Fi", "Drama"],
    description: "A linguist is recruited to communicate with extraterrestrials.",
  },
  {
    id: 2,
    title: "Parasite",
    release_date: "2019-05-30",
    average_rating: 4.7,
    review_count: 240,
    genres: ["Thriller", "Drama"],
    description: "Class tension erupts when two families collide.",
  },
  {
    id: 3,
    title: "Spirited Away",
    release_date: "2001-07-20",
    average_rating: 4.9,
    review_count: 310,
    genres: ["Animation", "Adventure"],
    description: "A young girl navigates a world of spirits and courage.",
  },
];

const App = () => {
  const normalizeApiBase = (value: string) => value.replace(/\/+$/, "");
  const [apiBase] = useState(() => {
    const stored = localStorage.getItem("movieo_api") || "http://localhost:3000/api";
    const normalized = normalizeApiBase(stored);
    if (stored !== normalized) {
      localStorage.setItem("movieo_api", normalized);
    }
    return normalized;
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("movieo_user");
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem("movieo_access") || "");
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("movieo_refresh") || "");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<DraftFilters>({ search: "", genre: "", year: "" });
  const [draftFilters, setDraftFilters] = useState<DraftFilters>({ search: "", genre: "", year: "" });
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [toast, setToast] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", username: "" });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [createForm, setCreateForm] = useState<CreateForm>({
    title: "",
    releaseDate: "",
    genres: "",
    description: "",
  });
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    title: "",
    releaseDate: "",
    genres: "",
    description: "",
  });

  const isAdmin = user?.role === "ADMIN";
  const heroMovie = useMemo(() => movies[0] || fallbackMovies[0], [movies]);
  const ratingValue = Number(heroMovie?.average_rating ?? 0);
  const formatRating = (value: unknown) => {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : "0.0";
  };
  const isReviewer = Boolean(user) && user?.role !== "ADMIN";

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  };

  const api = useSession({
    apiBase,
    user,
    setUser,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    showToast,
    onHydrated: () => setIsHydrated(true),
  });

  const loadMovies = async () => {
    setIsMoviesLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filters.search.trim()) params.set("q", filters.search.trim());
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("releaseYear", filters.year);

    try {
      const data = await api.loadMovies(params);
      setMovies(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast((err as Error).message);
      setMovies(fallbackMovies);
      setTotal(fallbackMovies.length);
    } finally {
      setIsMoviesLoading(false);
    }
  };

  const loadReviews = async (movieId: number) => {
    setIsReviewsLoading(true);
    try {
      const data = await api.loadReviews(movieId);
      setReviews(data || []);
    } catch (err) {
      showToast((err as Error).message);
      setReviews([]);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const openMovie = async (movieId: number) => {
    try {
      const data = await api.loadMovie(movieId);
      setSelectedMovie(data);
      setShowDetail(true);
      setUpdateForm({
        title: data.title,
        releaseDate: data.release_date,
        genres: data.genres.join(", "),
        description: data.description || "",
      });
      await loadReviews(movieId);
    } catch (err) {
      showToast((err as Error).message);
    }
  };

  const submitReview = async () => {
    if (!selectedMovie) return;
    if (!accessToken) {
      showToast("Login required to review.");
      return;
    }

    try {
      setIsReviewSubmitting(true);
      await api.createReview({
        movieId: selectedMovie.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      });
      showToast("Review submitted.");
      setReviewForm({ rating: 5, comment: "" });
      await openMovie(selectedMovie.id);
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const login = async () => {
    setIsAuthLoading(true);
    const ok = await api.login(loginForm);
    if (ok) setShowAuth(false);
    setIsAuthLoading(false);
  };

  const register = async () => {
    setIsAuthLoading(true);
    const ok = await api.register({
      email: registerForm.email,
      password: registerForm.password,
      username: registerForm.username || undefined,
    });
    if (ok) setShowAuth(false);
    setIsAuthLoading(false);
  };

  const logout = async () => {
    setIsAuthLoading(true);
    await api.logout();
    setIsAuthLoading(false);
  };

  const createMovie = async () => {
    if (!isAdmin) {
      showToast("Admin role required.");
      return;
    }
    try {
      setIsAdminLoading(true);
      await api.createMovie({
        title: createForm.title.trim(),
        releaseDate: createForm.releaseDate,
        genres: createForm.genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        description: createForm.description.trim() || null,
      });
      showToast("Movie created.");
      setCreateForm({ title: "", releaseDate: "", genres: "", description: "" });
      await loadMovies();
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const updateMovie = async () => {
    if (!selectedMovie) {
      showToast("Select a movie first.");
      return;
    }
    try {
      setIsAdminLoading(true);
      await api.updateMovie(selectedMovie.id, {
        title: updateForm.title.trim(),
        releaseDate: updateForm.releaseDate,
        genres: updateForm.genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
        description: updateForm.description.trim() || null,
      });
      showToast("Movie updated.");
      await loadMovies();
      await openMovie(selectedMovie.id);
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const deleteMovie = async () => {
    if (!selectedMovie) return;
    try {
      setIsAdminLoading(true);
      await api.deleteMovie(selectedMovie.id);
      showToast("Movie deleted.");
      setShowDetail(false);
      await loadMovies();
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const maxPage = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (!isHydrated) return;
    loadMovies();
  }, [isHydrated, page, limit, filters]);

  return (
    <div className="relative">
      <div className="grid-overlay" />

      <Header
        user={user}
        isAdmin={isAdmin}
        isAdminLoading={isAdminLoading}
        onSignIn={() => setShowAuth(true)}
        onSignOut={logout}
        onOpenAdmin={() => {
          setShowAdmin(true);
          document.getElementById("admin")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="relative z-10">
        <Hero
          heroMovie={heroMovie}
          ratingValue={ratingValue}
          onExplore={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}
        />

        <Catalog
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          limit={limit}
          setLimit={setLimit}
          isMoviesLoading={isMoviesLoading}
          movies={movies}
          openMovie={openMovie}
          page={page}
          maxPage={maxPage}
          setPage={setPage}
          applyFilters={() => {
            setFilters(draftFilters);
            setPage(1);
          }}
          resetFilters={() => {
            const cleared = { search: "", genre: "", year: "" };
            setDraftFilters(cleared);
            setFilters(cleared);
            setPage(1);
          }}
          formatRating={formatRating}
        />

        <DetailPanel
          showDetail={showDetail}
          selectedMovie={selectedMovie}
          onClose={() => setShowDetail(false)}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          submitReview={submitReview}
          isReviewSubmitting={isReviewSubmitting}
          isReviewer={isReviewer}
          reviews={reviews}
          isReviewsLoading={isReviewsLoading}
          formatRating={formatRating}
        />

        <AdminPanel
          showAdmin={showAdmin}
          onClose={() => setShowAdmin(false)}
          createForm={createForm}
          setCreateForm={setCreateForm}
          updateForm={updateForm}
          setUpdateForm={setUpdateForm}
          createMovie={createMovie}
          updateMovie={updateMovie}
          deleteMovie={deleteMovie}
          isAdminLoading={isAdminLoading}
          selectedMovie={selectedMovie}
        />
      </main>

      <AuthModal
        show={showAuth}
        onClose={() => setShowAuth(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        login={login}
        register={register}
        isAuthLoading={isAuthLoading}
        user={user}
      />

      <Toast message={toast} />
    </div>
  );
};

export default App;
