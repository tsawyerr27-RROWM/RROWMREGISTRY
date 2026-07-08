-- Sprint 6E — Administrator identity consolidation (DO NOT RUN WITHOUT BACKUP)
-- Goal: sawyerrtimi95@hotmail.com (03dfceaf-…) becomes the sole platform administrator.
-- Legacy: hello@rrowm.com (6dce01f2-…) relinquishes is_admin.
--
-- Prerequisites:
--   1. Full database backup (pg_dump) immediately before execution
--   2. Maintenance window; no concurrent admin operations
--   3. Run verification queries in docs/operations/ADMIN_CONSOLIDATION_6E.md first
--
-- Does NOT: delete auth users, truncate application data, or modify telemetry.
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/admin_consolidation_6e.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- Constants (resolved at runtime from auth.users email where possible)
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE _s6e_ids ON COMMIT DROP AS
SELECT
  (SELECT id FROM auth.users WHERE lower(email) = lower('sawyerrtimi95@hotmail.com') LIMIT 1) AS canonical_user_id,
  (SELECT id FROM auth.users WHERE lower(email) = lower('hello@rrowm.com') LIMIT 1) AS legacy_user_id;

DO $$
DECLARE
  v_canonical uuid;
  v_legacy uuid;
BEGIN
  SELECT canonical_user_id, legacy_user_id
    INTO v_canonical, v_legacy
  FROM _s6e_ids;

  IF v_canonical IS NULL THEN
    RAISE EXCEPTION 'S6E aborted: canonical user sawyerrtimi95@hotmail.com not found in auth.users';
  END IF;
  IF v_canonical <> '03dfceaf-6892-46cb-8cbb-e53e67dbfa49'::uuid THEN
    RAISE EXCEPTION 'S6E aborted: canonical email resolves to %, expected 03dfceaf-6892-46cb-8cbb-e53e67dbfa49', v_canonical;
  END IF;
  IF v_legacy IS NULL THEN
    RAISE WARNING 'S6E: legacy user hello@rrowm.com not found; skipping legacy-only steps';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Persistent backup tables for rollback (kept after commit; drop manually)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public._rrowm_s6e_backup_artists;
DROP TABLE IF EXISTS public._rrowm_s6e_backup_actor_profiles;
DROP TABLE IF EXISTS public._rrowm_s6e_backup_galleries;

CREATE TABLE public._rrowm_s6e_backup_artists AS
SELECT now() AS backed_up_at, a.*
FROM public.artists a
WHERE a.id IN (
  SELECT canonical_user_id FROM _s6e_ids
  UNION
  SELECT legacy_user_id FROM _s6e_ids WHERE legacy_user_id IS NOT NULL
);

CREATE TABLE public._rrowm_s6e_backup_actor_profiles AS
SELECT now() AS backed_up_at, ap.*
FROM public.actor_profiles ap
WHERE ap.user_id IN (
  SELECT canonical_user_id FROM _s6e_ids
  UNION
  SELECT legacy_user_id FROM _s6e_ids WHERE legacy_user_id IS NOT NULL
);

CREATE TABLE public._rrowm_s6e_backup_galleries AS
SELECT now() AS backed_up_at, g.*
FROM public.galleries g
WHERE g.id IN (
  SELECT gu.gallery_id
  FROM public.gallery_users gu
  WHERE gu.user_id = (SELECT canonical_user_id FROM _s6e_ids)
);

-- ---------------------------------------------------------------------------
-- Create / update canonical artists row (platform administrator profile)
-- ---------------------------------------------------------------------------
INSERT INTO public.artists (
  id,
  full_name,
  display_name,
  bio,
  website,
  instagram,
  verification_status,
  verified_at,
  is_admin,
  membership_status,
  role,
  gallery_id,
  slug,
  is_test,
  represented_by_gallery,
  public_presence,
  studio_artworks_accent,
  shown_on_institutional_public
)
SELECT
  c.canonical_user_id,
  coalesce(nullif(trim(ap.display_name), ''), 'RROWM'),
  coalesce(nullif(trim(ap.display_name), ''), 'RROWM'),
  coalesce(l.bio, ''),
  l.website,
  l.instagram,
  coalesce(l.verification_status, 'unverified'::artist_verification_status),
  l.verified_at,
  true,
  coalesce(l.membership_status, 'active'),
  'artist',
  gu.gallery_id,
  coalesce(
    nullif(trim(l.slug), ''),
    'rrowm-' || substr(replace(c.canonical_user_id::text, '-', ''), 1, 8)
  ),
  false,
  false,
  coalesce(
    l.public_presence,
    ap.public_presence,
    '{"values":true,"profile":true,"location":true,"ownership":true}'::jsonb
  ),
  coalesce(l.studio_artworks_accent, 'rose'),
  coalesce(l.shown_on_institutional_public, false)
