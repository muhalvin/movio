import pg from "pg";
import type { QueryResult, QueryResultRow } from "pg";
import { env } from "./env";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
});

export async function query<T extends QueryResultRow>(
  text: string,
  params?: Array<unknown>,
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
