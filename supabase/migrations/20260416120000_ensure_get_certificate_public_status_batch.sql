-- Ensure batch certificate status RPC exists (some environments only had single-RPC migrations applied).
-- App falls back to single RPC if batch is missing; this restores one round-trip when present.

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

comment on function public.get_certificate_public_status_batch(uuid[]) is
  'Public trust layer: certificate rows for many artwork_ids (existence + revoked only).';

grant execute on function public.get_certificate_public_status_batch(uuid[]) to anon, authenticated;
