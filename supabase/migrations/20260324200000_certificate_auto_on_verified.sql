-- Certificate is the artifact of verified state: when verification_status becomes
-- 'verified', ensure a certificates row exists (idempotent, matches app/api/issue-certificate).
--
-- SOURCE OF TRUTH: public.artworks
--   - Writes (e.g. admin verification) update public.artworks.verification_status.
--   - This trigger MUST live on public.artworks, not on public.artwork_read_model.
--
-- READ MODEL: The app often reads verification_status from public.artwork_read_model
--   (registry, /artwork, /certificate, /verify, dashboard list, search index).
--   artwork_read_model must reflect artworks (typically a VIEW over base tables, or
--   another mechanism that cannot drift). If it is a separate copy without sync, fix the
--   schema—do not move this trigger to the read model.

create or replace function public.ensure_certificate_on_artwork_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'verified'
     and new.registry_id is not null
     and (
       tg_op = 'INSERT'
       or old.verification_status is distinct from new.verification_status
     )
  then
    insert into public.certificates (artwork_id, certificate_number, issued_at, revoked)
    select new.id, new.registry_id, now(), false
    where not exists (
      select 1 from public.certificates c where c.artwork_id = new.id
    );
  end if;
  return new;
end;
$$;

comment on function public.ensure_certificate_on_artwork_verified() is
  'After artwork becomes verified: insert certificates row if missing (idempotent).';

drop trigger if exists trg_artworks_certificate_on_verified on public.artworks;

create trigger trg_artworks_certificate_on_verified
  after insert or update of verification_status on public.artworks
  for each row
  execute procedure public.ensure_certificate_on_artwork_verified();
