import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/errors";
import { hashPassword, verifyPassword } from "../../utils/password";
import { hashToken } from "../../utils/tokens";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import {
  createUser,
  findRefreshToken,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  revokeRefreshToken,
  revokeTokensForUser,
  storeRefreshToken,
} from "./auth.repository";

export async function registerUser(email: string, password: string, username?: string | null) {
  const normalizedEmail = email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new ApiError(409, "CONFLICT", "Email is already in use");
  }

  if (username) {
    const usernameExists = await findUserByUsername(username);
    if (usernameExists) {
      throw new ApiError(409, "CONFLICT", "Username is already in use");
    }
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(normalizedEmail, username ?? null, passwordHash);

  const tokens = await issueTokens(user.id, user.role);

  return {
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
    ...tokens,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  const tokens = await issueTokens(user.id, user.role);

  return {
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
    ...tokens,
  };
}

export async function refreshSession(refreshToken: string) {
  let payload: { sub: string; role: "USER" | "ADMIN" };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await findRefreshToken(tokenHash);
  if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
    throw new ApiError(401, "UNAUTHORIZED", "Refresh token expired or revoked");
  }

  const user = await findUserById(Number(payload.sub));
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "User no longer exists");
  }

  await revokeRefreshToken(tokenHash);
  const tokens = await issueTokens(user.id, user.role);

  return {
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
    ...tokens,
  };
}

export async function logoutSession(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await revokeRefreshToken(tokenHash);
}

export async function logoutAll(userId: number) {
  await revokeTokensForUser(userId);
}

async function issueTokens(userId: number, role: "USER" | "ADMIN") {
  const accessToken = signAccessToken({ sub: String(userId), role });
  const refreshToken = signRefreshToken({ sub: String(userId), role });

  const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await storeRefreshToken(userId, hashToken(refreshToken), expiresAt);

  return { accessToken, refreshToken };
}
