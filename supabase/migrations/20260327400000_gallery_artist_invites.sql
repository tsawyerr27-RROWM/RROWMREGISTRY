-- Artist ↔ Gallery collaboration: invites + represented flag.

-- 1) represented_by_gallery flag on artists (informational / future gating)
alter table public.artists
  add column if not exists represented_by_gallery boolean not null default false;

comment on column public.artists.represented_by_gallery is
  'True when artist has an active representation relationship with a gallery.';

-- 2) Email-based invites from galleries to artists
create table if not exists public.gallery_artist_invites (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  artist_email text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gallery_artist_invites_status_check'
  ) then
    alter table public.gallery_artist_invites
      add constraint gallery_artist_invites_status_check
      check (status in ('pending', 'accepted', 'declined'));
  end if;
exception
  when duplicate_object then null;
end $$;

create index if not exists gallery_artist_invites_gallery_id_idx
  on public.gallery_artist_invites (gallery_id);

comment on table public.gallery_artist_invites is
  'Email-based invitations from galleries to artists; acceptance flow sets artists.gallery_id + represented_by_gallery.';

-- RLS: gallery staff may see and create their own invites
alter table public.gallery_artist_invites enable row level security;

drop policy if exists "gallery_artist_invites_select_own_gallery" on public.gallery_artist_invites;
create policy "gallery_artist_invites_select_own_gallery"
  on public.gallery_artist_invites for select
  to authenticated
  using (
    exists (
      select 1 from public.gallery_users gu
      where gu.gallery_id = gallery_artist_invites.gallery_id
        and gu.user_id = auth.uid()
    )
  );

drop policy if exists "gallery_artist_invites_insert_own_gallery" on public.gallery_artist_invites;
create policy "gallery_artist_invites_insert_own_gallery"
  on public.gallery_artist_invites for insert
  to authenticated
  with check (
    exists (
      select 1 from public.gallery_users gu
      where gu.gallery_id = gallery_artist_invites.gallery_id
        and gu.user_id = auth.uid()
    )
  );

grant select, insert on public.gallery_artist_invites to authenticated;

