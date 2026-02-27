import { ApiError } from "../../utils/errors";
import { createMovie, deleteMovie, findMovieById, listMovies, updateMovie } from "./movie.repository";

export async function createMovieService(input: {
  title: string;
  description?: string | null;
  releaseDate: string;
  genres: string[];
  createdBy: number;
}) {
  return createMovie(input);
}

export async function updateMovieService(id: number, input: {
  title?: string;
  description?: string | null;
  releaseDate?: string;
  genres?: string[];
}) {
  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "No fields provided for update");
  }
  const movie = await updateMovie(id, input);
  if (!movie) {
    throw new ApiError(404, "NOT_FOUND", "Movie not found");
  }
  return movie;
}

export async function deleteMovieService(id: number) {
  const movie = await deleteMovie(id);
  if (!movie) {
    throw new ApiError(404, "NOT_FOUND", "Movie not found");
  }
  return movie;
}

export async function getMovieByIdService(id: number) {
  const movie = await findMovieById(id);
  if (!movie) {
    throw new ApiError(404, "NOT_FOUND", "Movie not found");
  }
  return movie;
}

export async function listMoviesService(filters: {
  q?: string;
  genre?: string;
  releaseYear?: number;
  page: number;
  limit: number;
}) {
  const offset = (filters.page - 1) * filters.limit;
  return listMovies({
    q: filters.q,
    genre: filters.genre,
    releaseYear: filters.releaseYear,
    limit: filters.limit,
    offset,
  });
}
