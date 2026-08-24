# HabitTracker

A habit-tracking application. This is a monorepo containing a Bun/TypeScript backend
backed by Prisma and PostgreSQL.

> **Note:** This project was scaffolded with `bun init`. The `frontend/` directory is
> reserved for the application frontend, which will be documented here once it is added.

## Tech Stack

| Layer     | Technology                                            |
| --------- | ----------------------------------------------------- |
| Runtime   | [Bun](https://bun.com) – fast all-in-one JS runtime   |
| Language  | TypeScript (strict, ESM, Bun bundle mode)             |
| ORM       | [Prisma](https://prisma.io) 7.x                       |
| Database  | PostgreSQL                                            |

## Project Structure

```
HabitTracker/
├── backend/                  # Bun + TypeScript + Prisma API
│   ├── index.ts             # Application entrypoint
│   ├── package.json         # Bun package manifest & dependencies
│   ├── prisma.config.ts     # Prisma config (reads DATABASE_URL)
│   ├── prisma/
│   │   └── schema.prisma    # Prisma schema (client generated to ./generated)
│   ├── tsconfig.json        # TypeScript / Bun compiler options
│   └── README.md            # Auto-generated backend README (bun init)
└── frontend/                 # (coming soon)
```

## Prerequisites

- [Bun](https://bun.com) runtime (project was created with bun v1.3.14+)
- Node.js (for Bun tooling)
- A PostgreSQL database

## Getting Started

### 1. Configure environment

Copy the example env file and fill in your database connection string:

```bash
cp .env.example backend/.env
```

Then edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

> `.env` is gitignored. Never commit real credentials.

### 2. Install dependencies

```bash
cd backend
bun install
```

### 3. Generate the Prisma client and set up the database

Prisma commands are run through Bun. From `backend/`:

```bash
# Generate the typed Prisma client (schema -> ./generated)
bun --bun run prisma generate

# Push the schema to your database (no migration files)
bun --bun run prisma db push
```

### 4. Run the backend

```bash
cd backend
bun run index.ts
```

The backend currently prints `Hello via Bun!` — this is the scaffolded entrypoint where
the application server will be wired up.

## Development Commands

| Command                          | Description                                  |
| -------------------------------- | -------------------------------------------- |
| `bun install`                    | Install dependencies (package.json)          |
| `bun run index.ts`               | Run the backend entrypoint                   |
| `bun --bun run prisma generate`  | Generate the typed Prisma client             |
| `bun --bun run prisma db push`   | Push the schema to the database              |
| `bun --bun run prisma migrate`   | Create & apply migrations                    |

## Environment Variables

| Variable        | Required | Description                                                                  |
| --------------- | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`  | Yes       | PostgreSQL connection string used by Prisma (`prisma.config.ts` reads it).   |

## Notes

- Scaffolded with `bun init` – see `backend/README.md` for the auto-generated backend notes.
- `.gitignore` at the repo root covers secrets, dependencies, build output, and the
  Prisma generated client. Your existing `backend/.gitignore` also remains in place.