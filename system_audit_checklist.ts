export type AuditStatus = "not_run" | "pass" | "fail" | "blocked";

export type AuditRole = "artist" | "gallery" | "collector" | "system";

export type AuditEvidence = {
  kind: "sql" | "rpc" | "route" | "table" | "policy" | "trigger" | "note";
  ref: string;
};

export type AuditCheck = {
  /** Stable identifier for reporting and sorting. */
  id: string;
  /** Category matching the audit scope. */
  area:
    | "onboarding"
    | "artwork_registration"
    | "value_events"
    | "ownership"
    | "verification"
    | "certificates"
    | "registry_page"
    | "role_interactions"
    | "representation"
    | "permissions_rls"
    | "test_mode_reset";
  /** Who initiates/depends on this behavior. */
  role: AuditRole;
  /** Human-readable feature name. */
  feature: string;
  /** What must be true for launch. */
  expected: string;
  /** Fill in during audit runs. */
  actual: string;
  /** pass/fail/blocked/not_run */
  status: AuditStatus;
  /** Optional pointers to code/migrations/routes/queries used as evidence. */
  evidence?: AuditEvidence[];
};

export function createAuditChecklist(): AuditCheck[] {
  return [
    // ---------------------------------------------------------------------
    // 1) ONBOARDING FLOWS
    // ---------------------------------------------------------------------
    {
      id: "onboarding.artist.complete",
      area: "onboarding",
      role: "artist",
      feature: "Artist completes onboarding",
      expected:
        "RPC completes without error; artists row exists; actor_profiles.role='artist'; actor_profiles.onboarding_complete=true.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.complete_onboarding_artist(text,text,text)" },
        { kind: "table", ref: "public.actor_profiles(user_id, role, onboarding_complete)" },
        { kind: "table", ref: "public.artists(id)" },
        { kind: "route", ref: "app/onboarding/OnboardingClient.tsx (submitArtist)" },
        { kind: "sql", ref: "supabase/migrations/20260401170000_unified_onboarding.sql" },
      ],
    },
    {
      id: "onboarding.gallery.bootstrap",
      area: "onboarding",
      role: "gallery",
      feature: "Gallery onboarding bootstraps membership",
      expected:
        "RPC creates galleries row + gallery_users row (admin) + actor_profiles.role='gallery'; subscription_status enforced per policy (or 'grace' if intended); onboarding_complete=true if required by product spec.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.bootstrap_gallery_profile(text,text,text,text) returns uuid" },
        { kind: "table", ref: "public.galleries(subscription_status, verified)" },
        { kind: "table", ref: "public.gallery_users(gallery_id, user_id, role)" },
        { kind: "route", ref: "app/onboarding/OnboardingClient.tsx (submitGallery)" },
        { kind: "sql", ref: "supabase/migrations/20260401160000_gallery_entity_onboarding.sql" },
      ],
    },
    {
      id: "onboarding.collector.complete",
      area: "onboarding",
      role: "collector",
      feature: "Collector completes onboarding",
      expected:
        "RPC completes without error; collector_profiles row exists; actor_profiles.role='collector'; actor_profiles.onboarding_complete=true.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.complete_onboarding_collector(text,text)" },
        { kind: "table", ref: "public.collector_profiles(user_id)" },
        { kind: "table", ref: "public.actor_profiles(user_id, role, onboarding_complete)" },
        { kind: "route", ref: "app/onboarding/OnboardingClient.tsx (submitCollector)" },
        { kind: "sql", ref: "supabase/migrations/20260401170000_unified_onboarding.sql" },
      ],
    },
    {
      id: "onboarding.redirects.partial_accounts",
      area: "onboarding",
      role: "system",
      feature: "Redirects + partial account safety",
      expected:
        "If actor_profiles role exists but downstream profile row missing OR onboarding_complete=false, user is routed back into onboarding; no infinite loop; no partially-created state blocks progress.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "route", ref: "lib/onboarding.ts (getOnboardingRedirectPath, homePathForRole)" },
        { kind: "route", ref: "app/onboarding/OnboardingClient.tsx (decideStep)" },
      ],
    },

    // ---------------------------------------------------------------------
    // 2) ARTWORK REGISTRATION (CRITICAL)
    // ---------------------------------------------------------------------
    {
      id: "registration.artist.register_artwork_atomic",
      area: "artwork_registration",
      role: "artist",
      feature: "Artist registers artwork (atomic)",
      expected:
        "register_artwork_atomic creates artwork row + initial ownership event; registry_id generated; metadata_hash generated; work appears in artist dashboard; registry visibility respects verification rules.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.register_artwork_atomic(...)" },
        { kind: "table", ref: "public.artworks(registry_id, metadata_hash)" },
        { kind: "table", ref: "public.ownership_events(artwork_id, to_user_id, created_at)" },
        { kind: "route", ref: "app/studio/page.tsx (register artwork flow)" },
      ],
    },
    {
      id: "registration.gallery.register_artwork_atomic",
      area: "artwork_registration",
      role: "gallery",
      feature: "Gallery registers artwork (atomic)",
      expected:
        "register_artwork_atomic creates artwork row + initial ownership event; links to artist; registry_id + metadata_hash generated; work appears in gallery dashboard under represented artists; registry visibility respects verification rules.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.register_artwork_atomic(...)" },
        { kind: "route", ref: "app/institutional-studio-dashboard/page.tsx (handleGalleryRegisterArtwork)" },
      ],
    },
    {
      id: "representation.artist.confirm_institution_filing",
      area: "representation",
      role: "artist",
      feature: "Artist confirms institution-filed work (layered participation)",
      expected:
        "Queued works show after institution filing; artist_confirm_representation_on_file appends confirmation events, updates relationship status when present; public participation layers reflect artist confirmation.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.get_artist_representation_review_queue()" },
        { kind: "rpc", ref: "public.artist_confirm_representation_on_file(uuid)" },
        { kind: "route", ref: "app/api/representation/artist-confirm/route.ts" },
        { kind: "route", ref: "components/Studio/ArtistRepresentationReviewSection.tsx" },
        { kind: "sql", ref: "supabase/migrations/20260510120000_artist_representation_confirm.sql" },
      ],
    },
    {
      id: "representation.amendment.request_resolve",
      area: "representation",
      role: "system",
      feature: "Representation amendment requests (artist ↔ institution)",
      expected:
        "Either party can request; one pending per work; counterpart accepts/declines; optional catalogue fields apply on accept; chronology events recorded; studio and gallery dashboards list and resolve.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.request_representation_amendment(uuid,text,jsonb)" },
        { kind: "rpc", ref: "public.resolve_representation_amendment(uuid,boolean,text)" },
        { kind: "rpc", ref: "public.withdraw_representation_amendment(uuid)" },
        { kind: "route", ref: "app/api/representation/amendment/request/route.ts" },
        { kind: "route", ref: "app/api/representation/amendment/resolve/route.ts" },
        { kind: "route", ref: "components/Studio/RepresentationAmendmentsSection.tsx" },
        { kind: "sql", ref: "supabase/migrations/20260511120000_representation_amendment_requests.sql" },
      ],
    },
    {
      id: "representation.end_historical_display",
      area: "representation",
      role: "system",
      feature: "End representation; historical participation remains visible",
      expected:
        "Artist or institution can end active representation; relationships get ended_at; chronology records representation_ended; roster shows Historical; public artist and artwork layers use historical copy.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.end_gallery_artist_representation(uuid,text)" },
        { kind: "rpc", ref: "public.get_artist_representation_state(uuid)" },
        { kind: "route", ref: "app/api/representation/end/route.ts" },
        { kind: "route", ref: "components/Studio/EndRepresentationModal.tsx" },
        { kind: "sql", ref: "supabase/migrations/20260512120000_representation_end.sql" },
      ],
    },

    // ---------------------------------------------------------------------
    // 3) VALUE EVENTS
    // ---------------------------------------------------------------------
    {
      id: "value.add_value_event.basic",
      area: "value_events",
      role: "artist",
      feature: "add_value_event stores currency/value consistently",
      expected:
        "add_value_event inserts immutable value_events row; currency normalized (uppercase ISO); no implicit conversion; appears in insights where expected.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.add_value_event(...)" },
        { kind: "table", ref: "public.value_events(currency, declared_value, value_type, visibility_level)" },
        { kind: "sql", ref: "supabase/migrations/20260401092000_currency_system.sql" },
      ],
    },
    {
      id: "value.multicurrency.no_conversion",
      area: "value_events",
      role: "system",
      feature: "Multi-currency behavior",
      expected:
        "Multiple currencies can coexist per artwork; insights do not assume a single base currency or silently mix units.",
      actual: "",
      status: "not_run",
    },

    // ---------------------------------------------------------------------
    // 4) OWNERSHIP SYSTEM
    // ---------------------------------------------------------------------
    {
      id: "ownership.get_current_owner.cache_sync",
      area: "ownership",
      role: "system",
      feature: "get_current_owner + cache sync",
      expected:
        "get_current_owner returns latest ownership_events.to_user_id; trigger keeps artworks.current_owner_id in sync on ownership_events insert.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.get_current_owner(uuid)" },
        { kind: "trigger", ref: "trg_ownership_events_sync_current_owner" },
        { kind: "sql", ref: "supabase/migrations/20260401090000_prelaunch_consolidation.sql" },
      ],
    },
    {
      id: "ownership.chain_guard.edge_cases",
      area: "ownership",
      role: "system",
      feature: "Ownership chain guard edge cases",
      expected:
        "If from_user_id is provided, it must match previous to_user_id; missing from_user_id is allowed; invalid chains rejected with clear error.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "trigger", ref: "trg_aaa_ownership_events_chain_guard_bi" },
        { kind: "sql", ref: "supabase/migrations/20260401091000_system_audit_integrity.sql" },
      ],
    },

    // ---------------------------------------------------------------------
    // 5) VERIFICATION SYSTEM
    // ---------------------------------------------------------------------
    {
      id: "verification.gallery.must_be_verified",
      area: "verification",
      role: "gallery",
      feature: "Gallery verification authority",
      expected:
        "Only verified galleries can attest; verification_events insert allowed only when gallery verified; artworks.verification_status refreshes via trigger and matches compute function.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.gallery_verify_artwork(uuid)" },
        { kind: "rpc", ref: "public.compute_artwork_verification_status(uuid)" },
        { kind: "trigger", ref: "trg_enforce_verified_gallery_verification_event" },
        { kind: "trigger", ref: "trg_verification_events_refresh_artwork_verified" },
      ],
    },

    // ---------------------------------------------------------------------
    // 6) CERTIFICATES
    // ---------------------------------------------------------------------
    {
      id: "certs.issue_and_verify",
      area: "certificates",
      role: "system",
      feature: "Issue certificate + verify certificate",
      expected:
        "issue_certificate_for_verified_artwork creates certificate_snapshot + certificate_hash; multiple certificates allowed; verify_certificate returns valid=false for revoked/invalid hashes.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.issue_certificate_for_verified_artwork(uuid)" },
        { kind: "rpc", ref: "public.verify_certificate(text) / public.verify_certificate(uuid)" },
        { kind: "table", ref: "public.certificates(certificate_snapshot, certificate_hash, revoked)" },
      ],
    },

    // ---------------------------------------------------------------------
    // 7) REGISTRY PAGE
    // ---------------------------------------------------------------------
    {
      id: "registry.verified_only",
      area: "registry_page",
      role: "system",
      feature: "Public registry shows verified only",
      expected:
        "Only verified artworks appear in public registry; certificate status labels are correct; pagination + filters behave correctly.",
      actual: "",
      status: "not_run",
    },

    // ---------------------------------------------------------------------
    // 8) ROLE INTERACTIONS
    // ---------------------------------------------------------------------
    {
      id: "interactions.artist_gallery.invites_representation",
      area: "role_interactions",
      role: "system",
      feature: "Artist ↔ Gallery invites + representation",
      expected:
        "Invites can be created by gallery admin; representation flag/relationship propagates; gallery sees represented artists and their works where intended; artist sees representation state.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "table", ref: "public.gallery_artist_invites" },
        { kind: "table", ref: "public.artists(represented_by_gallery, gallery_id)" },
      ],
    },
    {
      id: "interactions.ownership_visibility",
      area: "role_interactions",
      role: "system",
      feature: "Gallery/Artist/Collector ownership changes visible",
      expected:
        "Ownership transfer inserts ownership_events; current owner sync; changes appear in relevant dashboards and public views as permitted.",
      actual: "",
      status: "not_run",
    },

    // ---------------------------------------------------------------------
    // 9) PERMISSIONS / RLS
    // ---------------------------------------------------------------------
    {
      id: "rls.role_boundaries",
      area: "permissions_rls",
      role: "system",
      feature: "Role boundaries enforced",
      expected:
        "Artists cannot edit galleries; collectors cannot verify artworks; only verified galleries can attest; public selects constrained to verified/allowed surfaces.",
      actual: "",
      status: "not_run",
    },

    // ---------------------------------------------------------------------
    // 10) TEST MODE + RESET
    // ---------------------------------------------------------------------
    {
      id: "testmode.flags_and_reset",
      area: "test_mode_reset",
      role: "system",
      feature: "Test mode flags + reset_test_environment",
      expected:
        "is_test flags exist on all relevant tables; reset_test_environment removes all is_test data across related tables without orphaning; admin-only.",
      actual: "",
      status: "not_run",
      evidence: [
        { kind: "rpc", ref: "public.reset_test_environment()" },
        { kind: "sql", ref: "supabase/migrations/20260401160000_gallery_entity_onboarding.sql" },
        { kind: "route", ref: "app/api/admin/test/reset/route.ts" },
      ],
    },
  ];
}

export function summarizeChecklist(checks: AuditCheck[]) {
  const total = checks.length;
  const byStatus = checks.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<AuditStatus, number>
  );

  const failures = checks.filter((c) => c.status === "fail");
  const blocked = checks.filter((c) => c.status === "blocked");

  return {
    total,
    byStatus,
    failures: failures.map((c) => ({ id: c.id, feature: c.feature, area: c.area })),
    blocked: blocked.map((c) => ({ id: c.id, feature: c.feature, area: c.area })),
  };
}

