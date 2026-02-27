import { query } from "../../config/db";

export type UserRecord = {
  id: number;
  email: string;
  username: string | null;
  password_hash: string;
  role: "USER" | "ADMIN";
};

export async function createUser(email: string, username: string | null, passwordHash: string) {
  const result = await query<UserRecord>(
    "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, password_hash, role",
    [email, username, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRecord>(
    "SELECT id, email, username, password_hash, role FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: number) {
  const result = await query<UserRecord>(
    "SELECT id, email, username, password_hash, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findUserByUsername(username: string) {
  const result = await query<UserRecord>(
    "SELECT id, email, username, password_hash, role FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] ?? null;
}

export async function storeRefreshToken(userId: number, tokenHash: string, expiresAt: Date) {
  await query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt]
  );
}

export async function findRefreshToken(tokenHash: string) {
  const result = await query<{ id: number; user_id: number; expires_at: Date; revoked_at: Date | null }>(
    "SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string) {
  await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1", [tokenHash]);
}

export async function revokeTokensForUser(userId: number) {
  await query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL", [
    userId,
  ]);
}
