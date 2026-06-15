-- PR-SCHEMA-AUDIT: reconcile live public.certificates with repository intent.
-- Repo source of truth: 20260401090000_prelaunch_consolidation.sql
--   - multiple certificate rows per artwork allowed
--   - non-unique idx_certificates_artwork_id
--   - certificates_artwork_id_key dropped
-- Live drift: three hidden UNIQUE(artwork_id) constraints not present in repo migrations.

-- ---------------------------------------------------------------------------
-- 1) Drop duplicate / hidden one-per-artwork UNIQUE constraints
-- ---------------------------------------------------------------------------
alter table public.certificates
  drop constraint if exists certificates_artwork_id_unique;

alter table public.certificates
  drop constraint if exists certificates_artwork_unique;

alter table public.certificates
  drop constraint if exists one_certificate_per_artwork;

-- Original Supabase name (also dropped in prelaunch consolidation)
alter table public.certificates
  drop constraint if exists certificates_artwork_id_key;

-- ---------------------------------------------------------------------------
-- 2) Non-unique artwork lookup index (latest cert per artwork queries)
-- ---------------------------------------------------------------------------
create index if not exists idx_certificates_artwork_id
  on public.certificates (artwork_id);

-- ---------------------------------------------------------------------------
-- 3) issued_by FK — repo: auth.users (20260327430000_certificate_v2_snapshot)
-- ---------------------------------------------------------------------------
alter table public.certificates
  drop constraint if exists certificates_issued_by_fkey;

alter table public.certificates
  add constraint certificates_issued_by_fkey
  foreign key (issued_by) references auth.users (id)
  on delete set null;
