-- PR-G2a — Registry steward invite index (growth loop infrastructure)

create table if not exists public.registry_steward_invites (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  invite_kind text not null,
  recipient_email text not null,
  recipient_name text,
  invite_token text,
  personal_message text,
  status text not null default 'pending',
  custody_transfer_type text,
  token_expires_at timestamptz,
  token_used_at timestamptz,
  accepted_user_id uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_by_user_id uuid not null references auth.users (id) on delete cascade,
  filing_gallery_id uuid references public.galleries (id) on delete set null,
  source_table text,
  source_id uuid,
  created_at timestamptz not null default now(),
  constraint registry_steward_invites_kind_check check (
    invite_kind in ('authorship', 'custody')
  ),
  constraint registry_steward_invites_status_check check (
    status in ('pending', 'accepted', 'expired', 'cancelled')
  ),
  constraint registry_steward_invites_source_table_check check (
    source_table is null
    or source_table in (
      'artwork_authentication_invites',
      'provenance_transfers'
    )
  )
);

comment on table public.registry_steward_invites is
  'Unified index for registry record steward invitations (authorship + custody). Source rows remain system of record.';

create unique index if not exists registry_steward_invites_token_key
  on public.registry_steward_invites (invite_token)
  where invite_token is not null;

create unique index if not exists registry_steward_invites_pending_email_uq
  on public.registry_steward_invites (artwork_id, invite_kind, lower(recipient_email))
  where status = 'pending';

create index if not exists registry_steward_invites_artwork_idx
  on public.registry_steward_invites (artwork_id, created_at desc);

create index if not exists registry_steward_invites_creator_idx
  on public.registry_steward_invites (created_by_user_id, created_at desc);

alter table public.registry_steward_invites enable row level security;

drop policy if exists registry_steward_invites_select_creator on public.registry_steward_invites;
create policy registry_steward_invites_select_creator
  on public.registry_steward_invites
  for select
  to authenticated
  using (created_by_user_id = auth.uid());

drop policy if exists registry_steward_invites_select_gallery_staff on public.registry_steward_invites;
create policy registry_steward_invites_select_gallery_staff
  on public.registry_steward_invites
  for select
  to authenticated
  using (
    filing_gallery_id is not null
    and exists (
      select 1
      from public.gallery_users gu
      where gu.gallery_id = registry_steward_invites.filing_gallery_id
        and gu.user_id = auth.uid()
    )
  );

grant select on public.registry_steward_invites to authenticated;
grant all on public.registry_steward_invites to service_role;

notify pgrst, 'reload schema';
