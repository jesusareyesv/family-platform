# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Family Platform** — a household hub for the Reyes-Altuve home. Current modules: Budget/Finance. Planned: Chores, Marriage/Us. The `docs/` folder contains household planning documents (product requirements, not code).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2, Alembic |
| DB — local dev | SQLite (auto-created, no setup) |
| DB — production | Supabase PostgreSQL |
| Auth — local dev | Local JWT via FastAPI (`AUTH_MODE=local`) |
| Auth — production | Supabase Auth JWT validated by FastAPI (`AUTH_MODE=supabase`) |

## Repository layout

```
api/               FastAPI backend
  main.py          app entrypoint; auto-creates tables when AUTH_MODE=local
  config.py        Settings (pydantic-settings, reads .env)
  database.py      SQLAlchemy engine + get_db dependency
  models/          ORM models (user.py, transaction.py)
  schemas/         Pydantic request/response schemas
  routers/         auth.py, transactions.py
  auth/            deps.py (get_current_user_id), local.py, supabase_jwt.py
  alembic/         migrations (run: alembic upgrade head)
  requirements.txt
  .env.example

family-platform/   Next.js frontend (UI only — no API routes)
  middleware.ts    cookie-based auth guard for /dashboard/*
  lib/
    api-client.ts  typed fetch wrappers → FastAPI
    token.ts       localStorage + cookie token helpers
    types.ts       shared TypeScript types
  app/(auth)/      login/signup page
  app/(dashboard)/ protected pages; layout.tsx has sidebar
  components/budget/  BalanceSummary, TransactionForm, TransactionList
  components/ui/   Button, SignOutButton
  components/dashboard/ UserInfo

docker-compose.yml  runs the API with SQLite; Next.js runs separately
data/              SQLite DB lives here (gitignored)
docs/              household planning documents (product requirements)
```

## Development

### Local (fastest — no Docker)

```bash
# Terminal 1 — API
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # defaults work for local dev
uvicorn main:app --reload     # http://localhost:8000
                              # tables are auto-created on first run

# Terminal 2 — Frontend
cd family-platform
cp .env.local.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### Local with Docker (API only)

```bash
docker-compose up             # API at http://localhost:8000
# Then run Next.js separately: cd family-platform && npm run dev
```

### Other commands

```bash
# Lint (frontend)
cd family-platform && npm run lint

# Build (frontend)
cd family-platform && npm run build

# Generate a new DB migration (after changing models)
cd api && alembic revision --autogenerate -m "describe change"
cd api && alembic upgrade head

# FastAPI interactive docs
open http://localhost:8000/docs
```

## Auth flow

**Local mode** (`AUTH_MODE=local`):
1. Login page → `POST /auth/login` (FastAPI) → JWT
2. Token stored in `localStorage` + a cookie (for middleware)
3. All API calls send `Authorization: Bearer <token>`
4. `auth/deps.py:get_current_user_id` verifies against `JWT_SECRET`

**Production mode** (`AUTH_MODE=supabase`):
1. Login page → `POST /auth/login` (FastAPI proxies to Supabase) → Supabase JWT
2. Same token storage and header pattern
3. `auth/deps.py` verifies the JWT against `SUPABASE_JWT_SECRET`

The frontend (`lib/api-client.ts`) is identical in both modes — only the backend `.env` changes.

## Adding a new module (e.g., Chores)

1. Add SQLAlchemy model in `api/models/chore.py`, import it in `api/models/__init__.py`
2. Add Pydantic schemas in `api/schemas/chore.py`
3. Add router in `api/routers/chore.py`, include it in `api/main.py`
4. Run `alembic revision --autogenerate -m "add chores"` + `alembic upgrade head`
5. Add fetch wrappers to `family-platform/lib/api-client.ts`
6. Create `family-platform/app/(dashboard)/chores/page.tsx`
7. Uncomment the nav entry in `app/(dashboard)/layout.tsx`
