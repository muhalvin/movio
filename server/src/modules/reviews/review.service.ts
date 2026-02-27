import { ApiError } from "../../utils/errors";
import { findMovieById } from "../movies/movie.repository";
import {
  createReview,
  deleteReview,
  findReviewById,
  findReviewByUserAndMovie,
  listReviewsForMovie,
  updateReview,
} from "./review.repository";

export async function createReviewService(input: {
  userId: number;
  movieId: number;
  rating: number;
  comment?: string | null;
}) {
  const movie = await findMovieById(input.movieId);
  if (!movie) {
    throw new ApiError(404, "NOT_FOUND", "Movie not found");
  }

  const existing = await findReviewByUserAndMovie(input.userId, input.movieId);
  if (existing) {
    throw new ApiError(409, "CONFLICT", "You already reviewed this movie");
  }

  return createReview(input);
}

export async function updateReviewService(reviewId: number, userId: number, input: {
  rating?: number;
  comment?: string | null;
}) {
  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "No fields provided for update");
  }

  const existing = await findReviewById(reviewId);
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  if (Number(existing.user_id) !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You can only update your own reviews");
  }

  const review = await updateReview(reviewId, input);
  if (!review) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  return review;
}

export async function deleteReviewService(reviewId: number, userId: number) {
  const existing = await findReviewById(reviewId);
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  if (Number(existing.user_id) !== userId) {
    throw new ApiError(403, "FORBIDDEN", "You can only delete your own reviews");
  }

  const review = await deleteReview(reviewId);
  if (!review) {
    throw new ApiError(404, "NOT_FOUND", "Review not found");
  }

  return review;
}

export async function listReviewsForMovieService(movieId: number) {
  return listReviewsForMovie(movieId);
}
