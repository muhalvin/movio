# Movie Review API

Production-ready Movie Review API built with Node.js, TypeScript, Express, PostgreSQL, JWT authentication, and Clean Architecture practices.

## Features

- JWT auth with access + refresh tokens
- Role-based access control (USER, ADMIN)
- Movies with genres array, filters, search, pagination
- Reviews with one-review-per-user-per-movie constraint
- Average rating maintained in the database
- Zod validation, structured errors, and rate limiting
- Swagger docs at `/docs`
- Jest unit + integration tests
- Docker + Docker Compose
- Mock data seeder for users, movies, and reviews

## Mock Data

Seeded users (default password `password` unless `SEED_PASSWORD` is set):

- `alice@example.com`
- `bob@example.com`
- `carol@example.com`
- `dave@example.com`
- `admin-mock@example.com` (role `ADMIN`)

Seeded movies include: `Arrival`, `Parasite`, `Spirited Away`, `Whiplash`, and `The Grand Budapest Hotel`.

## Project Structure

```
src/
  app.ts
  server.ts
  config/
    db.ts
    env.ts
  middlewares/
    auth.ts
    errorHandler.ts
    notFound.ts
    rateLimit.ts
    validate.ts
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.repository.ts
      auth.routes.ts
      auth.validators.ts
    movies/
      movie.controller.ts
      movie.service.ts
      movie.repository.ts
      movie.routes.ts
      movie.validators.ts
    reviews/
      review.controller.ts
      review.service.ts
      review.repository.ts
      review.routes.ts
      review.validators.ts
  routes/
    index.ts
  types/
    express.d.ts
  utils/
    errors.ts
    jwt.ts
    password.ts
    tokens.ts
scripts/
  migrate.js
  seedMock.js
db/
  schema.sql
docs/
  openapi.yaml
tests/
  setup.ts
  setupEnv.ts
  auth.test.ts
  movies.test.ts
  reviews.test.ts
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   # macOS/Linux
   cp .env.example .env

   # Windows PowerShell
   Copy-Item .env.example .env
   ```
3. Run migration (creates database if missing, then creates tables/indexes):
   ```bash
   npm run migration
   ```
4. Seed admin user:
   ```bash
   ADMIN_EMAIL=admin@movio.com ADMIN_PASSWORD=password ADMIN_USERNAME=adminmovio npm run seed:admin
   ```
5. Seed mock data (users, movies, reviews):
   ```bash
   npm run seed:mock
   ```
6. Seed mock data with randomized data:
   ```bash
   SEED_RANDOM=true npm run seed:mock
   ```
7. Reset tables then seed mock data:
   ```bash
   npm run seed:mock:reset
   ```
8. Randomized seeding options:
   ```bash
   SEED_RANDOM=true SEED_USERS=50 SEED_MOVIES=40 SEED_REVIEWS=200 SEED_RANDOM_SEED=1337 npm run seed:mock
   ```
9. Rollback database (drops tables):
   ```bash
   npm run rollback
   ```
10. Run development server:
   ```bash
   npm run dev
   ```

## API Base URL

`http://localhost:3000/api`

## Swagger Docs

`http://localhost:3000/docs`

## Testing

Ensure a PostgreSQL instance is running and that `DATABASE_URL_TEST` points to a test database.

```bash
npm test
```

## Docker

```bash
docker compose up --build
```

## Notes

- Admin-only routes: create/update/delete movies.
- Refresh tokens are stored hashed in the database and can be revoked.
- Rate limiting is in-memory and suitable for local or single-instance deployments.
- Mock seeding uses `SEED_PASSWORD` (default `password`) for all seeded users.

## Example API Calls

1. Login as a seeded user:
   ```bash
   curl -s -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"alice@example.com","password":"password"}'
   ```
2. Create a movie (admin only):
   ```bash
   ACCESS_TOKEN="replace_with_admin_access_token"
   curl -s -X POST http://localhost:3000/api/movies \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"New Movie","description":"Test","releaseDate":"2024-01-01","genres":["Drama"]}'
   ```
3. List movies:
   ```bash
   curl -s "http://localhost:3000/api/movies?page=1&limit=5"
   ```
4. Create a review:
   ```bash
   ACCESS_TOKEN="replace_with_user_access_token"
   curl -s -X POST http://localhost:3000/api/reviews \
     -H "Authorization: Bearer $ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"movieId":1,"rating":5,"comment":"Great movie"}'
   ```
