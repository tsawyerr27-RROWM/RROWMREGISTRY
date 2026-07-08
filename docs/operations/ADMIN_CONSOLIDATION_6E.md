# Sprint 6E — Administrator identity consolidation

One-time operational migration before the Founding Registry Programme Day Zero reset.

**Do not execute without a full database backup.**

| Script | Purpose |
|--------|---------|
| `db/seeds/admin_consolidation_6e.sql` | Consolidate platform admin to `sawyerrtimi95@hotmail.com` |
| `db/seeds/admin_consolidation_6e_rollback.sql` | Restore identity rows from `_rrowm_s6e_backup_*` tables |
| `docs/operations/DAY_ZERO_RESET.md` | Day Zero reset (run after 6E verification) |

---

## Target state

| Account | Email | UUID | After 6E |
|---------|-------|------|----------|
| **Canonical** | sawyerrtimi95@hotmail.com | `03dfceaf-6892-46cb-8cbb-e53e67dbfa49` | `artists.is_admin = true`, `artists` row exists, `actor_profiles.role = gallery`, organisation preserved |
| **Legacy** | hello@rrowm.com | `6dce01f2-e304-42ab-8c0c-b75b293621ed` | `is_admin = false`, `account_status = deactivated`, auth row preserved |

---

## Pre-migration audit queries

```sql
-- Administrator split check
SELECT id, display_name, is_admin FROM public.artists WHERE is_admin = true;

-- Canonical identity
SELECT u.id, u.email, ap.role, ap.onboarding_complete, ap.account_status,
       (SELECT count(*) FROM public.artists ar WHERE ar.id = u.id) AS has_artists_row,
       (SELECT count(*) FROM public.gallery_users gu WHERE gu.user_id = u.id) AS gallery_memberships
FROM auth.users u
LEFT JOIN public.actor_profiles ap ON ap.user_id = u.id
WHERE lower(u.email) IN ('sawyerrtimi95@hotmail.com', 'hello@rrowm.com');

-- Legacy-authored application rows (review before migration; Day Zero clears most)
SELECT 'artworks' AS t, count(*) FROM public.artworks WHERE artist_id = '6dce01f2-e304-42ab-8c0c-b75b293621ed'
UNION ALL
SELECT 'ownership_events', count(*) FROM public.ownership_events WHERE to_user_id = '6dce01f2-e304-42ab-8c0c-b75b293621ed'
UNION ALL
SELECT 'deals', count(*) FROM public.deals
  WHERE participant_a_user_id = '6dce01f2-e304-42ab-8c0c-b75b293621ed'
     OR participant_b_user_id = '6dce01f2-e304-42ab-8c0c-b75b293621ed';
```

---

## Execute migration

```bash
# 1. Full backup
pg_dump "$DATABASE_URL" -Fc -f rrowm-pre-s6e.dump

# 2. Migration
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/admin_consolidation_6e.sql
```

---

## Verification checklist

### Authentication

- [ ] Login with **sawyerrtimi95@hotmail.com** succeeds
- [ ] Legacy **hello@rrowm.com** login still works (auth preserved) but studio routes to deactivated state or onboarding block if enforced
- [ ] Exactly one `artists.is_admin = true` row (`03dfceaf-…`)

### Creative

- [ ] **Note:** `actor_profiles.role` remains `gallery` — `/studio/creative` redirects to Organisation home per `StudioRouteGuard` (see risk assessment)
- [ ] `artists` row exists for `03dfceaf-…` with `is_admin = true`
- [ ] After Day Zero: register test artwork as organisation filing OR temporarily set `actor_profiles.role = 'artist'` for creative filing tests
- [ ] Ownership filing APIs accept `auth.uid()` matching `artists.id`
- [ ] Certificate issuance path recognizes admin artist profile

### Organisation

- [ ] Organisation Studio (`/studio/organisation`) loads for canonical account
- [ ] Gallery `f3a0866b-…` (or current org) visible with admin membership
- [ ] Opportunities panel loads (empty after Day Zero)
- [ ] Roster / catalogue sections load
- [ ] Verification queue accessible from org studio

### Internal

- [ ] `/admin` login via `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- [ ] `/internal/analytics` loads; telemetry counts preserved
- [ ] `/internal/verify` loads
- [ ] `POST /api/admin/verify-gallery` succeeds when called with canonical user bearer token + `is_admin`
- [ ] `/internal/replay-debugger` loads for canonical user (requires `artists.is_admin`)

### Registry

- [ ] Public registry routes load
- [ ] Verification queue processes attestations
- [ ] Ownership chronology append works on new filings post-Day Zero

### Field

- [ ] Organisation field profile resolves for preserved gallery slug
- [ ] Creative field profile resolves for canonical `artists.slug` after migration

### SQL post-checks

```sql
SELECT count(*) AS admin_count FROM public.artists WHERE is_admin = true;
-- expect 1

SELECT id, is_admin, gallery_id, represented_by_gallery, slug
FROM public.artists WHERE id = '03dfceaf-6892-46cb-8cbb-e53e67dbfa49';

SELECT user_id, role, account_status FROM public.actor_profiles
WHERE user_id IN ('03dfceaf-6892-46cb-8cbb-e53e67dbfa49', '6dce01f2-e304-42ab-8c0c-b75b293621ed');
```

---

## Rollback

If verification fails **before Day Zero**:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/admin_consolidation_6e_rollback.sql
```

If application data was mutated or Day Zero already ran, restore from `rrowm-pre-s6e.dump`.

---

## Sequence with Day Zero

1. Full backup
2. `admin_consolidation_6e.sql`
3. Verification checklist (this document)
4. `demo_wipe_rc1.sql` (Day Zero)
5. Founding Registry onboarding

---

## Legacy account recommendation

**Archive, do not delete.**

- Keep `auth.users` for hello@rrowm.com for audit trail and telemetry attribution
- Set `actor_profiles.account_status = 'deactivated'` (done by migration)
- Mark legacy `artists` row `is_test = true`, `membership_status = inactive`
- Delete auth user only in a later hygiene sprint after telemetry review

---

## Known architectural constraint

`actor_profiles.role` is **singular** (`artist` | `gallery` | `collector`). The canonical daily account remains **`gallery`** for Organisation Studio. Creative Studio route access requires `role = 'artist'` unless product adds role switching (out of scope for 6E).

Platform admin APIs use `artists.is_admin` with `auth.uid() = artists.id` and do **not** require `actor_profiles.role = 'artist'`.
