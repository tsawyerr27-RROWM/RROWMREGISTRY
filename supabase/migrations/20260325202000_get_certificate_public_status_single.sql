-- Public certificate status RPC used by registry/artwork/verify pages.
-- Error seen: PGRST202 could not find public.get_certificate_public_status_single(p_artwork_id)

create or replace function public.get_certificate_public_status_single(
  p_artwork_id uuid
)
returns table (
  has_certificate boolean,
  revoked boolean,
  revoked_reason text
)
language sql
security definer
set search_path = public
as $$
  select
    exists (select 1 from public.certificates c where c.artwork_id = p_artwork_id) as has_certificate,
    coalesce((
      select c.revoked
      from public.certificates c
      where c.artwork_id = p_artwork_id
      order by c.issued_at desc nulls last
      limit 1
    ), false) as revoked,
    (
      select c.revoked_reason
      from public.certificates c
      where c.artwork_id = p_artwork_id
      order by c.issued_at desc nulls last
      limit 1
    ) as revoked_reason;
$$;

comment on function public.get_certificate_public_status_single(uuid) is
  'Public RPC: certificate presence + revocation for one artwork_id.';

grant execute on function public.get_certificate_public_status_single(uuid) to anon, authenticated;

