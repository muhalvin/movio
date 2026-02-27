const dotenv = require("dotenv");
const pg = require("pg");
const bcrypt = require("bcryptjs");

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const SEED_RESET =
  process.env.SEED_RESET === "1" || process.env.SEED_RESET === "true";
const SEED_RANDOM =
  process.env.SEED_RANDOM === "1" || process.env.SEED_RANDOM === "true";
const SEED_RANDOM_SEED = Number(process.env.SEED_RANDOM_SEED || 1337);
const SEED_USERS = Number(process.env.SEED_USERS || 20);
const SEED_MOVIES = Number(process.env.SEED_MOVIES || 25);
const SEED_REVIEWS = Number(process.env.SEED_REVIEWS || 80);

function mulberry32(seed) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED_RANDOM_SEED);
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const mockUsers = [
  { email: "alice@example.com", username: "alice", role: "USER" },
  { email: "bob@example.com", username: "bob", role: "USER" },
  { email: "carol@example.com", username: "carol", role: "USER" },
  { email: "dave@example.com", username: "dave", role: "USER" },
  { email: "admin-mock@example.com", username: "admin-mock", role: "USER" },
];

const mockMovies = [
  {
    title: "Arrival",
    description:
      "A linguist is recruited to communicate with extraterrestrials.",
    releaseDate: "2016-11-11",
    genres: ["Sci-Fi", "Drama"],
  },
  {
    title: "The Grand Budapest Hotel",
    description:
      "A concierge teams up with a lobby boy to prove his innocence.",
    releaseDate: "2014-03-28",
    genres: ["Comedy", "Adventure"],
  },
  {
    title: "Parasite",
    description:
      "A poor family schemes to become employed by a wealthy household.",
    releaseDate: "2019-05-30",
    genres: ["Thriller", "Drama"],
  },
  {
    title: "Spirited Away",
    description: "A girl enters a world of spirits and must find her way home.",
    releaseDate: "2001-07-20",
    genres: ["Animation", "Fantasy"],
  },
  {
    title: "Whiplash",
    description:
      "A young drummer faces a ruthless instructor at a music conservatory.",
    releaseDate: "2014-10-10",
    genres: ["Drama", "Music"],
  },
];

const mockReviews = [
  {
    userEmail: "alice@example.com",
    movieTitle: "Arrival",
    rating: 5,
    comment: "Absolutely stunning.",
  },
  {
    userEmail: "bob@example.com",
    movieTitle: "Arrival",
    rating: 4,
    comment: "Smart and thoughtful.",
  },
  {
    userEmail: "carol@example.com",
    movieTitle: "Parasite",
    rating: 5,
    comment: "Incredible tension.",
  },
  {
    userEmail: "dave@example.com",
    movieTitle: "Whiplash",
    rating: 5,
    comment: "Intense and gripping.",
  },
  {
    userEmail: "alice@example.com",
    movieTitle: "Spirited Away",
    rating: 5,
    comment: "Magical.",
  },
  {
    userEmail: "bob@example.com",
    movieTitle: "The Grand Budapest Hotel",
    rating: 4,
    comment: "Beautifully quirky.",
  },
];

const randomUsernames = [
  "bluefox",
  "cinephile",
  "popcorn",
  "framebyframe",
  "noirlover",
  "synthwave",
  "quietstorm",
  "silverline",
  "nightowl",
  "flicks",
  "rewind",
  "riverrun",
  "northstar",
  "ember",
  "codec",
  "monsoon",
  "opal",
  "ranger",
  "glitch",
  "vapor",
  "orbit",
  "atlas",
  "drift",
  "lumen",
  "emberlight",
];

const movieTitlePool = [
  "Moonlit Harbor",
  "Signal from Orion",
  "Glass City",
  "Nocturne Drive",
  "The Last Archivist",
  "Crimson Echo",
  "Midnight Correspondent",
  "Paper Satellites",
  "The Silent Spectrum",
  "Neon Orchard",
  "Borrowed Sky",
  "Static Bloom",
  "The Parallax Room",
  "Dust & Tide",
  "The Night We Listened",
  "Violet Meridian",
  "Wildlight",
  "Hollow Atlas",
  "The Copper Door",
  "Dreams of Tin",
  "The Cold Lantern",
  "The Blackfield Tape",
  "Elsewhere Station",
  "The Velvet Line",
  "City of Kites",
  "Twelve Small Fires",
  "Memory Arcade",
  "Cartographer's Wake",
  "The Painted Storm",
  "The Last Signal",
  "The Weight of Clouds",
  "Sea of Glass",
  "The Atlas Code",
  "Blue Hour",
  "Orbit of Rain",
  "The Longest Night",
  "Sound of Ash",
  "Where the Signal Ends",
  "Sundown Circuit",
  "The Quiet Storm",
];

