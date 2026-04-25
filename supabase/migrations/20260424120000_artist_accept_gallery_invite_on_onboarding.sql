-- Accept gallery → artist invites automatically when an invited artist completes onboarding.
-- Uses the email claim from auth.jwt() to match against gallery_artist_invites.artist_email.

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

  -- Invite acceptance: if this artist signed up with an email that has a pending invite,
  -- link them to that gallery and mark the invite accepted.
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
      set status = 'accepted'
      where id = v_invite_id;
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

