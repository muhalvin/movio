const fs = require("node:fs/promises");
const path = require("node:path");
const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const schemaPath = path.resolve(__dirname, "..", "db", "schema.sql");

function getDbName(connectionString) {
  const parsed = new URL(connectionString);
  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName) {
    throw new Error("DATABASE_URL must include a database name.");
  }
  return dbName;
}

function withDatabase(connectionString, dbName) {
  const parsed = new URL(connectionString);
  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

async function ensureDatabaseExists(connectionString) {
  const targetDb = getDbName(connectionString);
  const adminCandidates = ["postgres", "template1"];

  for (const adminDb of adminCandidates) {
    const adminPool = new Pool({
      connectionString: withDatabase(connectionString, adminDb),
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    try {
      const exists = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [targetDb]);

      if (exists.rowCount === 0) {
        await adminPool.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`);
        console.log(`Database '${targetDb}' created.`);
      } else {
        console.log(`Database '${targetDb}' already exists.`);
      }
      return;
    } catch (_error) {
      // Try next admin database candidate.
    } finally {
      await adminPool.end();
    }
  }

  throw new Error("Could not connect to an admin database to create/check target database.");
}

async function runMigration() {
  const sql = await fs.readFile(schemaPath, "utf8");
  await ensureDatabaseExists(databaseUrl);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(sql);
    console.log("Migration completed successfully.");
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error("Migration failed.");
  console.error(error.message);
  process.exit(1);
});
