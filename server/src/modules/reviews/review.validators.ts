import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    movieId: z.coerce.number().int().positive(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(2000).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional().nullable(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const deleteReviewSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const listReviewsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    movieId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
