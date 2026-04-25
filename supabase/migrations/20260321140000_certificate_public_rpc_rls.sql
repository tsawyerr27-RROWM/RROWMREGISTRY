-- Public certificate *status* (no hashes / numbers) for anonymous registry pages.
-- Full certificate rows remain available to authenticated users via RLS.

-- 1) Status for a single artwork (registry detail, verify page).
-- Returns 0 rows if no certificate exists (caller treats as not issued).
create or replace function public.get_certificate_public_status_single(p_artwork_id uuid)
returns table (has_certificate boolean, revoked boolean, revoked_reason text)
language sql
stable
security definer
set search_path = public
as $$
  select true, c.revoked, c.revoked_reason
  from public.certificates c
  where c.artwork_id = p_artwork_id
  limit 1;
$$;

comment on function public.get_certificate_public_status_single(uuid) is
  'Public trust layer: existence + revoked flags only. No certificate hash or number.';

grant execute on function public.get_certificate_public_status_single(uuid) to anon, authenticated;

-- 2) Batch status for registry index (artwork_id + revoked when row exists)
create or replace function public.get_certificate_public_status_batch(p_artwork_ids uuid[])
returns table (artwork_id uuid, revoked boolean)
language sql
stable
security definer
set search_path = public
as $$
  select c.artwork_id, c.revoked
  from public.certificates c
  where c.artwork_id = any(p_artwork_ids);
$$;

grant execute on function public.get_certificate_public_status_batch(uuid[]) to anon, authenticated;

-- 3) RLS: block anonymous direct reads on certificates; allow authenticated full read.
alter table public.certificates enable row level security;

drop policy if exists "certificates_select_authenticated" on public.certificates;
drop policy if exists "certificates_all_service" on public.certificates;

create policy "certificates_select_authenticated"
  on public.certificates
  for select
  to authenticated
  using (true);

-- Inserts/updates typically use service role (API) or controlled RPCs — add explicit if needed.
