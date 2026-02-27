import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getKey(req: Request): string {
  return req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
}

export function rateLimit(req: Request, _res: Response, next: NextFunction) {
  const key = getKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + env.rateLimitWindowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > env.rateLimitMax) {
    return next(new ApiError(429, "RATE_LIMITED", "Too many requests"));
  }

  return next();
}
