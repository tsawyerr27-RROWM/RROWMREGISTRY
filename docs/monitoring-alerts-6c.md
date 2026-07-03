# Sprint 6C — Monitoring & alerts

**Date:** 2026-07-03  
**Purpose:** Proactive operational visibility alongside telemetry (6C.1) and runtime errors (6C.2).

## Vercel Observability

### Watch

| Signal | Threshold | Severity |
|--------|-----------|----------|
| API 5xx rate | ≥ 5% over 5 min | **Critical** |
| P95 route latency | &gt; 3s sustained 10 min | Warning |
| Failed deployments | Any on `main` | **Critical** |
| Edge middleware errors | Spike vs baseline | Warning |

### Setup

1. Vercel Dashboard → Project → **Observability**
2. Enable **Web Analytics** and **Speed Insights** for production
3. Create alerts:
   - **Critical:** Error rate &gt; 5% on `/api/*`
   - **Warning:** P95 TTFB &gt; 1.5s on `/field`, `/studio/*`

### Routes to pin

- `/api/telemetry`
- `/api/runtime-errors`
- `/api/registry/verify-artwork`
- `/api/collector/ownership-claim`
- `/api/notifications`

## Supabase

### Watch

| Signal | Threshold | Severity |
|--------|-----------|----------|
| Database unavailable | Connection errors | **Critical** |
| RPC failures | `gallery_verify_artwork`, `register_artwork_atomic`, `artist_confirm_artwork` | **Critical** |
| Auth sign-in spike | 3× baseline in 15 min | Warning |
| Storage upload errors | `dispute-evidence` bucket | Warning |

### Setup

1. Supabase Dashboard → **Logs** → enable Postgres + Auth + Storage
2. Saved queries:
   - Failed RPCs: filter `event_message` containing `gallery_verify_artwork`
   - Slow queries: &gt; 500ms on `artworks`, `ownership_events`, `telemetry_events`

### Alert channels

- Email on-call for **Critical**
- Slack webhook for **Warning** (verification queue backlog — see below)

## Application-level (RROWM tables)

After migration `20260704120000_telemetry_and_runtime_errors_pr_6c.sql`:

```sql
-- Verification queue backlog (warning)
select count(*) from artworks
where verification_status in ('filed', 'self_attested');

-- Error spike (critical if > 50/hour)
select count(*) from runtime_errors
where created_at > now() - interval '1 hour';

-- Funnel drop-off (weekly review)
select event_name, count(*)
from telemetry_events
where created_at > now() - interval '7 days'
group by 1 order by 2 desc;
```

Internal dashboard: `/internal/analytics` (admin session required).

## Alert matrix

| Alert | Source | Severity | Action |
|-------|--------|----------|--------|
| 5% API failures | Vercel | Critical | Check `runtime_errors`, rollback if deploy-correlated |
| DB unavailable | Supabase | Critical | Status page, failover runbook |
| Auth failure spike | Supabase Auth logs | Critical | Check SMTP, rate limits, credential stuffing |
| Slow route P95 | Vercel | Warning | See `docs/performance-audit-6c.md` |
| Verification backlog &gt; N | `artworks` query | Warning | Staff `/internal/verify` |
| Telemetry ingest down | `/api/telemetry` 5xx | Warning | Service role key, migration applied |

## Optional: Sentry (6C.2 upgrade path)

Current implementation uses `runtime_errors` table + client `reportClientRuntimeError`. For production scale, add Sentry:

- `@sentry/nextjs` in `instrumentation.ts`
- Route `captureRuntimeError` → dual-write to Sentry + DB
- Source maps on Vercel deploy

## Runbook links

- Admin gate: `/admin` → sets `rrowm_admin_session`
- Analytics: `/internal/analytics`
- Verification queue: `/internal/verify`
- Migrations: `supabase/migrations/20260704120000_telemetry_and_runtime_errors_pr_6c.sql`
