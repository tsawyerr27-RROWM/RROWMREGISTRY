-- RROWM RC1 demo wipe (public data only). Run before seed replay on staging.
-- Does not modify schema. Does not touch auth.* unless restored separately.
BEGIN;
SET session_replication_role = replica;

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
  public.collector_profiles,
  public.artists,
  public.actor_profiles,
  public.galleries
RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;
COMMIT;
