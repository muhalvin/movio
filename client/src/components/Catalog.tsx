import type { Movie } from "../types";

type CatalogProps = {
  draftFilters: { search: string; genre: string; year: string };
  setDraftFilters: (value: { search: string; genre: string; year: string }) => void;
  limit: number;
  setLimit: (value: number) => void;
  isMoviesLoading: boolean;
  movies: Movie[];
  openMovie: (id: number) => void;
  page: number;
  maxPage: number;
  setPage: (value: number) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  formatRating: (value: unknown) => string;
};

const Catalog = ({
  draftFilters,
  setDraftFilters,
  limit,
  setLimit,
  isMoviesLoading,
  movies,
  openMovie,
  page,
  maxPage,
  setPage,
  applyFilters,
  resetFilters,
  formatRating,
}: CatalogProps) => {
  return (
    <section id="explore" className="mx-auto w-full max-w-6xl px-6 pb-12">
      <div className="glass rounded-[32px] p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Browse the catalog</h2>
            <p className="text-black/60">Search by title, filter by genre, and dive into reviews.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-xs text-black/50">
            Search
            <input
              className="mt-2 w-48 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              placeholder="Search titles"
              value={draftFilters.search}
              onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
            />
          </label>
          <label className="text-xs text-black/50">
            Genre
            <select
              className="mt-2 w-40 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={draftFilters.genre}
              onChange={(e) => setDraftFilters({ ...draftFilters, genre: e.target.value })}
            >
              <option value="">All</option>
              {["Drama", "Comedy", "Sci-Fi", "Thriller", "Romance", "Animation", "Action", "Adventure"].map(
                (genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                )
              )}
            </select>
          </label>
          <label className="text-xs text-black/50">
            Release year
            <input
              type="number"
              min={1888}
              max={2100}
              className="mt-2 w-32 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              placeholder="2016"
              value={draftFilters.year}
              onChange={(e) => setDraftFilters({ ...draftFilters, year: e.target.value })}
            />
          </label>
          <label className="text-xs text-black/50">
            Page size
            <select
              className="mt-2 w-28 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[6, 9, 12, 18].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" disabled={isMoviesLoading} onClick={applyFilters}>
            {isMoviesLoading ? "Loading..." : "Apply"}
          </button>
          <button className="btn btn-ghost" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isMoviesLoading
            ? Array.from({ length: limit }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex h-40 flex-col gap-3 rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm animate-pulse"
                >
                  <div className="h-5 w-2/3 rounded bg-sand" />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-sand" />
                    <div className="h-3 w-10 rounded bg-sand" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-12 rounded-full bg-sand" />
                    <div className="h-5 w-14 rounded-full bg-sand" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-20 rounded bg-sand" />
                    <div className="h-3 w-12 rounded bg-sand" />
                  </div>
                </div>
              ))
            : movies.map((movie) => (
                <button
                  key={movie.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => openMovie(movie.id)}
                >
                  <div className="text-lg font-semibold text-ink">{movie.title}</div>
                  <div className="flex justify-between text-xs text-black/50">
                    <span>{movie.release_date}</span>
                    <span>{formatRating(movie.average_rating)}★</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span key={genre} className="rounded-full border border-black/5 bg-sand px-2 py-1 text-[11px] text-black/60">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-black/50">
                    <span>{movie.review_count} reviews</span>
                    <span className="text-amber-600/80 group-hover:text-amber-700">Open</span>
                  </div>
                </button>
              ))}
          {!isMoviesLoading && movies.length === 0 && (
            <div className="col-span-full rounded-2xl border border-black/5 bg-white p-6 text-center text-sm text-black/50">
              No movies found for those filters.
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            className="btn btn-ghost"
            disabled={page <= 1 || isMoviesLoading}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            Previous
          </button>
          <span className="text-black/50">
            Page {page} of {maxPage}
          </span>
          <button
            className="btn btn-ghost"
            disabled={page >= maxPage || isMoviesLoading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default Catalog;