FROM _s6e_ids c
LEFT JOIN public.actor_profiles ap ON ap.user_id = c.canonical_user_id
LEFT JOIN public.artists l ON l.id = c.legacy_user_id
LEFT JOIN LATERAL (
  SELECT gu.gallery_id
  FROM public.gallery_users gu
  WHERE gu.user_id = c.canonical_user_id
  ORDER BY gu.created_at ASC
  LIMIT 1
) gu ON true
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  display_name = coalesce(nullif(excluded.display_name, ''), artists.display_name),
  full_name = coalesce(nullif(excluded.full_name, ''), artists.full_name),
  bio = coalesce(nullif(excluded.bio, ''), artists.bio),
  gallery_id = excluded.gallery_id,
  represented_by_gallery = false,
  public_presence = coalesce(excluded.public_presence, artists.public_presence),
  studio_artworks_accent = coalesce(excluded.studio_artworks_accent, artists.studio_artworks_accent),
  membership_status = coalesce(artists.membership_status, 'active');

-- ---------------------------------------------------------------------------
-- Relinquish legacy administrator flag (do not delete legacy artists row yet)
-- ---------------------------------------------------------------------------
UPDATE public.artists
SET is_admin = false
WHERE id = (SELECT legacy_user_id FROM _s6e_ids)
  AND id IS NOT NULL;

-- Ensure no other is_admin rows remain
UPDATE public.artists
SET is_admin = false
WHERE id NOT IN (SELECT canonical_user_id FROM _s6e_ids)
  AND is_admin = true;

UPDATE public.artists
SET is_admin = true
WHERE id = (SELECT canonical_user_id FROM _s6e_ids);

-- ---------------------------------------------------------------------------
-- Merge practice metadata onto canonical actor_profiles (preserve gallery role)
-- ---------------------------------------------------------------------------
UPDATE public.actor_profiles ap
SET
  public_presence = coalesce(
    (
      SELECT l.public_presence
      FROM public.artists l
      WHERE l.id = (SELECT legacy_user_id FROM _s6e_ids)
    ),
    ap.public_presence
  ),
  display_name = coalesce(nullif(trim(ap.display_name), ''), 'RROWM'),
  onboarding_complete = true,
  account_status = 'active'
WHERE ap.user_id = (SELECT canonical_user_id FROM _s6e_ids);

-- ---------------------------------------------------------------------------
-- Transfer gallery verification attribution where legacy admin verified org
-- ---------------------------------------------------------------------------
UPDATE public.galleries g
SET verified_by = (SELECT canonical_user_id FROM _s6e_ids)
WHERE g.verified_by = (SELECT legacy_user_id FROM _s6e_ids)
  AND (SELECT legacy_user_id FROM _s6e_ids) IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Legacy account: deactivate application profile (auth preserved; not deleted)
-- ---------------------------------------------------------------------------
UPDATE public.actor_profiles
SET
  account_status = 'deactivated'
WHERE user_id = (SELECT legacy_user_id FROM _s6e_ids)
  AND (SELECT legacy_user_id FROM _s6e_ids) IS NOT NULL;

UPDATE public.artists
SET
  is_test = true,
  membership_status = 'inactive'
WHERE id = (SELECT legacy_user_id FROM _s6e_ids)
  AND (SELECT legacy_user_id FROM _s6e_ids) IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Post-migration assertions
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_admin_count integer;
  v_canonical uuid;
BEGIN
  SELECT canonical_user_id INTO v_canonical FROM _s6e_ids;

  SELECT count(*) INTO v_admin_count
  FROM public.artists
  WHERE is_admin = true;

  IF v_admin_count <> 1 THEN
    RAISE EXCEPTION 'S6E post-check failed: expected 1 is_admin artist, found %', v_admin_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.artists WHERE id = v_canonical AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'S6E post-check failed: canonical user is not is_admin';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.gallery_users WHERE user_id = v_canonical
  ) THEN
    RAISE WARNING 'S6E post-check: canonical user has no gallery_users row (Organisation Studio may be empty)';
  END IF;
END $$;

COMMIT;

-- Manual follow-up (not automated):
--   1. Run verification checklist: docs/operations/ADMIN_CONSOLIDATION_6E.md
--   2. Run Day Zero reset when ready: db/seeds/demo_wipe_rc1.sql
--   3. Drop backup tables after sign-off: DROP TABLE public._rrowm_s6e_backup_*;
