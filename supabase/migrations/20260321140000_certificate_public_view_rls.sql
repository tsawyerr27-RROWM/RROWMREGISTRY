-- Certificates: public anon API can only read artwork_id + revoked (status).
-- Authenticated users can read full certificate rows (for /certificate/[id]).
-- Service role bypasses RLS for server-side jobs (issue certificate API).

alter table public.certificates enable row level security;

drop policy if exists "certificates_select_authenticated" on public.certificates;
drop policy if exists "certificates_select_anon" on public.certificates;

create policy "certificates_select_authenticated"
  on public.certificates for select
  to authenticated
  using (true);

create policy "certificates_select_anon"
  on public.certificates for select
  to anon
  using (true);

-- Column-level: anon must not pull certificate_hash, numbers, etc. via API
revoke all on public.certificates from anon;
-- Public verify UI may show revocation reason without exposing hashes / numbers
grant select (artwork_id, revoked, revoked_reason) on public.certificates to anon;

grant select on public.certificates to authenticated;
