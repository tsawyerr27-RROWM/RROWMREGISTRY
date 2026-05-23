-- Formal provenance continuation (participant-submitted; not legal adjudication).
-- Lifecycle: pending_acceptance → completed | cancelled | expired

create table if not exists public.provenance_transfers (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  from_user_id uuid not null references auth.users (id) on delete cascade,
  recipient_email text not null,
  recipient_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending_acceptance',
  transfer_type text not null,
  note text,
  invite_token text,
  token_expires_at timestamptz,
  token_used_at timestamptz,
  ownership_event_id uuid references public.ownership_events (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'provenance_transfers_status_check'
  ) then
    alter table public.provenance_transfers
      add constraint provenance_transfers_status_check
      check (
        status in (
          'initiated',
          'pending_acceptance',
          'completed',
          'cancelled',
          'expired'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'provenance_transfers_transfer_type_check'
  ) then
    alter table public.provenance_transfers
      add constraint provenance_transfers_transfer_type_check
      check (
        transfer_type in (
          'private_transfer',
          'sale',
          'gift',
          'inheritance'
        )
      );
  end if;
end $$;

comment on table public.provenance_transfers is
  'Registry record of a proposed provenance continuation to a named recipient; not legal transfer of title.';

create unique index if not exists provenance_transfers_invite_token_key
  on public.provenance_transfers (invite_token)
  where invite_token is not null;

create index if not exists provenance_transfers_artwork_id_idx
  on public.provenance_transfers (artwork_id, created_at desc);

create unique index if not exists provenance_transfers_one_pending_per_artwork
  on public.provenance_transfers (artwork_id)
  where status = 'pending_acceptance';

alter table public.ownership_events
  add column if not exists provenance_transfer_id uuid references public.provenance_transfers (id) on delete set null;

comment on column public.ownership_events.provenance_transfer_id is
  'Optional link to formal provenance continuation record when ledger row was created by that flow.';

alter table public.provenance_transfers enable row level security;

drop policy if exists "provenance_transfers_select_initiator" on public.provenance_transfers;
create policy "provenance_transfers_select_initiator"
  on public.provenance_transfers for select
  to authenticated
  using (from_user_id = auth.uid());

grant select on public.provenance_transfers to authenticated;
grant all on public.provenance_transfers to service_role;
