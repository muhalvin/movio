import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  deleteReviewService,
  listReviewsForMovieService,
  updateReviewService,
} from "./review.service";

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { movieId, rating, comment } = req.body;
    const review = await createReviewService({
      userId: req.user!.id,
      movieId,
      rating,
      comment,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const review = await updateReviewService(id, req.user!.id, req.body);
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const review = await deleteReviewService(id, req.user!.id);
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function listReviewsForMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const movieId = Number(req.params.movieId);
    const reviews = await listReviewsForMovieService(movieId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}
