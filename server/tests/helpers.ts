import request from "supertest";
import app from "../src/app";
import { pool } from "../src/config/db";

export async function registerUser(email: string, password: string, username?: string) {
  const response = await request(app).post("/api/auth/register").send({ email, password, username });
  return response.body.data;
}

export async function loginUser(email: string, password: string) {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  return response.body.data;
}

export async function makeAdmin(userId: number) {
  await pool.query("UPDATE users SET role = 'ADMIN' WHERE id = $1", [userId]);
}

export { app };
