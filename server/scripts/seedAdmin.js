const dotenv = require("dotenv");
const pg = require("pg");
const bcrypt = require("bcryptjs");

dotenv.config();

const { Pool } = pg;

const email = (process.env.ADMIN_EMAIL || process.argv[2] || "admin@movio.com").toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.argv[3] || "password";
const username = process.env.ADMIN_USERNAME || null;

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));

    if (existing.rowCount > 0) {
      await pool.query("UPDATE users SET role = 'ADMIN', password_hash = $1 WHERE email = $2", [passwordHash, email]);
      console.log(`Admin user updated: ${email}`);
    } else {
      await pool.query(
        "INSERT INTO users (email, username, password_hash, role) VALUES ($1, $2, $3, 'ADMIN')",
        [email, username, passwordHash]
      );
      console.log(`Admin user created: ${email}`);
    }
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Failed to seed admin user.");
  console.error(error.message);
  process.exit(1);
});
