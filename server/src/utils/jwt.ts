import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  role: "USER" | "ADMIN";
};

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtAccessTtl as SignOptions["expiresIn"],
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign(payload, env.jwtAccessSecret as Secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtRefreshTtl as SignOptions["expiresIn"],
    jwtid: crypto.randomUUID(),
  };
  return jwt.sign(payload, env.jwtRefreshSecret as Secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}
