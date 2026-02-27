import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { env } from "../src/config/env";
import { pool } from "../src/config/db";

const { Pool } = pg;

function getDbName(connectionString: string): string {
  const parsed = new URL(connectionString);
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error("DATABASE_URL must include a database name.");
  }
  return dbName;
}

function withDatabase(connectionString: string, dbName: string): string {
  const parsed = new URL(connectionString);
  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

async function ensureDatabaseExists(connectionString: string): Promise<void> {
  const targetDb = getDbName(connectionString);
  const adminCandidates = ["postgres", "template1"];

  for (const adminDb of adminCandidates) {
    const adminPool = new Pool({
      connectionString: withDatabase(connectionString, adminDb),
      ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
    });

    try {
      const exists = await adminPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [targetDb],
      );

      if (exists.rowCount === 0) {
        await adminPool.query(
          `CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`,
        );
      }
      return;
    } catch (_error) {
      // Try next admin database candidate.
    } finally {
      await adminPool.end();
    }
  }

  throw new Error(
    "Could not connect to an admin database to create/check target database.",
  );
}

beforeAll(async () => {
  await ensureDatabaseExists(env.databaseUrl);
  const schemaPath = path.resolve(__dirname, "..", "db", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await pool.query(sql);
});

afterEach(async () => {
  await pool.query("TRUNCATE TABLE reviews, refresh_tokens, movies, users RESTART IDENTITY CASCADE");
});

afterAll(async () => {
  await pool.end();
});
