-- Ownership parties: support both platform users AND external buyers/sellers.

alter table public.ownership_events
  alter column to_user_id drop not null;

alter table public.ownership_events
  add column if not exists to_name text,
  add column if not exists to_type text,
  add column if not exists from_name text,
  add column if not exists from_type text;

