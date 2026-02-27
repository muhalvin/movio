import { NextFunction, Request, Response } from "express";
import { ApiError, isApiError } from "../utils/errors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (isApiError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  const fallback = new ApiError(500, "INTERNAL_ERROR", "Internal server error");
  return res.status(fallback.statusCode).json({
    success: false,
    error: {
      code: fallback.code,
      message: fallback.message,
    },
  });
}
