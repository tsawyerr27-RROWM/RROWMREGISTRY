-- Gallery → artist invites: secure tokens, acceptance audit, public visibility pipeline.

-- 1) Invite columns
alter table public.gallery_artist_invites
  add column if not exists invite_token text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists token_used_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_user_id uuid references auth.users (id) on delete set null;

alter table public.gallery_artist_invites
  add column if not exists visibility_status text;

update public.gallery_artist_invites
set visibility_status = 'pending'
where visibility_status is null;

alter table public.gallery_artist_invites
  alter column visibility_status set default 'pending';

alter table public.gallery_artist_invites
  alter column visibility_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gallery_artist_invites_visibility_status_check'
  ) then
    alter table public.gallery_artist_invites
      add constraint gallery_artist_invites_visibility_status_check
      check (visibility_status in ('pending', 'confirmed', 'public'));
  end if;
exception
  when duplicate_object then null;
end $$;

comment on column public.gallery_artist_invites.invite_token is
  'Cryptographic random invite token — single use; cleared after acceptance.';
comment on column public.gallery_artist_invites.visibility_status is
  'pending: onboarding not finalized; confirmed: onboarding complete; public: artist opted into public roster.';

create unique index if not exists gallery_artist_invites_invite_token_key
  on public.gallery_artist_invites (invite_token)
  where invite_token is not null;

-- One outbound pending invitation per normalized email per gallery (prevents duplicates).
drop index if exists gallery_invites_pending_unique_email;
create unique index if not exists gallery_invites_pending_unique_email
  on public.gallery_artist_invites (gallery_id, lower(artist_email))
  where status = 'pending';

-- 2) Institutional public roster opt-in mirror (readable by anon; updated by authenticated APIs via service layer)
alter table public.artists
  add column if not exists shown_on_institutional_public boolean not null default false;

comment on column public.artists.shown_on_institutional_public is
  'True only when invitation visibility is public AND artist opted in; used for public institutional roster.';

create index if not exists artists_institutional_public_idx
  on public.artists (gallery_id, shown_on_institutional_public);

-- 3) Prefer token-bound invites when onboarding completes; fallback to legacy email pending match.
create or replace function public.complete_onboarding_artist(
  p_full_name text,
  p_display_name text,
  p_bio text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_full text;
  v_disp text;
  v_slug text;
  v_email text;
  v_invite_id uuid;
  v_gallery_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.actor_profiles ap
    where ap.user_id = v_uid
      and ap.role = 'artist'
  ) then
    raise exception 'Profile must be set to artist first'
      using errcode = '42501';
  end if;

  v_full := trim(coalesce(p_full_name, ''));
  v_disp := trim(coalesce(p_display_name, ''));
  if v_disp = '' then
    raise exception 'Display name is required';
  end if;

  v_slug :=
    trim(
      both '-'
      from regexp_replace(lower(v_disp), '[^a-zA-Z0-9]+', '-', 'g')
    );
  if v_slug = '' then
    v_slug := 'artist';
  end if;
  v_slug := left(v_slug, 40) || '-' || substr(replace(v_uid::text, '-', ''), 1, 8);

  insert into public.artists (id, full_name, display_name, bio, slug)
  values (
    v_uid,
    nullif(v_full, ''),
    v_disp,
    nullif(trim(coalesce(p_bio, '')), ''),
    v_slug
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    display_name = excluded.display_name,
    bio = excluded.bio,
    slug = excluded.slug;

  -- Prefer invite binding from token acceptance (accepted_user_id matches).
  select i.gallery_id
    into v_gallery_id
  from public.gallery_artist_invites i
  where i.accepted_user_id = v_uid
    and i.status = 'accepted'
  order by i.accepted_at desc nulls last, i.created_at desc
  limit 1;

  if v_gallery_id is not null then
    update public.artists
    set
      gallery_id = v_gallery_id,
      represented_by_gallery = true
    where id = v_uid;
  end if;

  -- Legacy fallback: invited email pending, no acceptance row yet (pre-token invites).
  if v_gallery_id is null then
    v_email := lower(coalesce((auth.jwt() ->> 'email')::text, ''));
    if v_email <> '' then
      select i.id, i.gallery_id
        into v_invite_id, v_gallery_id
      from public.gallery_artist_invites i
      where lower(i.artist_email) = v_email
        and i.status = 'pending'
      order by i.created_at desc
      limit 1;

      if v_invite_id is not null and v_gallery_id is not null then
        update public.artists
        set
          gallery_id = v_gallery_id,
          represented_by_gallery = true
        where id = v_uid;

        update public.gallery_artist_invites
        set
          status = 'accepted',
          accepted_user_id = v_uid,
          accepted_at = coalesce(accepted_at, now()),
          token_used_at = coalesce(token_used_at, now())
        where id = v_invite_id;
      end if;
    end if;
  end if;

  update public.actor_profiles
  set
    display_name = v_disp,
    onboarding_complete = true,
    updated_at = now()
  where user_id = v_uid;
end;
$$;

revoke all on function public.complete_onboarding_artist(text, text, text) from public;
grant execute on function public.complete_onboarding_artist(text, text, text) to authenticated;
