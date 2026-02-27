import type { Movie, Review } from "../types";

type DetailPanelProps = {
  showDetail: boolean;
  selectedMovie: Movie | null;
  onClose: () => void;
  reviewForm: { rating: number; comment: string };
  setReviewForm: (value: { rating: number; comment: string }) => void;
  submitReview: () => void;
  isReviewSubmitting: boolean;
  isReviewer: boolean;
  reviews: Review[];
  isReviewsLoading: boolean;
  formatRating: (value: unknown) => string;
};

const DetailPanel = ({
  showDetail,
  selectedMovie,
  onClose,
  reviewForm,
  setReviewForm,
  submitReview,
  isReviewSubmitting,
  isReviewer,
  reviews,
  isReviewsLoading,
  formatRating,
}: DetailPanelProps) => {
  if (!showDetail || !selectedMovie) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-12">
      <div className="glass rounded-[32px] p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">{selectedMovie.title}</h2>
            <p className="text-black/60">
              {selectedMovie.release_date} · {formatRating(selectedMovie.average_rating)}★ · {selectedMovie.review_count} reviews
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="font-display text-xl">Story</h3>
              <p className="mt-2 text-black/60">{selectedMovie.description || "No description available yet."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedMovie.genres.map((genre) => (
                  <span key={genre} className="rounded-full border border-black/5 bg-sand px-2 py-1 text-[11px]">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-5">
              <h3 className="font-display text-xl">Write a review</h3>
              <p className="text-sm text-black/60">One review per movie. Keep it tight and honest.</p>
              <div className="mt-4 grid gap-3">
                <label className="text-xs text-black/50">
                  Rating
                  <select
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    disabled={!isReviewer}
                  >
                    <option value={5}>5 — Masterpiece</option>
                    <option value={4}>4 — Great</option>
                    <option value={3}>3 — Solid</option>
                    <option value={2}>2 — Rough</option>
                    <option value={1}>1 — Skip</option>
                  </select>
                </label>
                <label className="text-xs text-black/50">
                  Comment
                  <textarea
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="What worked? What didn't?"
                    disabled={!isReviewer}
                  />
                </label>
                {!isReviewer && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Reviews are limited to USER accounts. Switch to a user profile to post a review.
                  </div>
                )}
                <button className="btn btn-primary" onClick={submitReview} disabled={!isReviewer || isReviewSubmitting}>
                  {isReviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Community reviews</h3>
              <span className="chip">{reviews.length} reviews</span>
            </div>
            <div className="mt-4 grid gap-3">
              {isReviewsLoading ? (
                <div className="rounded-xl border border-black/5 bg-sand p-3 text-sm text-black/50">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-black/50">No reviews yet. Be the first.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-black/5 bg-sand p-3">
                    <strong>{review.rating}★</strong>
                    <p className="text-sm text-black/60">{review.comment || "No comment."}</p>
                    <span className="text-xs text-black/40">User #{review.user_id}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailPanel;
