# Day Zero Reset v2 — True Production Launch

## Purpose

Prepare the **production platform** for the Founding Registry Programme as a genuine Day Zero: the platform infrastructure remains, but **all application state is removed**.

After reset, the operator signs in with an existing `auth.users` account and completes the same onboarding flow every future participant will use — creating the first Organisation, Creative profile, opportunity, and artwork through production UI.

**Philosophy:** preserve infrastructure · delete application state · do not preserve development identities.

Script:

- `db/seeds/demo_wipe_rc1.sql`

Reference backups (staging / rollback only):

- `db/seeds/demo_seed_rc1.sql` — public application data snapshot
- `db/seeds/demo_auth_users_rc1.sql` — demo `auth.users` and `auth.identities`

**Not required:** Sprint 6E administrator consolidation. Identity consolidation is superseded by this launch model.

---

## Preserved

| Category | Detail |
|----------|--------|
| Schema | Tables, indexes, constraints, enums |
| Migrations | Applied migration history (`supabase_migrations`) |
| RLS | Row-level security policies |
| Functions / triggers | All database logic |
| Auth | `auth.users`, `auth.identities`, sessions, refresh tokens — **unchanged** |
| Storage | `storage.*` buckets and objects — **unchanged** |
| Telemetry | `telemetry_events` |
| Runtime diagnostics | `runtime_errors`, `system_errors` |
| Operational tables | `account_action_rate_limits`, `account_audit_log`, `data_export_requests` |

> **Note:** There is no `telemetry_errors` table in this codebase. Operational error capture uses `runtime_errors` and `system_errors`.

---

## Removed

All rows in every public application table, including:

| Category | Tables |
|----------|--------|
| Identity | `actor_profiles`, `artists`, `collector_profiles`, `gallery_users`, `galleries` |
| Registry | `artworks`, `certificates`, `ownership_events`, `value_events`, `verification_events`, `provenance_events`, `provenance_transfers`, `record_anchors`, `ownership_claims` |
| Field | `field_briefs`, `field_programmes`, `field_opportunity_applications` |
| Deals & rights | `deals`, `deal_messages`, `deal_revisions`, `deal_execution_records`, `rights_licenses` |
| Representation | `representation_relationships`, `artwork_representation_relationships`, `artwork_confirmation_events`, `representation_amendment_requests` |
| Invitations | `gallery_artist_invites`, `artwork_authentication_invites`, `registry_steward_invites`, `invitations` (if present), `artist_memberships` (if present) |
| Archive | `artwork_archives`, `archive_events`, `collector_vault_items` |
| Market | `market_listings`, `market_enquiries`, `sale_intents` |
| Disputes | `disputes`, `dispute_evidence` |
| Activity | `notifications`, `activity_events` |

No administrator, organisation, or demo profile is preserved.

---

## Day Zero process

1. **Backup** — full database dump
2. **Execute reset** — `demo_wipe_rc1.sql`
3. **Login** — existing auth account (password unchanged)
4. **Complete onboarding** — fresh `actor_profiles` + capability rows via production flow
5. **Create RROWM** — first Organisation through Organisation onboarding
6. **Create Creative profile** — through Creative onboarding (separate role flow if single-role model applies)
7. **Publish Founding Registry Programme** — first `field_brief` / programme
8. **Register first artwork** — first canonical registry record
9. **Begin invitations** — cohort outreach

---

## Preflight

