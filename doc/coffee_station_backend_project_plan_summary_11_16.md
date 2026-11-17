# Coffee'station Backend

## Bottom line

The backend moves Coffee'station from local demo data to a real application. It stores the menu, accounts, orders, bookings and contact messages, and serves them to the React frontend through a REST API.
It is an **Express 5 + TypeScript API** on **PostgreSQL** with **Prisma** and **Zod**. Express replaces the earlier NestJS plan.

## Key points

- **Server owns the prices** — Orders are priced from the database in one transaction. A price sent by the client is ignored, and prices are stored as whole cents.
- **Safe accounts** — Passwords are hashed and never returned. Login uses revocable database sessions in an httpOnly cookie, and a wrong password and an unknown email give the same error.
- **No double booking** — Duplicate emails and the last seat in a time slot are decided by the database, so two simultaneous requests give one success and one 409.
- **One error format** — Every route fails in the same JSON shape. Zod rejects unknown fields (no `role` injection), and unexpected errors return a safe 500.
- **Security first** — CORS for the frontend's exact origin, helmet and rate limiting are in place before the first auth route. The app refuses to start with missing config.
- **Built in six phases** — Foundation, Products, Authentication, Orders, Bookings and Contact, then Release. This follows the GitHub issues #1 and #3–#17. The Release phase has no ticket yet.

## Next actions

- **Decision needed**: Confirm Vitest + Supertest for tests, OpenAPI for the API docs, and database-stored sessions.
- **Merge the bootstrap** (#3, PR #19) — `main` and `develop` exist and Express + TypeScript with lint and `GET /health` is in review. Fix the review comments, then turn on branch protection for both branches.
- **Database setup** (#4) — Run PostgreSQL locally and run the first Prisma migration.
