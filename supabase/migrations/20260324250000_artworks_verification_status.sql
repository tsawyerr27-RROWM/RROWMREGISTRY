-- App + certificate trigger expect public.artworks.verification_status ('unverified' | 'verified').
-- Run if PostgREST returns 42703 "column artworks.verification_status does not exist".

alter table public.artworks
  add column if not exists verification_status text not null default 'unverified';

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'artworks'
      and c.conname = 'artworks_verification_status_check'
  ) then
    alter table public.artworks
      add constraint artworks_verification_status_check
      check (verification_status in ('unverified', 'verified'));
  end if;
end $$;

comment on column public.artworks.verification_status is
  'Artwork verification: unverified (default) or verified (certificate flow).';
