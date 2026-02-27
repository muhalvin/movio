import { query } from "../../config/db";

export type MovieRecord = {
  id: number;
  title: string;
  description: string | null;
  release_date: string;
  genres: string[];
  average_rating: number;
  review_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type MovieFilters = {
  q?: string;
  genre?: string;
  releaseYear?: number;
  limit: number;
  offset: number;
};

export async function createMovie(input: {
  title: string;
  description?: string | null;
  releaseDate: string;
  genres: string[];
  createdBy: number;
}) {
  const result = await query<MovieRecord>(
    "INSERT INTO movies (title, description, release_date, genres, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [input.title, input.description ?? null, input.releaseDate, input.genres, input.createdBy]
  );
  return result.rows[0];
}

export async function updateMovie(id: number, input: {
  title?: string;
  description?: string | null;
  releaseDate?: string;
  genres?: string[];
}) {
  const fields: string[] = [];
  const values: Array<unknown> = [];

  if (input.title !== undefined) {
    values.push(input.title);
    fields.push(`title = $${values.length}`);
  }
  if (input.description !== undefined) {
    values.push(input.description);
    fields.push(`description = $${values.length}`);
  }
  if (input.releaseDate !== undefined) {
    values.push(input.releaseDate);
    fields.push(`release_date = $${values.length}`);
  }
  if (input.genres !== undefined) {
    values.push(input.genres);
    fields.push(`genres = $${values.length}`);
  }

  values.push(id);

  const result = await query<MovieRecord>(
    `UPDATE movies SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteMovie(id: number) {
  const result = await query<MovieRecord>("DELETE FROM movies WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] ?? null;
}

export async function findMovieById(id: number) {
  const result = await query<MovieRecord>("SELECT * FROM movies WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function listMovies(filters: MovieFilters) {
  const conditions: string[] = [];
  const values: Array<unknown> = [];

  if (filters.q) {
    values.push(`%${filters.q}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }
  if (filters.genre) {
    values.push(filters.genre);
    conditions.push(`$${values.length} = ANY (genres)`);
  }
  if (filters.releaseYear) {
    values.push(filters.releaseYear);
    conditions.push(`EXTRACT(YEAR FROM release_date) = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(filters.limit);
  values.push(filters.offset);

  const dataQuery = `SELECT * FROM movies ${whereClause} ORDER BY release_date DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const countQuery = `SELECT COUNT(*)::int AS total FROM movies ${whereClause}`;

  const dataResult = await query<MovieRecord>(dataQuery, values);
  const countResult = await query<{ total: number }>(countQuery, values.slice(0, values.length - 2));

  return {
    items: dataResult.rows,
    total: countResult.rows[0]?.total ?? 0,
  };
}

export async function updateMovieRating(movieId: number, averageRating: number, reviewCount: number) {
  await query("UPDATE movies SET average_rating = $1, review_count = $2, updated_at = NOW() WHERE id = $3", [
    averageRating,
    reviewCount,
    movieId,
  ]);
}
