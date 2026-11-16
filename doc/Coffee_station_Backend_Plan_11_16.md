# Coffee'station Backend — Project Plan

## 1. Project Overview

### 1.1 Purpose
The backend turns the Coffee'station frontend from a local-data demo into a real application. It stores the menu, accounts, orders, bookings and contact messages in a database and exposes them to the frontend through a REST API.

### 1.2 Project Objectives
1. Serve categories and products from the database instead of local frontend data.
2. Let customers register, log in, log out and manage their own profile.
3. Let guests and logged-in customers place orders. The server calculates every price.
4. Let logged-in customers see only their own order history.
5. Let visitors book a table without overbooking a time slot.
6. Save contact-form messages without letting spam flood the database.
7. Return every error in one JSON format and reject unknown or invalid input.
8. Be safe to deploy: validated config, security headers, rate limits, graceful shutdown.

### 1.3 Who Will Use
- The Coffee'station frontend (the only API client)
- Customers (through the frontend)
- Cafe owner (admin features come later)
- Team developers and QA (through the API docs)

---

## 2. Project Scope

### 2.1 Product Scope
- Products and categories
- Authentication and accounts
- Orders and order history
- Bookings
- Contact messages

### 2.2 Technical Scope

| Area | Technology |
|---|---|
| Runtime / framework | Node.js + Express 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM / migrations | Prisma |
| Validation | Zod |
| Auth | Server-side sessions in PostgreSQL + httpOnly cookie |
| Security | helmet, cors, express-rate-limit |
| Testing | Vitest + Supertest |
| API docs | OpenAPI |
| Version control | Git + GitHub (issues, PRs, `main` + `develop`) |

### 2.3 Future / Scalable Scope
Out of scope for this version:

- Admin role check and admin features
- Email verification and password reset
- Account deletion policy
- Real payment processing
- Realtime order status updates

---

## 3. Project Requirements / Features

### 3.1 Major Functions

#### Products
- List products, filter by category, get one product
- Prices stored as whole cents
- Repeatable seed from the frontend's menu data

#### Authentication
- Register (duplicate email returns 409, even for simultaneous requests)
- Login and logout with a revocable session
- `GET /auth/me` to restore login on page refresh
- Update name and phone, change password (other sessions end)

#### Orders
- Create an order as a guest or a customer; the server calculates the total
- Order and its items saved in one transaction
- Customer order history: list and view own orders only

#### Bookings
- Time slots with capacity
- Create booking; a full slot returns 409, past dates are rejected
- Two simultaneous requests for the last seat give one success and one 409

#### Contact
- Save contact-form messages, rate limited

#### Platform
- One error format, one error handler, safe 500s
- Validated environment config
- Health check including the database, graceful shutdown, API docs

---

## 4. Technical Approach

### 4.1 Backend

| Choice | Reason |
|---|---|
| **Express 5** | Small and well known by the team. Express 5 handles errors thrown in async handlers without extra wrappers. Replaces the NestJS plan: NestJS adds modules, decorators and dependency injection that a project this size does not need. |
| **TypeScript** | Same language as the frontend; catches mistakes at build time. |
| **Zod** | One schema validates input, gives a typed result, and validates env config. Strict schemas reject unknown fields (stops `role` injection). |
| **Layer-first folders** | Routes, controllers, services and schemas each live together. Easy to find code at this size. |

### 4.2 Database

| Choice | Reason |
|---|---|
| **PostgreSQL** | Relational data (users, orders, items) with real transactions, unique constraints and row locking, which bookings and registration need. |
| **Prisma** | Type-safe queries, repeatable migrations and a seed script. |
| **Prices in whole cents** | Avoids floating-point rounding errors in totals. |

### 4.3 Authentication / Security

1. Hash passwords with a slow, salted algorithm; never store or return them.
2. Use server-side sessions in the database, sent in an httpOnly cookie. A session can be revoked on logout or password change.
3. Allow CORS only for the frontend's exact origin.
4. Use helmet and rate limiting, set up before the first route that reveals whether an account exists.
5. A wrong password and an unknown email return the same error.
6. Never trust client input: validate every request with Zod, reject unknown fields, ignore client-sent prices.
7. Enforce uniqueness and capacity in the database (unique constraints, transactions), not only in code.
8. Never use default secrets. The app refuses to start if a required env value is missing.
9. Never commit `.env`; keep `.env.example` with no real secrets.
10. Unexpected errors return a generic 500; details go to the log only.

