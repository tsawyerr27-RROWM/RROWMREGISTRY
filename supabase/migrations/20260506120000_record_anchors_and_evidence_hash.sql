-- Cryptographic anchoring for registry records (evidence, certificates, provenance).

-- 1) dispute_evidence: store SHA-256 of uploaded file bytes (hex).
alter table public.dispute_evidence
  add column if not exists file_hash text;

comment on column public.dispute_evidence.file_hash is
  'SHA-256 hex digest of the stored file bytes (server-computed). Null for external_link evidence.';

-- 2) record_anchors: append-only hash anchoring table.
create table if not exists public.record_anchors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  record_type text not null,
  record_id uuid not null,
  hash text not null,
  anchored_at timestamptz not null default now(),
  constraint record_anchors_record_type_check check (
    record_type in ('certificate', 'evidence', 'provenance')
  )
);

comment on table public.record_anchors is
  'Append-only cryptographic anchors for registry records. Not on-chain; supports future anchoring workflows.';

create index if not exists record_anchors_record_idx
  on public.record_anchors (record_type, record_id);

create index if not exists record_anchors_hash_idx
  on public.record_anchors (hash);

create unique index if not exists record_anchors_unique
  on public.record_anchors (record_type, record_id, hash);

alter table public.record_anchors enable row level security;

-- Service-only by default (no authenticated policies yet).
grant all on public.record_anchors to service_role;

