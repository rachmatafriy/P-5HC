# PDHRS — Architecture

## Layered design

```
┌──────────────────────────────────────────────────────────────┐
│  UI (Next.js App Router, RSC)                                  │
│  app/(dashboard)/* · components/ui · components/charts         │
├──────────────────────────────────────────────────────────────┤
│  API (Route Handlers) · Server Actions                        │
│  app/api/health/assess · app/api/ai/coach                     │
├──────────────────────────────────────────────────────────────┤
│  Domain libraries                                             │
│  lib/health (deterministic engine) · lib/ai (agents, tools)   │
├──────────────────────────────────────────────────────────────┤
│  Data access — Prisma ORM · Supabase (Auth/Storage/RLS)       │
├──────────────────────────────────────────────────────────────┤
│  PostgreSQL + pgvector                                        │
└──────────────────────────────────────────────────────────────┘
```

### Principle: AI never invents numbers

The **deterministic engine** (`src/lib/health/calculations.ts`) is the single
source of truth for every clinical number. AI agents reach it only through
**function calling** (`src/lib/ai/tools.ts`). This keeps clinical outputs
reproducible, testable, and auditable; the LLM contributes language and
prioritisation, not arithmetic.

## Folder structure

```
.
├── prisma/
│   ├── schema.prisma            # full domain model (all 24 modules' data)
│   └── seed.ts                  # demo org/user/MCU/plan/trackers
├── supabase/migrations/
│   └── 0001_extensions_and_rls.sql   # pgvector, RAG RPC, audit, RLS
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # auth UI
│   │   ├── (dashboard)/         # 24 module routes + shared layout
│   │   ├── api/                 # route handlers
│   │   ├── layout.tsx           # root + ThemeProvider
│   │   └── globals.css          # design tokens + glassmorphism
│   ├── components/
│   │   ├── ui/                  # shadcn primitives
│   │   ├── layout/              # sidebar, theme toggle, module scaffold
│   │   ├── charts/              # Recharts wrappers
│   │   └── dashboard/           # stat cards etc.
│   ├── config/navigation.ts     # 24-module sidebar map
│   ├── lib/
│   │   ├── health/              # ⭐ deterministic risk engine (+ tests)
│   │   ├── ai/                  # openai, prompts, tools, agent loop, coach
│   │   ├── supabase/            # browser + server clients
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── middleware.ts            # Supabase session refresh + route guard
├── Dockerfile · docker-compose.yml · .github/workflows/ci.yml
└── docs/                        # DATABASE · API · DEPLOYMENT · ARCHITECTURE
```

## AI agent loop

`runAgent()` (`src/lib/ai/agent.ts`):

1. Send system + user prompt with tool schemas.
2. If the model emits `tool_calls`, execute them against the deterministic engine
   and feed results back (bounded rounds).
3. Return the final text + token usage; coach artifacts are persisted to
   `ai_interactions`.

## Security model

- **Auth**: Supabase Auth (JWT). `middleware.ts` refreshes the session and guards
  non-public routes.
- **RBAC**: `Role` enum (`USER/CLINICIAN/HSE/ADMIN/AUDITOR`).
- **RLS**: per-user `owner_select`/`owner_modify` policies (`auth.uid() = "userId"`).
- **Audit**: DB triggers capture before/after JSON for sensitive tables.
- **Secrets**: server-only env vars; the AI cron endpoint is `CRON_SECRET`-gated.
```
