-- =============================================================================
-- PDHRS — Supabase supplementary migration
-- Run AFTER `prisma migrate deploy` has created the base tables.
-- Adds: pgvector for RAG, an embedding column + index on knowledge_chunks,
-- an audit trigger, and Row Level Security so users only see their own data.
-- =============================================================================

-- 1) Extensions ---------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- 2) RAG embeddings -----------------------------------------------------------
alter table knowledge_chunks
  add column if not exists embedding vector(1536);

-- IVFFlat index for approximate nearest-neighbour search (cosine distance).
create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC used by the RAG retriever.
create or replace function match_knowledge(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, title text, content text, similarity float)
language sql stable
as $$
  select id, title, content, 1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 3) Audit trigger ------------------------------------------------------------
create or replace function fn_audit() returns trigger language plpgsql as $$
declare
  v_user uuid;
begin
  begin
    v_user := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  exception when others then
    v_user := null;
  end;

  insert into audit_logs (id, "userId", action, entity, "entityId", before, after, "createdAt")
  values (
    uuid_generate_v4(),
    v_user,
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id)::text,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) end,
    now()
  );
  return coalesce(new, old);
end;
$$;

-- Attach the audit trigger to the most sensitive tables.
do $$
declare t text;
begin
  foreach t in array array['mcu_records','risk_assessments','fitness_for_work','surveillance_records','medical_documents']
  loop
    execute format('drop trigger if exists trg_audit_%1$s on %1$s;', t);
    execute format(
      'create trigger trg_audit_%1$s after insert or update or delete on %1$s
       for each row execute function fn_audit();', t);
  end loop;
end $$;

-- 4) Row Level Security -------------------------------------------------------
-- Helper: the owner column on each table is "userId" (auth uid).
do $$
declare t text;
begin
  foreach t in array array[
    'health_profiles','mcu_records','recovery_plans','weekly_checkins',
    'meal_plans','grocery_lists','workout_plans','water_logs','sleep_logs',
    'medications','reminders','medical_documents','surveillance_records',
    'fitness_for_work','health_index_snapshots','ai_interactions'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists owner_select on %I;', t);
    execute format('drop policy if exists owner_modify on %I;', t);
    execute format(
      'create policy owner_select on %I for select using (auth.uid() = "userId");', t);
    execute format(
      'create policy owner_modify on %I for all using (auth.uid() = "userId") with check (auth.uid() = "userId");', t);
  end loop;
end $$;

-- Users can read/update only their own profile row in `users`.
alter table users enable row level security;
drop policy if exists user_self on users;
create policy user_self on users for all using (auth.uid() = id) with check (auth.uid() = id);
