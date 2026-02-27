CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  release_date DATE NOT NULL,
  genres TEXT[] NOT NULL,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING GIN (genres);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies USING GIN (to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
