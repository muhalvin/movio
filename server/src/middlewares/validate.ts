import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/errors";

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(new ApiError(400, "VALIDATION_ERROR", "Validation failed", result.error.flatten()));
  }

  req.body = result.data.body;
  req.params = result.data.params;
  req.query = result.data.query;

  return next();
};
