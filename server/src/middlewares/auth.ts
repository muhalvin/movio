import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing Authorization header"));
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid Authorization header"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch (error) {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

export function requireRole(role: "USER" | "ADMIN") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (req.user.role !== role) {
      return next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
    }
    return next();
  };
}
