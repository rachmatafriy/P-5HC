# PDHRS — Deployment Guide

Two supported paths: **Vercel + Supabase** (recommended) and **self-hosted Docker**.

---

## Option A — Vercel + Supabase (recommended)

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Database → Extensions**, enable `vector` and `uuid-ossp`.
3. Copy the connection strings:
   - **Pooled** (port 6543, `?pgbouncer=true`) → `DATABASE_URL`
   - **Direct** (port 5432) → `DIRECT_URL`
4. Copy **Project URL**, **anon key**, **service-role key**.

### 2. Apply the schema

```bash
DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy
psql "$DIRECT_URL" -f supabase/migrations/0001_extensions_and_rls.sql
```

### 3. Deploy to Vercel

1. Import the GitHub repo into Vercel.
2. Add environment variables (from `.env.example`): `DATABASE_URL`, `DIRECT_URL`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`, `ENCRYPTION_KEY`.
3. Deploy. Vercel runs `next build` (standalone output is enabled).

### 4. Schedule the AI coach (Vercel Cron)

Add to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/coach?cadence=MORNING_PLAN", "schedule": "0 6 * * *" },
    { "path": "/api/cron/coach?cadence=EVENING_REVIEW", "schedule": "0 20 * * *" },
    { "path": "/api/cron/coach?cadence=WEEKLY_REPORT", "schedule": "0 18 * * 0" },
    { "path": "/api/cron/coach?cadence=MONTHLY_REPORT", "schedule": "0 7 1 * *" }
  ]
}
```

> Implement `/api/cron/coach` to iterate active users and call
> `generateCoachArtifact`, or call `/api/ai/coach` per user with the `CRON_SECRET`.

---

## Option B — Self-hosted Docker

```bash
cp .env.example .env          # set OPENAI_API_KEY, CRON_SECRET, Supabase keys
docker compose up --build -d  # app :3000, postgres+pgvector :5432

# one-time schema setup
docker compose exec app npx prisma migrate deploy
docker compose exec db psql -U postgres -d pdhrs \
  -f /supabase/migrations/0001_extensions_and_rls.sql
```

The `Dockerfile` uses Next.js **standalone** output for a minimal runtime image
and runs as a non-root `nextjs` user.

---

## Environment variables

See [`.env.example`](../.env.example). Required for production:
`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`,
`CRON_SECRET`, `ENCRYPTION_KEY`.

## Backups

Enable Supabase **Point-in-Time Recovery**, or for self-hosted:

```bash
docker compose exec db pg_dump -U postgres pdhrs | gzip > backup-$(date +%F).sql.gz
```

## Post-deploy checklist

- [ ] `prisma migrate deploy` succeeded
- [ ] pgvector + RLS SQL applied
- [ ] RLS verified (a user cannot read another user's rows)
- [ ] Cron hitting `/api/ai/coach` with the correct `CRON_SECRET`
- [ ] CI green on `main`
