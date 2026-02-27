# Movieo

![Movieo logo](docs/brand/logo.svg)

Movieo is a full-stack movie review app with a React + Vite frontend and a Node.js + TypeScript API backed by PostgreSQL.

**Tagline:** Review films, share opinions, discover favorites.

## What's Inside
- `client/` React app (Vite + Tailwind).
- `server/` Movie Review API (Express + PostgreSQL + JWT).

## Quick Start
1. Install client dependencies and start the UI:
   ```bash
   cd client
   npm install
   npm run dev
   ```
2. Install server dependencies and start the API:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. Configure database + seeds:
   - Follow the steps in `server/README.md` for `.env`, migrations, and mock data.

## Development Notes
- API base URL: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/docs`

## Screenshot
![Movieo app screenshot](docs/screenshots/app.svg)

## Scripts
Client:
- `npm run dev` Start the Vite dev server.
- `npm run build` Build the client.
- `npm run preview` Preview the production build.

Server:
- `npm run dev` Start the API in watch mode.
- `npm run migration` Run DB migrations (creates DB/tables).
- `npm run seed:mock` Seed users, movies, and reviews.
- `npm test` Run API tests.
