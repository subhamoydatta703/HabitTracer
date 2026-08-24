# HabitTracker

A small timezone-aware habit tracker. Users create habits, check in once per local
calendar day, backfill past days, and view current and longest streaks.

## Features

- Email/password authentication with bcrypt password hashing and JWT sessions.
- IANA timezone selected during registration.
- Habit CRUD with owner isolation.
- One check-in per habit per user-local day.
- Check-in UTC instant and counted local date stored separately.
- Today check-in, backfill, history, deletion, and clear API errors.
- Server-side current and longest streak calculations.
- PostgreSQL database-level uniqueness for duplicate prevention.
- Optional Docker Compose setup for PostgreSQL, API, and frontend.

## Local-day model

The server calculates a user's local date with `Intl.DateTimeFormat` and the stored
IANA timezone. A check-in stores `localDate` as a PostgreSQL `DATE` and `checkedAt`
as a UTC timestamp. Streaks compare only `localDate` values, never elapsed hours.

`currentStreak` ends on today when today is checked in. If today is not checked in,
it ends on yesterday. `longestStreak` is the longest consecutive run in the history.
Both values are calculated on the server and are never inferred by the frontend.

## Setup

Requirements: Bun 1.x, PostgreSQL, and optionally Docker.

```bash
docker compose up -d postgres
cd backend
cp .env.example .env
```

Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `PORT` in `backend/.env`.

```bash
bun install
bun run prisma:migrate
bun run dev
```

In another terminal:

```bash
cd frontend
bun install
bun run dev
```

Open `http://localhost:5173`.

## Full Docker stack

Create a root `.env` containing a strong `JWT_SECRET`, then run:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:8080` and the API at
`http://localhost:3001`.

## API

Authenticated routes use `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register with email, password, timezone |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the current user |
| POST | `/api/habits` | Create a habit |
| GET | `/api/habits` | List owned habits |
| GET | `/api/habits/:id` | Get an owned habit |
| PATCH | `/api/habits/:id` | Update an owned habit |
| DELETE | `/api/habits/:id` | Delete an owned habit |
| POST | `/api/habits/:habitId/check-ins` | Check in with `{ "date": "YYYY-MM-DD" }` |
| GET | `/api/habits/:habitId/check-ins` | List history |
| DELETE | `/api/habits/:habitId/check-ins/:date` | Remove a check-in |
| GET | `/api/dashboard` | Owned habits with server-calculated streaks |

## Tests

```bash
cd backend
bun test
bun run typecheck
```

Tests cover timezone conversion, IANA validation, local-date validation, duplicate
dates, future dates, dates before habit creation, backfill, and streak edge cases.
