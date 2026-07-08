-- Sprint 6E — Administrator identity consolidation ROLLBACK
-- Restores artists, actor_profiles, and galleries rows from _rrowm_s6e_backup_* tables
-- created by admin_consolidation_6e.sql in the same environment.
--
-- Prerequisites:
--   Backup tables must exist:
--     public._rrowm_s6e_backup_artists
--     public._rrowm_s6e_backup_actor_profiles
--     public._rrowm_s6e_backup_galleries
--
-- Does NOT restore truncated application data (artworks, deals, etc.).
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/admin_consolidation_6e_rollback.sql

BEGIN;

DO $$
BEGIN
  IF to_regclass('public._rrowm_s6e_backup_artists') IS NULL THEN
    RAISE EXCEPTION 'Rollback aborted: public._rrowm_s6e_backup_artists not found';
  END IF;
  IF to_regclass('public._rrowm_s6e_backup_actor_profiles') IS NULL THEN
    RAISE EXCEPTION 'Rollback aborted: public._rrowm_s6e_backup_actor_profiles not found';
  END IF;
END $$;

-- Restore galleries first (artists.gallery_id may reference galleries)
INSERT INTO public.galleries
SELECT
  b.id, b.name, b.contact_email, b.status, b.started_at, b.expires_at,
  b.created_at, b.subscription_status, b.verified, b.slug, b.location,
  b.description, b.website_url, b.verified_at, b.verified_by, b.is_test,
  b.public_presence
FROM public._rrowm_s6e_backup_galleries b
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  contact_email = excluded.contact_email,
  status = excluded.status,
  subscription_status = excluded.subscription_status,
  verified = excluded.verified,
  slug = excluded.slug,
  location = excluded.location,
  description = excluded.description,
  website_url = excluded.website_url,
  verified_at = excluded.verified_at,
  verified_by = excluded.verified_by,
  is_test = excluded.is_test,
  public_presence = excluded.public_presence;

-- Restore artist rows (includes is_admin flags as at backup time)
INSERT INTO public.artists
SELECT
  b.id,
  b.full_name,
  b.display_name,
  b.bio,
  b.website,
  b.instagram,
  b.verification_status,
  b.verified_at,
  b.is_admin,
  b.membership_status,
  b.role,
  b.gallery_id,
  b.slug,
  b.is_test,
  b.represented_by_gallery,
  b.public_presence,
  b.studio_artworks_accent,
  b.shown_on_institutional_public
FROM public._rrowm_s6e_backup_artists b
ON CONFLICT (id) DO UPDATE SET
  full_name = excluded.full_name,
  display_name = excluded.display_name,
  bio = excluded.bio,
  website = excluded.website,
  instagram = excluded.instagram,
  verification_status = excluded.verification_status,
  verified_at = excluded.verified_at,
  is_admin = excluded.is_admin,
  membership_status = excluded.membership_status,
  role = excluded.role,
  gallery_id = excluded.gallery_id,
  slug = excluded.slug,
  is_test = excluded.is_test,
  represented_by_gallery = excluded.represented_by_gallery,
  public_presence = excluded.public_presence,
  studio_artworks_accent = excluded.studio_artworks_accent,
  shown_on_institutional_public = excluded.shown_on_institutional_public;

-- Restore actor_profiles
INSERT INTO public.actor_profiles
SELECT
  b.user_id,
  b.role,
  b.display_name,
  b.created_at,
  b.updated_at,
  b.is_test,
  b.onboarding_complete,
  b.public_presence,
  b.account_status,
  b.deactivated_at,
  b.deleted_at,
  b.deletion_scheduled_at,
  b.deletion_reason,
  b.deletion_requested_by,
  b.deletion_notification_email,
  b.recovery_token,
  b.recovery_token_expires_at
FROM public._rrowm_s6e_backup_actor_profiles b
ON CONFLICT (user_id) DO UPDATE SET
  role = excluded.role,
  display_name = excluded.display_name,
  onboarding_complete = excluded.onboarding_complete,
  public_presence = excluded.public_presence,
  account_status = excluded.account_status,
  deactivated_at = excluded.deactivated_at,
  is_test = excluded.is_test;

COMMIT;

-- Note: artwork ownership, deals, and other application rows are NOT rolled back.
-- Use a full database restore from pg_dump if application data was mutated.
