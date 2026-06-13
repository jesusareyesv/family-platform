# Platform Analysis & Architecture Roadmap
*Reyes-Altuve Family Platform — June 2026*

---

## 1. What Has Been Built

### App skeleton
- **Auth flow**: email/password login + sign-up via Supabase Auth. The root page redirects authenticated users to `/dashboard/budget` and everyone else to `/login`.
- **Dashboard shell**: sidebar nav, protected layout that checks auth on every server render, sign-out.
- **Budget module** (`/dashboard/budget`):
  - Month navigator (previous/current, forward blocked).
  - Three summary cards: Total Income, Total Expenses, Balance.
  - Transaction list with category icons, date, type badge, and per-row delete.
  - Transaction form (add only): type toggle, amount, date, category dropdown, optional description.
  - API routes: `GET /api/transactions?month=YYYY-MM`, `POST /api/transactions`, `DELETE /api/transactions/:id`.
- **Database**: `transactions` table in Supabase with UUID PK, RLS policies (user sees only their own rows), indexes on `user_id`, `date`, `type`.
- **Shared UI**: `Button` component with four variants and loading spinner.
- **Types**: `Transaction`, `TransactionInsert`, category constant arrays in `lib/types.ts`.

---

## 2. Gaps — What the Docs Describe vs. What Exists

### Budget module gaps

| Feature described in `01_Budget_and_Financial_Planning.md` | Status |
|---|---|
| Income + Expense tracking by category | ✅ Done |
| Month navigation | ✅ Done |
| Balance summary | ✅ Done |
| **Edit a transaction** (correct a typo or wrong amount) | ❌ Missing — only add/delete |
| **Category spending breakdown** (how much went to Groceries, Cats, etc.) | ❌ Missing |
| **Savings goals progress** (emergency fund target: 3-6 months) | ❌ Missing |
| **Budget targets per category** (set a monthly cap, see how close you are) | ❌ Missing |
| **Shared household view** (both partners see the same data) | ❌ Missing — currently each user is siloed |
| **Charts**: spending over time, income vs. expenses trend | ❌ Missing |
| Weekly check-in reminder / prompt | ❌ Missing |
| Quarterly financial date reminder | ❌ Missing |
| Cat fund / sub-account tracking | ❌ Missing |
| Export / download transactions | ❌ Missing |

### Modules not yet started

| Module | Source doc | Status |
|---|---|---|
| **Chores** (`/dashboard/chores`) | `02_House_Chores_and_Activities.md` | ❌ Nav entry commented out, no code |
| **Marriage / Us** (`/dashboard/us`) | `03_Marriage_Planning.md` | ❌ Nav entry commented out, no code |

