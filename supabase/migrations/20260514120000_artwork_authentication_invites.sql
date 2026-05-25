-- Artwork-specific authentication invitations (separate from gallery_artist_invites).

create table if not exists public.artwork_authentication_invites (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  artist_email text not null,
  artist_name text,
  invite_token text,
  message text,
  status text not null default 'pending',
  authenticated_user_id uuid references auth.users (id) on delete set null,
  authenticated_at timestamptz,
  token_expires_at timestamptz,
  token_used_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint aai_status_check check (
    status in ('pending', 'authenticated', 'expired', 'cancelled')
  )
);

comment on table public.artwork_authentication_invites is
  'Continuity invitations to authenticate authorship on a specific canonical artwork record — not representation roster invites.';

create unique index if not exists artwork_auth_invites_token_key
  on public.artwork_authentication_invites (invite_token)
  where invite_token is not null;

create unique index if not exists artwork_auth_invites_pending_email_uq
  on public.artwork_authentication_invites (artwork_id, lower(artist_email))
  where status = 'pending';

create index if not exists artwork_auth_invites_gallery_idx
  on public.artwork_authentication_invites (gallery_id, created_at desc);

create index if not exists artwork_auth_invites_artwork_idx
  on public.artwork_authentication_invites (artwork_id, created_at desc);

alter table public.artwork_authentication_invites enable row level security;

drop policy if exists aai_select_gallery_staff on public.artwork_authentication_invites;
create policy aai_select_gallery_staff
  on public.artwork_authentication_invites for select
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
    )
  );

grant select on public.artwork_authentication_invites to authenticated;

drop policy if exists aai_insert_gallery_staff on public.artwork_authentication_invites;
create policy aai_insert_gallery_staff
  on public.artwork_authentication_invites for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  );

drop policy if exists aai_update_gallery_staff on public.artwork_authentication_invites;
create policy aai_update_gallery_staff
  on public.artwork_authentication_invites for update
  to authenticated
  using (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  )
  with check (
    exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = artwork_authentication_invites.gallery_id
        and gu.user_id = auth.uid()
        and gu.role in ('admin', 'staff')
    )
  );

grant insert, update on public.artwork_authentication_invites to authenticated;

-- Accept token: link artist account + mark invite (confirmation happens in app/API).
create or replace function public.accept_artwork_authentication_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_inv public.artwork_authentication_invites%rowtype;
  v_email text;
  v_expired boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into v_inv
  from public.artwork_authentication_invites i
  where i.invite_token = p_token
  limit 1;

  if not found then
    raise exception 'Invitation not found';
  end if;

  v_expired :=
    v_inv.status = 'pending'
    and v_inv.token_expires_at is not null
    and v_inv.token_expires_at < now();

  if v_inv.status = 'cancelled' then
    raise exception 'Invitation was withdrawn';
  end if;

  if v_expired then
    update public.artwork_authentication_invites
    set status = 'expired'
    where id = v_inv.id and status = 'pending';
    raise exception 'Invitation has expired';
  end if;

  if v_inv.status = 'authenticated' then
    if v_inv.authenticated_user_id is not null and v_inv.authenticated_user_id <> v_uid then
      raise exception 'Invitation already completed by another account' using errcode = '42501';
    end if;
    return jsonb_build_object(
      'ok', true,
      'artwork_id', v_inv.artwork_id,
      'already_authenticated', true
    );
  end if;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  if v_email = '' or lower(trim(v_inv.artist_email)) <> v_email then
    raise exception 'This invitation is for a different email address' using errcode = '42501';
  end if;

  perform public.artist_link_catalogue_work(v_inv.artwork_id);

  begin
    perform public.artist_confirm_representation_on_file(v_inv.artwork_id);
  exception
    when others then
      null;
  end;

  update public.artwork_authentication_invites
  set
    status = 'authenticated',
    authenticated_user_id = v_uid,
    authenticated_at = now(),
    token_used_at = coalesce(token_used_at, now()),
    invite_token = null
  where id = v_inv.id;

  return jsonb_build_object(
    'ok', true,
    'artwork_id', v_inv.artwork_id,
    'already_authenticated', false
  );
end;
$$;

revoke all on function public.accept_artwork_authentication_invite(text) from public;
grant execute on function public.accept_artwork_authentication_invite(text) to authenticated;
