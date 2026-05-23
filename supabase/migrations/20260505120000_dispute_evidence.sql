-- Structured evidence for disputes (private storage; signed URLs from app only).

create table if not exists public.dispute_evidence (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dispute_id uuid not null references public.disputes (id) on delete cascade,
  submitted_by uuid not null references auth.users (id) on delete cascade,
  type text not null,
  file_url text,
  external_url text,
  description text,
  verified boolean not null default false,
  constraint dispute_evidence_type_check check (
    type in ('document', 'image', 'certificate', 'external_link')
  )
);

comment on table public.dispute_evidence is
  'Append-only attachments for disputes; file_url is object path in private dispute-evidence bucket.';

create index if not exists dispute_evidence_dispute_id_idx
  on public.dispute_evidence (dispute_id, created_at desc);

alter table public.dispute_evidence enable row level security;

drop policy if exists "dispute_evidence_select_party" on public.dispute_evidence;
create policy "dispute_evidence_select_party"
  on public.dispute_evidence for select
  to authenticated
  using (
    exists (
      select 1
      from public.disputes d
      where d.id = dispute_evidence.dispute_id
        and d.created_by = auth.uid()
    )
  );

drop policy if exists "dispute_evidence_insert_party" on public.dispute_evidence;
create policy "dispute_evidence_insert_party"
  on public.dispute_evidence for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and exists (
      select 1
      from public.disputes d
      where d.id = dispute_evidence.dispute_id
        and d.created_by = auth.uid()
    )
  );

grant select, insert on public.dispute_evidence to authenticated;
grant all on public.dispute_evidence to service_role;

-- Private bucket: uploads and reads are performed server-side with the service role + signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dispute-evidence',
  'dispute-evidence',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
