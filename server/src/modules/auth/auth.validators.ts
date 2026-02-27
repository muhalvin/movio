import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().trim(),
    password: z.string().min(8).max(128),
    username: z.string().min(3).max(32).trim().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().trim(),
    password: z.string().min(8).max(128),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  params: z.object({}),
  query: z.object({}),
});
