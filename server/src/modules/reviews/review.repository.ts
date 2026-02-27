import pg from "pg";
import { pool, query } from "../../config/db";

export type ReviewRecord = {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export async function findReviewByUserAndMovie(userId: number, movieId: number) {
  const result = await query<ReviewRecord>(
    "SELECT * FROM reviews WHERE user_id = $1 AND movie_id = $2",
    [userId, movieId]
  );
  return result.rows[0] ?? null;
}

export async function findReviewById(id: number) {
  const result = await query<ReviewRecord>("SELECT * FROM reviews WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function createReview(input: {
  userId: number;
  movieId: number;
  rating: number;
  comment?: string | null;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const reviewResult = await client.query<ReviewRecord>(
      "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [input.userId, input.movieId, input.rating, input.comment ?? null]
    );

    await recalcMovieRating(client, input.movieId);

    await client.query("COMMIT");
    return reviewResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateReview(id: number, input: { rating?: number; comment?: string | null }) {
  const fields: string[] = [];
  const values: Array<unknown> = [];

  if (input.rating !== undefined) {
    values.push(input.rating);
    fields.push(`rating = $${values.length}`);
  }
  if (input.comment !== undefined) {
    values.push(input.comment);
    fields.push(`comment = $${values.length}`);
  }

  values.push(id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reviewResult = await client.query<ReviewRecord>(
      `UPDATE reviews SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    const review = reviewResult.rows[0];
    if (review) {
      await recalcMovieRating(client, review.movie_id);
    }

    await client.query("COMMIT");
    return review ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteReview(id: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reviewResult = await client.query<ReviewRecord>("DELETE FROM reviews WHERE id = $1 RETURNING *", [id]);
    const review = reviewResult.rows[0];

    if (review) {
      await recalcMovieRating(client, review.movie_id);
    }

    await client.query("COMMIT");
    return review ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listReviewsForMovie(movieId: number) {
  const result = await query<ReviewRecord>(
    "SELECT * FROM reviews WHERE movie_id = $1 ORDER BY created_at DESC",
    [movieId]
  );
  return result.rows;
}

async function recalcMovieRating(client: pg.PoolClient, movieId: number) {
  const ratingResult = await client.query<{ avg: number | null; count: number }>(
    "SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS count FROM reviews WHERE movie_id = $1",
    [movieId]
  );
  const avg = Number(ratingResult.rows[0]?.avg ?? 0);
  const count = ratingResult.rows[0]?.count ?? 0;

  await client.query("UPDATE movies SET average_rating = $1, review_count = $2, updated_at = NOW() WHERE id = $3", [
    avg,
    count,
    movieId,
  ]);
}
