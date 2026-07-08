-- RROWM Day Zero reset v2 — True production launch (application layer only).
--
-- Removes ALL public application data. No identities, organisations, or registry
-- records survive. Platform infrastructure is untouched.
--
-- PRESERVED (not referenced by this script):
--   auth.*          — users, identities, sessions, refresh tokens
--   storage.*       — buckets and objects
--   supabase_migrations / schema — tables, RLS, functions, triggers, policies
--   telemetry_events, runtime_errors, system_errors
--   account_action_rate_limits, account_audit_log, data_export_requests
--
-- Does not drop schema, policies, or functions.
-- Run with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/demo_wipe_rc1.sql
BEGIN;
SET session_replication_role = replica;

-- ---------------------------------------------------------------------------
-- Truncate all application data (registry, filings, identity — no exceptions)
-- ---------------------------------------------------------------------------
TRUNCATE TABLE
  public.dispute_evidence,
  public.disputes,
  public.market_enquiries,
  public.market_listings,
  public.notifications,
  public.activity_events,
  public.collector_vault_items,
  public.field_opportunity_applications,
  public.representation_relationships,
  public.rights_licenses,
  public.deal_execution_records,
  public.deal_messages,
  public.deal_revisions,
  public.archive_events,
  public.artwork_archives,
  public.registry_steward_invites,
  public.artwork_authentication_invites,
  public.gallery_artist_invites,
  public.representation_amendment_requests,
  public.artwork_confirmation_events,
  public.artwork_representation_relationships,
  public.ownership_claims,
  public.provenance_transfers,
  public.record_anchors,
  public.provenance_events,
  public.certificates,
  public.verification_events,
  public.sale_intents,
  public.ownership_events,
  public.value_events,
  public.field_briefs,
  public.field_programmes,
  public.deals,
  public.artworks,
  public.gallery_users,
  public.galleries,
  public.collector_profiles,
  public.artists,
  public.actor_profiles
RESTART IDENTITY CASCADE;

-- Optional tables (present on production; skip gracefully in older environments)
DO $$
BEGIN
  IF to_regclass('public.invitations') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE public.invitations RESTART IDENTITY CASCADE';
  END IF;
  IF to_regclass('public.artist_memberships') IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE public.artist_memberships RESTART IDENTITY CASCADE';
  END IF;
END $$;

SET session_replication_role = DEFAULT;
COMMIT;
