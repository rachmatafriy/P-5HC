# PDHRS — Personal Digital Health Recovery System

> Enterprise-grade, AI-powered platform to **recover your health after a Medical
> Check Up (MCU)**, track progress daily, predict future outcomes, and scale into
> a corporate **Occupational Health Management System** aligned with WHO, ILO,
> ISO 45001 and Indonesian occupational-health regulations.

[![CI](https://github.com/rachmatafriy/p-5hc/actions/workflows/ci.yml/badge.svg)](https://github.com/rachmatafriy/p-5hc/actions/workflows/ci.yml)

---

## ✨ Highlights

- **Deterministic clinical risk engine** — BMI, waist, cardiovascular, metabolic,
  diabetes, fatty-liver and hyperuricemia risk, a composite **Health Index
  (0–100)**, **biological age**, **life-expectancy** and a **recovery forecast**.
  Fully unit-tested; the AI _explains_ these numbers, it never invents them.
- **Four AI agents** (Health Coach, Nutritionist, Occupational Physician, Risk
  Assessor) built on the OpenAI API with **function calling** into the risk
  engine and a **RAG** knowledge base (pgvector).
- **24 product modules** from MCU management to Power BI export.
- **Glassmorphism UI**, dark mode, fully responsive (Next.js 15, Tailwind,
  shadcn/ui, Framer Motion, Recharts, TanStack Table).
- **Security-first**: Supabase Auth, RBAC, Row Level Security, field-level audit
  triggers, encryption-ready schema.

---

## 🏗️ Tech Stack

| Layer       | Technology                                                            |
| ----------- | -------------------------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, Recharts, TanStack Table |
| Backend     | Next.js Route Handlers + Server Actions, Prisma ORM                  |
| Data        | PostgreSQL / Supabase (Auth, Storage, RLS), pgvector                 |
| AI          | OpenAI API, Embeddings, RAG, Function Calling, Agent loop            |
| DevOps      | Docker, Docker Compose, GitHub Actions, Vercel                       |

---

## 📦 Module Map (24)

`Auth` · `Dashboard` · `MCU Management` · `Health Recovery` · `Weekly Monitoring`
· `Meal Planning` · `Grocery Planner` · `Meal Prep` · `Exercise Planner`
· `Water Tracker` · `Sleep Tracker` · `Medication Reminder` · `Health Surveillance`
· `Medical Documents` · `AI Health Coach` · `AI Nutritionist`
· `AI Occupational Physician` · `AI Risk Assessor` · `Fitness for Work` · `MAH Risk`
· `KPI Dashboard` · `Management Review` · `Reporting` · `Power BI Export`

---

## ⚡ Go live for free (easiest path)

The app runs in **demo mode with zero backend** — deploy it to Vercel's free tier
with **no environment variables** and it works immediately (sample data, AI uses
the built-in deterministic fallback). Add Supabase + OpenAI later to make it real.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rachmatafriy/p-5hc)

1. Click the button (or **vercel.com → Add New → Project → import this repo**).
2. **Deploy** — leave all env vars blank. Done: live at `https://<your-app>.vercel.app`.

> The build runs `prisma generate` automatically. No database is required for the
> demo; pages fall back to sample data and the rule-based meal/risk engines.

### Turn demo into production (still free)

1. Create a free **Supabase** project → enable the `vector` & `uuid-ossp` extensions.
2. In Vercel **Settings → Environment Variables**, add `DATABASE_URL`, `DIRECT_URL`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (and `OPENAI_API_KEY` if you want real AI).
3. From your machine, apply the schema once:
   ```bash
   DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy
   psql "$DIRECT_URL" -f supabase/migrations/0001_extensions_and_rls.sql
   ```
4. Redeploy. Auth + real persistence now active. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 🚀 Quick Start (local)

### 1. Prerequisites

- Node.js ≥ 20, npm
- Docker (for the local Postgres + pgvector database) **or** a Supabase project

### 2. Install & configure

```bash
git clone https://github.com/rachmatafriy/p-5hc.git
cd p-5hc
npm install
cp .env.example .env   # fill in values
```

### 3. Start the database

```bash
docker compose up -d db          # local Postgres with pgvector on :5432
```

### 4. Migrate, enable extensions & seed

```bash
npm run prisma:generate
npm run prisma:migrate           # creates the schema
psql "$DATABASE_URL" -f supabase/migrations/0001_extensions_and_rls.sql
npm run db:seed                  # demo org, user, MCU, plan, trackers
```

### 5. Run

```bash
npm run dev
# http://localhost:3000  (landing)  →  /dashboard
```

> The dashboard works in **demo mode** without Supabase configured; auth is only
> enforced once `NEXT_PUBLIC_SUPABASE_URL` points at a real Supabase project.

---

## 🧪 Quality

```bash
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
npm test            # Vitest — risk-engine unit tests
npm run build       # production build
```

CI runs lint → typecheck → test → build → docker build on every push/PR
(`.github/workflows/ci.yml`).

---

## 🐳 Docker (full stack)

```bash
docker compose up --build        # app on :3000, db on :5432
```

---

## 🧠 AI Coach scheduling

The coach endpoint is scheduler-driven (Vercel Cron / Supabase `pg_cron` /
GitHub Actions). It is protected by `CRON_SECRET`:

```bash
curl -X POST https://your-app/api/ai/coach \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId":"<uuid>","cadence":"MORNING_PLAN"}'
```

Cadences: `MORNING_PLAN` (daily AM) · `EVENING_REVIEW` (daily PM) ·
`WEEKLY_REPORT` (Sun) · `MONTHLY_REPORT` (monthly).

---

## 📚 Documentation

- [`docs/DATABASE.md`](docs/DATABASE.md) — ER diagram, schema & indexes
- [`docs/API.md`](docs/API.md) — REST API reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel & self-hosted deployment
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design & folder structure

---

## ⚠️ Medical disclaimer

PDHRS is a **screening and coaching** tool, **not a diagnostic device**. All risk
scores are simplified, screening-grade estimates. Always consult a licensed
clinician for medical decisions.

## License

MIT