### 4.4 Testing
Vitest runs unit and integration tests; Supertest calls the Express app directly. The runner is installed with the registration ticket, the first feature with logic worth testing. Concurrency cases (duplicate email, last seat) get their own tests.

---

## 5. Project Structure

### 5.1 High-Level System Architecture

```text
┌─────────────────────────────────┐
│       React + Vite Web          │
└────────────────┬────────────────┘
                 │  REST (JSON) + httpOnly session cookie
                 ▼
┌─────────────────────────────────┐
│          Express API            │
│  security → routes → validate   │
│  → controllers → services       │
└────────────────┬────────────────┘
                 │  Prisma
                 ▼
┌─────────────────────────────────┐
│          PostgreSQL             │
└─────────────────────────────────┘
```

### 5.2 Folder Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── config/        env.ts (Zod-validated config)
│   ├── routes/        one router per area
│   ├── controllers/   read request, call service, send response
│   ├── services/      business rules and database access
│   ├── schemas/       Zod request schemas
│   ├── middleware/    security, auth, validate, error handler
│   ├── errors/        shared error classes
│   ├── lib/           Prisma client and other shared helpers
│   ├── app.ts         builds the Express app (used by tests)
│   └── server.ts      starts the server, handles shutdown
├── tests/
├── doc/
├── .env.example
├── .editorconfig
└── package.json
```

### 5.3 Main Modules
- **Products:** categories and products routes, controller, service
- **Auth:** register, login, logout, `me`, profile, change password
- **Orders:** create order, order history
- **Bookings:** time slots, create booking
- **Contact:** save message
- **Shared:** env config, error classes, error handler, validation middleware, security middleware, auth middleware

---

## 6. Development Plan

Phases follow the issue numbers in `Backend_Issues.md`.

### Phase 1 — Foundation (issues 1–5)
Plan doc, bootstrap Express + TypeScript on `main`/`develop`, PostgreSQL + Prisma, env config, error handling and validation.

### Phase 2 — Products (issues 6–7)
Categories and products tables with seed, then the read endpoints. The frontend can switch from local data to the API.

### Phase 3 — Authentication (issues 8–12)
Security baseline first, then registration (and the test runner), login/logout, auth middleware and `me`, profile and password change.

### Phase 4 — Orders (issues 13–14)
Server-priced order creation in a transaction, then customer order history.

### Phase 5 — Bookings and Contact (issues 15–16)
Capacity-safe bookings and rate-limited contact messages.

### Phase 6 — Release (issue 17)
Graceful shutdown, database health check, API docs, production check on the real host.

### 6.1 Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Two requests race (same email, last seat) | Database unique constraint and a transaction; a dedicated concurrency test for each. |
| Client tampers with prices | Server reads prices from the database and ignores any price in the request. |
| Account existence leaks through login or register | Same error for wrong password and unknown email; security baseline and rate limit exist before the auth routes. |
| Mass assignment (client sends `role`) | Strict Zod schemas reject unknown fields. |
| Missing or default secrets in production | Env config fails at startup; `.env.example` holds no secrets; `NODE_ENV=production` confirmed on the host. |
| Frontend and API drift apart | Seed uses the frontend's menu data; API docs checked against real routes before release. |
| Existing `backend/` folder is an old Express scaffold with built frontend files | Bootstrap ticket starts clean TypeScript structure and removes the leftovers. |
| Sessions in the database add a query per request | Acceptable at cafe scale; index the session lookup and delete expired sessions. |

### 6.2 Definition of Done (whole backend)
- Every ticket in `Backend_Issues.md` is merged into `develop` with its checks met.
- All routes validate input and use the shared error format.
- Tests pass, including both concurrency cases.
- API docs match the real routes and the app runs in production mode on the real host.
