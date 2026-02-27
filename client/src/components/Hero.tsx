import type { Movie } from "../types";

type HeroProps = {
  heroMovie: Movie;
  ratingValue: number;
  onExplore: () => void;
};

const Hero = ({ heroMovie, ratingValue, onExplore }: HeroProps) => {
  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-navy">Movie Review API Client</p>
        <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">
          Discover, rate, and debate the films that move you.
        </h1>
        <p className="mt-4 text-lg text-black/60">
          Built to match the Movie Review API. Browse the catalog, filter by genre, and drop your
          take. Admins can curate the lineup.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={onExplore}>
            Explore movies
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="chip">JWT sessions</span>
          <span className="chip">1 review per movie</span>
          <span className="chip">Role-based admin</span>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="glass hero-gradient rounded-3xl p-6 shadow-float">
          <p className="text-xs uppercase tracking-[0.25em] text-black/40">Now playing</p>
          <h2 className="mt-3 font-display text-3xl">{heroMovie.title}</h2>
          <p className="mt-2 text-black/60">
            {heroMovie.genres?.[0] || "Genre"} · {heroMovie.release_date} · {Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : "0.0"}★
          </p>
          <div className="mt-4 flex items-center justify-between text-sm text-black/50">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-orange-200 to-pink-500" />
              <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-amber-200 to-orange-400" />
              <div className="h-7 w-7 rounded-full border-2 border-white bg-gradient-to-br from-yellow-100 to-rose-300" />
            </div>
            <span>{heroMovie.review_count} reviews</span>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-black/40">Top genres</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {["Sci-Fi", "Drama", "Thriller", "Animation", "Comedy", "Indie"].map((genre) => (
              <span key={genre} className="rounded-xl border border-black/5 bg-white px-2 py-2 text-center">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
