# Day Zero Checklist v2 — True Production Launch

Operator checklist for the Founding Registry Programme Day Zero reset.

**Philosophy:** preserve infrastructure · delete application state · begin community history from zero.

---

## Before

- [ ] **Full database backup**

  ```bash
  pg_dump "$DATABASE_URL" -Fc -f rrowm-pre-day-zero.dump
  ```

- [ ] **Confirm restore files exist** (staging rollback only) — `demo_seed_rc1.sql`, `demo_auth_users_rc1.sql`
- [ ] **Confirm production build deployed** — application matches migrations in target database
- [ ] **Confirm migrations applied** — including `invitations`, `artist_memberships` if present
- [ ] **Verify auth accounts exist**

  ```sql
  SELECT id, email FROM auth.users ORDER BY email;
  ```

  Your launch account must appear. Passwords are unchanged.

- [ ] **Verify storage buckets exist**

  ```sql
  SELECT id, name FROM storage.buckets ORDER BY name;
  ```

- [ ] **Record operational baselines** (optional)

  ```sql
  SELECT count(*) AS telemetry_events FROM public.telemetry_events;
  SELECT count(*) AS runtime_errors FROM public.runtime_errors;
  ```

- [ ] **Confirm `ADMIN_USERNAME` / `ADMIN_PASSWORD`** env vars set for `/admin` console
- [ ] **Communicate maintenance window** if required
- [ ] **Sprint 6E not required** — this launch path does not preserve or consolidate administrator identities

---

## Execute

Run Day Zero reset:

```bash
psql "$DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -f db/seeds/demo_wipe_rc1.sql
```

- [ ] Script completed without error
- [ ] Transaction committed

---

## After — verify empty application layer

```sql
SELECT 'actor_profiles' AS t, count(*) FROM public.actor_profiles
UNION ALL SELECT 'artists', count(*) FROM public.artists
UNION ALL SELECT 'galleries', count(*) FROM public.galleries
UNION ALL SELECT 'artworks', count(*) FROM public.artworks
UNION ALL SELECT 'field_briefs', count(*) FROM public.field_briefs
UNION ALL SELECT 'certificates', count(*) FROM public.certificates
UNION ALL SELECT 'notifications', count(*) FROM public.notifications;
```

Expect **all zeros**.

### Infrastructure preserved

- [ ] **Auth intact** — `SELECT count(*) FROM auth.users` unchanged
- [ ] **Storage intact** — buckets and objects still present
- [ ] **Telemetry preserved** — `telemetry_events` count ≥ pre-reset baseline
- [ ] **Runtime errors preserved** — `runtime_errors` count ≥ pre-reset baseline

### Expected platform state

- [ ] Application tables empty
- [ ] Login still works (existing auth account)
- [ ] Onboarding launches on studio visit (no `actor_profiles`)
- [ ] No organisations
- [ ] No artist profiles
- [ ] No collector profiles
- [ ] No opportunities
- [ ] No artworks
- [ ] No certificates

---

## Smoke test — manual sequence

Run in order through the production UI:

| Step | Check | Pass |
|------|-------|------|
| Landing | `/` loads | ☐ |
| Authentication | Sign-in page loads | ☐ |
| Password login | Existing account authenticates | ☐ |
| Onboarding | Redirects to `/onboarding` automatically | ☐ |
| Create Organisation | Organisation onboarding completes; `galleries` + `gallery_users` created | ☐ |
| Create Creative profile | Creative onboarding completes; `artists` row created | ☐ |
| Organisation Studio | `/studio/organisation` loads | ☐ |
| Creative Studio | `/studio/creative` loads (requires `actor_profiles.role = artist` or future multi-role) | ☐ |
| Registry | Public registry routes load; no works listed | ☐ |
| Field | `/field` loads; no published opportunities | ☐ |
| Deals | Deals workspace empty | ☐ |
| Notifications | Notification centre empty | ☐ |
| Admin console | `/admin` → env credentials → console loads | ☐ |
| Telemetry | Trigger page view; new row in `telemetry_events` | ☐ |

### Optional — platform admin grant

If replay debugger or telemetry admin reads are required:

```sql
UPDATE public.artists SET is_admin = true WHERE id = '<your-user-uuid>';
```

(Service-role connection only.)

---

## Ready for Founding Registry

- [ ] **RROWM organisation created** through onboarding
- [ ] **Founding Registry Programme published** — first `field_brief` / programme
- [ ] **First artwork registered** — first canonical registry record
- [ ] **Begin sending invitations**

---

## Rollback (if required)

1. Restore database from `rrowm-pre-day-zero.dump`, **or**
2. On staging clone: `./db/seeds/restore_demo_rc1.sh`

See `docs/operations/DAY_ZERO_RESET.md` for full recovery documentation.
