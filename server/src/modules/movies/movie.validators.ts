import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const createMovieSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    releaseDate: dateString,
    genres: z.array(z.string().min(1).max(50)).min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateMovieSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    releaseDate: dateString.optional(),
    genres: z.array(z.string().min(1).max(50)).min(1).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const getMovieSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const listMoviesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    q: z.string().max(200).optional(),
    genre: z.string().max(50).optional(),
    releaseYear: z.coerce.number().int().min(1888).max(2100).optional(),
  }),
});