### Confirm auth accounts exist

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at;
```

Login credentials are unchanged. Only application-layer rows are removed.

### Confirm storage intact

```sql
SELECT id, name, public
FROM storage.buckets
ORDER BY name;
```

Objects are not deleted. Demo artwork images may remain as orphaned storage until a separate cleanup.

### Confirm operational history (optional baseline)

```sql
SELECT 'telemetry_events' AS t, count(*) FROM public.telemetry_events
UNION ALL SELECT 'runtime_errors', count(*) FROM public.runtime_errors
UNION ALL SELECT 'system_errors', count(*) FROM public.system_errors
UNION ALL SELECT 'account_audit_log', count(*) FROM public.account_audit_log;
```

Record counts before reset if you need to verify preservation afterward.

### Confirm application data present (pre-reset sanity)

```sql
SELECT 'actor_profiles' AS t, count(*) FROM public.actor_profiles
UNION ALL SELECT 'artists', count(*) FROM public.artists
UNION ALL SELECT 'galleries', count(*) FROM public.galleries
UNION ALL SELECT 'artworks', count(*) FROM public.artworks
UNION ALL SELECT 'field_briefs', count(*) FROM public.field_briefs;
```

---

## Execute Day Zero reset

```bash
psql "$DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -f db/seeds/demo_wipe_rc1.sql
```

After reset:

- All application tables are empty
- Auth login still works for existing users
- Onboarding launches on first studio visit (no `actor_profiles` row)
- Telemetry and operational history remain
- Storage objects remain (orphaned files possible)

---

## Post-reset verification queries

```sql
-- Application layer empty
SELECT 'actor_profiles' AS t, count(*) FROM public.actor_profiles
UNION ALL SELECT 'artists', count(*) FROM public.artists
UNION ALL SELECT 'galleries', count(*) FROM public.galleries
UNION ALL SELECT 'gallery_users', count(*) FROM public.gallery_users
UNION ALL SELECT 'collector_profiles', count(*) FROM public.collector_profiles
UNION ALL SELECT 'artworks', count(*) FROM public.artworks
UNION ALL SELECT 'certificates', count(*) FROM public.certificates
UNION ALL SELECT 'field_briefs', count(*) FROM public.field_briefs
UNION ALL SELECT 'deals', count(*) FROM public.deals
UNION ALL SELECT 'notifications', count(*) FROM public.notifications;

-- Infrastructure preserved
SELECT 'auth.users' AS t, count(*) FROM auth.users
UNION ALL SELECT 'telemetry_events', count(*) FROM public.telemetry_events
UNION ALL SELECT 'runtime_errors', count(*) FROM public.runtime_errors
UNION ALL SELECT 'storage.buckets', count(*) FROM storage.buckets;
```

All application counts should be `0`. Auth, telemetry, and storage counts should match pre-reset baselines (telemetry may grow after smoke tests).

---

## Platform admin after reset

Two admin surfaces coexist:

| Surface | Gate | Post-reset behaviour |
|---------|------|----------------------|
| `/admin`, most `/internal/*` | `rrowm_admin_session` cookie — env `ADMIN_USERNAME` / `ADMIN_PASSWORD` | **Works immediately** — no application rows required |
| `/internal/replay-debugger`, telemetry RLS read | `auth` session + `artists.is_admin` | Requires Creative profile + service-role `is_admin` grant after onboarding |

After creating your Creative profile, grant platform admin if replay / telemetry admin reads are needed:

```sql
-- Service-role only (run after artists row exists for your user)
UPDATE public.artists
SET is_admin = true
WHERE id = '<your-auth-users-uuid>';
```

---

## Recovery

### Restore from backup (production rollback)

```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists rrowm-pre-day-zero.dump
```

### Restore demo seed (staging only)

Replays demo public + auth data. Suitable for staging clones after a full wipe.

```bash
./db/seeds/restore_demo_rc1.sh
```

`restore_demo_rc1.sh` uses `demo_wipe_rc1.sql` as its wipe step — compatible with v2 (full application truncate).

### Rollback process

1. Stop application traffic if needed.
2. Restore from database backup taken **before** Day Zero reset.

There is no automatic in-place rollback without a backup.

---

## Smoke test

See `docs/operations/DAY_ZERO_CHECKLIST.md` for the operator checklist.

Manual sequence after reset:

1. Landing (`/`)
2. Authentication — password login
3. Onboarding starts automatically
4. Create Organisation
5. Create Creative profile
6. Organisation Studio loads
7. Creative Studio loads (role permitting — see single-role model)
8. Registry empty
9. Field empty
10. Deals empty
11. Notifications empty
12. Admin console accessible (`/admin`)
13. Telemetry still recording

---

## Related files

| File | Role |
|------|------|
| `db/seeds/demo_wipe_rc1.sql` | Day Zero reset v2 (application layer only) |
| `db/seeds/demo_auth_users_rc1.sql` | Demo auth restore (staging) |
| `db/seeds/demo_seed_rc1.sql` | Demo public restore (staging) |
| `db/seeds/restore_demo_rc1.sh` | Wipe + restore automation (staging) |
| `db/seeds/export_demo_rc1.sh` | Export demo snapshot |
| `docs/operations/DAY_ZERO_CHECKLIST.md` | Operator checklist |