### Chores module would need
- Chore list with owner, frequency tier (daily/weekly/monthly/quarterly), and "done" toggle.
- Weekly completion view (what's been done vs. pending this week).
- Monthly check-in prompt.
- Cat care section: feeding log, vet scheduling, next checkup dates per cat.

### Marriage module would need
- Goals tracker (short/medium/long term), each with a completion checkbox and notes.
- Weekly date reminder + whose turn to plan.
- Monthly "State of Us" check-in prompt with the four questions from the doc.
- Annual relationship review reminder.
- Love languages display (filled in per person).
- Resources list.

### Infrastructure gaps
- **No local dev environment** — everything hits Supabase, requiring live credentials for any development.
- **No tests** — no unit, integration, or API tests.
- **No data validation beyond basic** — e.g., no check that `amount` has at most two decimal places at the API layer.
- **Transactions are per-user, not per-household** — if both partners sign up with different accounts, they each see their own data. A shared household concept is missing.

---

## 3. Quick Wins (No Architecture Change Needed)

These can be done in the current Next.js-only setup and address the most noticeable UX gaps:

1. **Edit transaction** — add a PUT endpoint (`/api/transactions/:id`) and an inline edit mode in `TransactionList`.
2. **Category breakdown** — add a `SpendingByCategory` component below `BalanceSummary` on the budget page, computed client-side from the existing transactions array.
3. **Household link** — add a `households` table and a `household_id` foreign key on `transactions`, so both partners share a view. Invite flow can be as simple as sharing a join code.
4. **Nav active state** — the current sidebar links have no active highlighting (the CSS class `hover:bg-indigo-50` is only on hover, no `aria-current` or active variant).

---

## 4. Architecture Migration Plan: Next.js + FastAPI + Dual Database

The goal is:

| Environment | Frontend | Backend | Database | Auth |
|---|---|---|---|---|
| **Web (production)** | Next.js (UI only) | FastAPI | Supabase PostgreSQL | Supabase Auth (JWT) |
| **Local (development)** | Next.js (UI only) | FastAPI | SQLite | Simple JWT (no email confirmation) |

Next.js API routes (`app/api/`) are **removed**. The frontend calls the FastAPI server directly. Next.js becomes a pure UI layer.

---

### 4.1 Repository structure after migration

```
ReyesAltuveHouse/
├── family-platform/          # Next.js frontend (UI only, no API routes)
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── api.ts            # typed fetch wrappers → FastAPI
│   │   ├── auth.ts           # token storage + refresh helpers
│   │   └── types.ts          # shared TS types (mirrors Pydantic schemas)
│   └── ...
├── api/                      # FastAPI backend
│   ├── main.py
│   ├── config.py             # reads env vars, picks DB engine
│   ├── database.py           # SQLAlchemy engine + session factory
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── transaction.py
│   │   ├── chore.py
│   │   └── user.py
│   ├── schemas/              # Pydantic request/response schemas
│   │   ├── transaction.py
│   │   └── auth.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── transactions.py
│   │   ├── chores.py
│   │   └── marriage.py
│   ├── auth/
│   │   ├── supabase.py       # validates Supabase JWTs (production)
│   │   └── local.py          # issues/validates local JWTs (dev)
│   ├── migrations/           # Alembic
│   │   └── versions/
│   ├── requirements.txt
│   └── pyproject.toml
├── docker-compose.yml        # local stack: FastAPI + SQLite (or Postgres)
├── docs/
└── CLAUDE.md
```

---

### 4.2 FastAPI — key design decisions

**Database abstraction via SQLAlchemy**

SQLAlchemy supports both PostgreSQL and SQLite with the same ORM models. The only difference is the connection string, set via environment variable:

```
# .env.local (local dev)
DATABASE_URL=sqlite:///./family.db
AUTH_MODE=local
JWT_SECRET=dev-secret-not-for-production

# .env.production (web)
DATABASE_URL=postgresql://...  # from Supabase
AUTH_MODE=supabase
SUPABASE_JWT_SECRET=...        # from Supabase dashboard → Settings → API → JWT Secret
```

`config.py` reads these and `database.py` creates the engine. No code changes needed to switch environments.

**Auth abstraction**

FastAPI uses a dependency injection pattern. A single `get_current_user` dependency switches behavior based on `AUTH_MODE`:

```python
# auth/deps.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    if settings.auth_mode == "supabase":
        return verify_supabase_jwt(token)   # validates against Supabase JWKS
    else:
        return verify_local_jwt(token)      # validates against local JWT_SECRET
```

All route handlers just declare `user: User = Depends(get_current_user)` — they never know which mode they're running in.

**Production auth flow (Supabase)**

The Next.js frontend continues to use `@supabase/ssr` for the login page only. On successful login, Supabase returns a JWT. The frontend sends this JWT as `Authorization: Bearer <token>` on every API call to FastAPI. FastAPI verifies the JWT using Supabase's public JWKS endpoint. Supabase Auth remains the identity provider; FastAPI never handles passwords in production.

**Local auth flow**

A simple `/auth/login` endpoint in FastAPI that accepts `{email, password}`, looks up the user in SQLite, and returns a short-lived JWT signed with `JWT_SECRET`. No email confirmation. The frontend's login page detects `AUTH_MODE` and calls FastAPI directly instead of Supabase.

```python
# routers/auth.py  (local mode only)
@router.post("/login")
async def login(form: LoginForm, db: Session = Depends(get_db)):
    user = authenticate_user(db, form.email, form.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
```

---

### 4.3 Next.js changes

1. **Delete** `app/api/` entirely.
2. **Replace** `lib/supabase/server.ts` and `lib/supabase/client.ts` with `lib/api.ts` — a thin layer of typed `fetch` wrappers pointing to `NEXT_PUBLIC_API_URL`.
3. **Auth**: in production, keep Supabase's `createBrowserClient` only for the login flow (it handles the token). Store the token in a cookie for server-side access. In local, swap to a simple login form that calls `POST /auth/login` on FastAPI.
4. Environment variable `NEXT_PUBLIC_API_URL=http://localhost:8000` for local, `https://api.yourdomain.com` for production.

Example `lib/api.ts`:
```typescript
const API = process.env.NEXT_PUBLIC_API_URL;

export async function getTransactions(month: string, token: string) {
  const res = await fetch(`${API}/transactions?month=${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json() as Promise<Transaction[]>;
}
```

---

### 4.4 Local development with Docker Compose

```yaml
# docker-compose.yml
services:
  api:
    build: ./api
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: sqlite:///./family.db
      AUTH_MODE: local
      JWT_SECRET: dev-secret
    volumes:
      - ./api:/app          # hot-reload
      - ./data:/app/data    # persist SQLite file

  web:
    build: ./family-platform
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      AUTH_MODE: local
    depends_on: [api]
```

Run everything locally: `docker-compose up`
Run without Docker (faster iteration): start each separately:
```bash
# terminal 1
cd api && uvicorn main:app --reload

# terminal 2
cd family-platform && npm run dev
```

---

### 4.5 Migration steps (suggested order)

1. **Scaffold FastAPI** — `api/` directory, SQLAlchemy models matching the current Supabase schema, Alembic for migrations, Pydantic schemas mirroring `lib/types.ts`.
2. **Port transactions API** — implement `GET /transactions`, `POST /transactions`, `DELETE /transactions/{id}`, `PUT /transactions/{id}` (adds the missing edit feature).
3. **Wire local auth** — local JWT login so development works without Supabase.
4. **Update Next.js** — replace `lib/supabase/*` with `lib/api.ts`, delete `app/api/` routes, update `budget/page.tsx` to call new wrappers.
5. **Verify parity** — both the local (SQLite) and production (Supabase) paths work end-to-end.
6. **Wire Supabase JWT validation** — production auth in FastAPI so deployment works.
7. **Add Alembic migrations** — commit initial schema, then future changes go through Alembic (not manual SQL in Supabase dashboard).
8. **Build Chores module** — new DB table, FastAPI router, Next.js page.
9. **Build Marriage module** — goals table, check-in prompts, Next.js page.

---

## 5. Summary Priority Table

| Priority | Item | Effort |
|---|---|---|
| High | Edit transaction | Small |
| High | Category spending breakdown | Small |
| High | FastAPI scaffold + transactions port | Medium |
| High | Local SQLite dev environment | Medium |
| Medium | Household / shared view (both partners) | Medium |
| Medium | Budget targets per category | Medium |
| Medium | Chores module | Large |
| Medium | Marriage module | Large |
| Low | Charts (spending trend, by category) | Medium |
| Low | Weekly/quarterly check-in reminders | Small (once modules exist) |
| Low | Export transactions (CSV) | Small |

---

*Last updated: June 2026.*
