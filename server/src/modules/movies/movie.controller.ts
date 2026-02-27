import { Request, Response, NextFunction } from "express";
import {
  createMovieService,
  deleteMovieService,
  getMovieByIdService,
  listMoviesService,
  updateMovieService,
} from "./movie.service";

export async function createMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, releaseDate, genres } = req.body;
    const movie = await createMovieService({
      title,
      description,
      releaseDate,
      genres,
      createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
}

export async function updateMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const movie = await updateMovieService(id, req.body);
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
}

export async function deleteMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const movie = await deleteMovieService(id);
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
}

export async function getMovie(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const movie = await getMovieByIdService(id);
    res.json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
}

export async function listMovies(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, genre, releaseYear, page, limit } = req.query;
    const result = await listMoviesService({
      q: q?.toString(),
      genre: genre?.toString(),
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      },
    });
  } catch (error) {
    next(error);
  }
}