const genrePool = [
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Mystery",
  "Comedy",
  "Adventure",
  "Fantasy",
  "Crime",
  "Romance",
  "Animation",
  "Music",
  "Action",
  "Documentary",
];

const reviewComments = [
  "Loved the pacing.",
  "Great performances all around.",
  "A bit slow in the middle, but worth it.",
  "Atmospheric and engaging.",
  "Beautiful cinematography.",
  "Solid story, strong ending.",
  "Not my cup of tea, but well made.",
  "Surprisingly moving.",
  "Would watch again.",
  "Compelling from start to finish.",
  "Good, not great.",
  "A standout in its genre.",
];

function randomDate(startYear, endYear) {
  const year = Math.floor(rand() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(rand() * 12) + 1;
  const day = Math.floor(rand() * 28) + 1;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

const genreWeights = new Map([
  ["Drama", 3],
  ["Thriller", 2],
  ["Sci-Fi", 2],
  ["Mystery", 2],
  ["Comedy", 2],
  ["Adventure", 2],
  ["Fantasy", 2],
  ["Crime", 2],
  ["Romance", 1],
  ["Animation", 1],
  ["Music", 1],
  ["Action", 2],
  ["Documentary", 1],
]);

function pickWeightedGenre(exclude) {
  const candidates = genrePool.filter((g) => !exclude.has(g));
  const total = candidates.reduce(
    (sum, g) => sum + (genreWeights.get(g) || 1),
    0,
  );
  let r = rand() * total;
  for (const g of candidates) {
    r -= genreWeights.get(g) || 1;
    if (r <= 0) {
      return g;
    }
  }
  return candidates[0];
}

function pickGenres(count) {
  const picked = new Set();
  const target = Math.max(1, Math.min(count, genrePool.length));
  while (picked.size < target) {
    picked.add(pickWeightedGenre(picked));
  }
  return Array.from(picked);
}

const baseReleaseYears = mockMovies
  .map((m) => Number(m.releaseDate.slice(0, 4)))
  .filter(Boolean);

function randomDateAroundBase() {
  const baseYear = baseReleaseYears.length ? pick(baseReleaseYears) : 2015;
  const offset = Math.floor(rand() * 17) - 8;
  const year = Math.max(1950, Math.min(2026, baseYear + offset));
  const month = Math.floor(rand() * 12) + 1;
  const day = Math.floor(rand() * 28) + 1;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  const password = process.env.SEED_PASSWORD || "password";
  const passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS || 12),
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (SEED_RESET) {
      await client.query(
        "TRUNCATE reviews, movies, refresh_tokens, users RESTART IDENTITY CASCADE",
      );
    }

    const userIdByEmail = new Map();
    for (const user of mockUsers) {
      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [user.email.toLowerCase()],
      );
      if (existing.rowCount > 0) {
        await client.query(
          "UPDATE users SET username = $1, role = $2, password_hash = $3 WHERE email = $4",
          [user.username, user.role, passwordHash, user.email.toLowerCase()],
        );
        userIdByEmail.set(user.email, existing.rows[0].id);
      } else {
        const inserted = await client.query(
          "INSERT INTO users (email, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
          [user.email.toLowerCase(), user.username, passwordHash, user.role],
        );
        userIdByEmail.set(user.email, inserted.rows[0].id);
      }
    }

    if (SEED_RANDOM) {
      const baseCount = Math.max(0, SEED_USERS);
      const emails = new Set(mockUsers.map((u) => u.email));
      for (let i = 0; i < baseCount; i += 1) {
        const username = `${pick(randomUsernames)}${Math.floor(rand() * 1000)}`;
        const email = `${username}@example.com`.toLowerCase();
        if (emails.has(email)) {
          continue;
        }
        emails.add(email);
        const role = rand() < 0.05 ? "ADMIN" : "USER";
        const inserted = await client.query(
          "INSERT INTO users (email, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
          [email, username, passwordHash, role],
        );
        userIdByEmail.set(email, inserted.rows[0].id);
      }
    }

    const movieIdByTitle = new Map();
    const createdBy =
      userIdByEmail.get("admin-mock@example.com") ||
      userIdByEmail.get("alice@example.com");
    for (const movie of mockMovies) {
      const existing = await client.query(
        "SELECT id FROM movies WHERE title = $1 AND release_date = $2",
        [movie.title, movie.releaseDate],
      );
      if (existing.rowCount > 0) {
        await client.query(
          "UPDATE movies SET description = $1, genres = $2, updated_at = NOW() WHERE id = $3",
          [movie.description, movie.genres, existing.rows[0].id],
        );
        movieIdByTitle.set(movie.title, existing.rows[0].id);
      } else {
        const inserted = await client.query(
          "INSERT INTO movies (title, description, release_date, genres, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [
            movie.title,
            movie.description,
            movie.releaseDate,
            movie.genres,
            createdBy,
          ],
        );
        movieIdByTitle.set(movie.title, inserted.rows[0].id);
      }
    }

    if (SEED_RANDOM) {
      const target = Math.max(0, SEED_MOVIES);
      const titles = new Set(mockMovies.map((m) => m.title));
      const shuffledTitles = shuffle(movieTitlePool);
      let added = 0;
      for (const title of shuffledTitles) {
        if (added >= target) {
          break;
        }
        if (titles.has(title)) {
          continue;
        }
        titles.add(title);
        const description = pick([
          "A haunting journey through memory and time.",
          "An unlikely friendship changes everything.",
          "A quiet mystery unfolds in a small town.",
          "A daring expedition pushes the limits of survival.",
          "A family confronts secrets long buried.",
        ]);
        const genres = pickGenres(Math.floor(rand() * 3) + 1);
        const releaseDate = randomDateAroundBase();
        const inserted = await client.query(
          "INSERT INTO movies (title, description, release_date, genres, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [title, description, releaseDate, genres, createdBy],
        );
        movieIdByTitle.set(title, inserted.rows[0].id);
        added += 1;
      }
    }

    for (const review of mockReviews) {
      const userId = userIdByEmail.get(review.userEmail);
      const movieId = movieIdByTitle.get(review.movieTitle);
      if (!userId || !movieId) {
        continue;
      }
      const existing = await client.query(
        "SELECT id FROM reviews WHERE user_id = $1 AND movie_id = $2",
        [userId, movieId],
      );
      if (existing.rowCount > 0) {
        await client.query(
          "UPDATE reviews SET rating = $1, comment = $2, updated_at = NOW() WHERE id = $3",
          [review.rating, review.comment || null, existing.rows[0].id],
        );
      } else {
        await client.query(
          "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4)",
          [userId, movieId, review.rating, review.comment || null],
        );
      }
    }

    if (SEED_RANDOM) {
      const userIds = Array.from(userIdByEmail.values());
      const movieIds = Array.from(movieIdByTitle.values());
      const targetReviews = Math.max(0, SEED_REVIEWS);

      for (let i = 0; i < targetReviews; i += 1) {
        const userId = pick(userIds);
        const movieId = pick(movieIds);
        const rating = Math.floor(rand() * 5) + 1;
        const comment = rand() < 0.85 ? pick(reviewComments) : null;
        const existing = await client.query(
          "SELECT id FROM reviews WHERE user_id = $1 AND movie_id = $2",
          [userId, movieId],
        );
        if (existing.rowCount > 0) {
          await client.query(
            "UPDATE reviews SET rating = $1, comment = $2, updated_at = NOW() WHERE id = $3",
            [rating, comment, existing.rows[0].id],
          );
        } else {
          await client.query(
            "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4)",
            [userId, movieId, rating, comment],
          );
        }
      }
    }

    await client.query(`
      UPDATE movies m
      SET average_rating = COALESCE(r.avg, 0),
          review_count = COALESCE(r.count, 0),
          updated_at = NOW()
      FROM (
        SELECT movie_id, AVG(rating)::numeric(3,2) AS avg, COUNT(*)::int AS count
        FROM reviews
        GROUP BY movie_id
      ) r
      WHERE m.id = r.movie_id
    `);

    await client.query("COMMIT");
    console.log("Mock data seeded successfully.");
    if (SEED_RESET) {
      console.log("SEED_RESET enabled: tables truncated before seeding.");
    }
    if (SEED_RANDOM) {
      console.log(
        `SEED_RANDOM enabled: users=${SEED_USERS}, movies=${SEED_MOVIES}, reviews=${SEED_REVIEWS}`,
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed mock data.");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
