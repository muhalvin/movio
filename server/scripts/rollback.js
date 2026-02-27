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

const rollbackPath = path.resolve(__dirname, "..", "db", "rollback.sql");

async function runRollback() {
  const sql = await fs.readFile(rollbackPath, "utf8");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  try {
    await pool.query(sql);
    console.log("Rollback completed successfully.");
  } finally {
    await pool.end();
  }
}

runRollback().catch((error) => {
  console.error("Rollback failed.");
  console.error(error.message);
  process.exit(1);
});
