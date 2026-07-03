"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { WelcomeModal } from "@/components/ui/IntroModal";
import { galleryIntroSteps } from "@/components/ui/intro-content";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { StudioShell } from "@/components/Studio/StudioShell";
import { useStudioGuardUser } from "@/components/Studio/StudioRouteGuard";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { WorkspaceSidebarActivityFeed } from "@/components/Studio/WorkspaceSidebarActivityFeed";
import { useAccountActivityFeed } from "@/hooks/useAccountActivityFeed";
import { translateActivityMessage } from "@/lib/activity-i18n";
import {
  buildOrganisationNavItems,
  consumePendingGallerySection,
  ORGANISATION_SECTION_LABEL_KEYS,
} from "@/lib/studio-nav";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { triggerConsequenceFeedback } from "@/lib/consequence-feedback-runtime";
import { TestDataControls } from "@/components/Admin/TestDataControls";
import {
  RegisterModal,
  type RegisterModalArtwork,
} from "@/components/Dashboard/RegisterModal";
import { DataInsightModal } from "@/components/Insights/DataInsightModal";
import { StudioCatalogueMetricsPanels } from "@/components/Studio/StudioCatalogueMetricsPanels";
import { GalleryInstitutionalHero } from "@/components/gallery/GalleryInstitutionalHero";
import { OrganisationVerificationCommand } from "@/components/gallery/OrganisationVerificationCommand";
import {
  StudioRoleBand,
  studioRoleBandCopy,
} from "@/components/Studio/StudioRoleBand";
import {
  StudioContentSlab,
  StudioInsightTile,
  studioOverviewStackClass,
} from "@/components/Studio/StudioContentSlab";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ArtistTierBadge } from "@/components/artist/ArtistTierBadge";
import { GalleryInvitationsHub } from "@/components/gallery/GalleryInvitationsHub";
import {
  type GalleryInviteRow,
} from "@/components/gallery/GalleryInvitationsSection";
import {
  ArtworkAuthenticationInviteModal,
  type ArtworkAuthInviteTarget,
} from "@/components/gallery/ArtworkAuthenticationInviteModal";
import type { ArtworkAuthenticationInviteRow } from "@/lib/artwork-authentication-invite";
import {
  artworkNeedsAuthenticationInvite,
  authenticatedArtworkAuthInviteIds,
  pendingArtworkAuthInviteByArtworkId,
} from "@/lib/artwork-auth-invite-ui";
import { GalleryVerifyAttestationModal } from "@/components/gallery/GalleryVerifyAttestationModal";
import { formatCurrency } from "@/lib/formatCurrency";
import { getDashboardInsights } from "@/lib/insights";
import {
  fetchStudioCatalogueMetrics,
  type StudioCatalogueMetrics,
} from "@/lib/studio-catalogue-metrics";
import {
  buildHealthInsightBreakdown,
  buildValueInsightBreakdown,
} from "@/lib/studio-insight-breakdown";
import {
  translateInsightBarCategory,
  translateRoleInsight,
} from "@/lib/insights-i18n";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";
import { RrowmMiniBarChart } from "@/components/ui/RrowmMiniBarChart";
import { RecordReadinessSection } from "@/components/gallery/RecordReadinessSection";
import { RecordIntegritySection } from "@/components/gallery/RecordIntegritySection";
import { PriorityQueueSection } from "@/components/gallery/PriorityQueueSection";
import {
  computeArtworkPriorityQueueItem,
  sortPriorityQueue,
} from "@/lib/gallery-priority-engine";
import {
  getArtistTier,
  withDisputeOverride,
  type ArtistTier,
} from "@/lib/artist-tier";
import {
  parseGalleryRepresentationSummary,
  type GalleryRepresentationSummary,
} from "@/lib/artwork-representation";
import {
  mapAmendmentRequestRow,
  type RepresentationAmendmentListItem,
} from "@/lib/representation-amendments";
import { getSiteUrl } from "@/lib/site-url";
import ModalShell from "@/components/ui/ModalShell";
import { OrganisationOpportunitiesSection } from "@/components/Studio/OrganisationOpportunitiesSection";
import { RepresentationAmendmentsSection } from "@/components/Studio/RepresentationAmendmentsSection";
import { EndRepresentationModal } from "@/components/Studio/EndRepresentationModal";
import {
  GalleryRegistrationOutcome,
  type GalleryRegistrationOutcomeData,
} from "@/components/gallery/GalleryRegistrationOutcome";
import {
  GalleryParticipationPendingSection,
  type ParticipationPendingWork,
} from "@/components/gallery/GalleryParticipationPendingSection";
import { ARTWORK_CONFIRMATION_EVENT_TYPES } from "@/lib/artwork-representation";
import { pickLatestOwnershipEvent } from "@/lib/ownership-canonical";

function formatShortWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function formatVerificationStatus(
  status: string | null | undefined,
  tr: (key: MessageKey) => string
): string {
  const s = String(status || "").toLowerCase();
  if (s === "verified") return tr("gallery.catalogue.verified");
  if (!s) return tr("gallery.representation.pending");
  return s.replace(/_/g, " ");
}

type GalleryRow = {
  id: string;
  name: string | null;
  slug: string;
  location: string | null;
  description: string | null;
  website_url: string | null;
  verified: boolean;
  subscription_status: string | null;
};

type ArtistRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  slug: string | null;
  represented_by_gallery: boolean | null;
  shown_on_institutional_public?: boolean | null;
};

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  artist_id: string | null;
  catalogue_artist_name?: string | null;
  pending_artist_email?: string | null;
  filing_gallery_id?: string | null;
  verification_status: string | null;
  created_at: string | null;
  approved_at: string | null;
  image_url: string | null;
  year: string | number | null;
  medium: string | null;
  metadata_hash: string | null;
  current_owner_id: string | null;
};

function formatRegisterFailure(
  error: unknown,
  tr: (key: MessageKey) => string
): string {
  const msg = summarizeRpcError(error);
  if (msg && msg !== "RPC error (no enumerable fields)") return msg;
  if (error instanceof Error && error.message) return error.message;
  return tr("gallery.toast.registerFailedDetail");
}

function buildArtistInviteEmailDraft(params: {
  galleryName: string;
  artistEmail: string;
  gallerySlug?: string | null;
  t: (key: MessageKey) => string;
}): string {
  const site = getSiteUrl();
  const { galleryName, artistEmail, t } = params;
  const slug = params.gallerySlug?.trim();
  const galleryLine = slug
    ? fillMessage(t("gallery.inviteDraft.galleryPage"), {
        url: `${site}/gallery/${slug}`,
      })
    : fillMessage(t("gallery.inviteDraft.galleryPagePlaceholder"), { site });
  return [
    `Subject: ${fillMessage(t("gallery.inviteDraft.subject"), { galleryName })}`,
    "",
    fillMessage(t("gallery.inviteDraft.to"), { email: artistEmail }),
    "",
    fillMessage(t("gallery.inviteDraft.bodyIntro"), { galleryName }),
    "",
    t("gallery.inviteDraft.acceptLine1"),
    t("gallery.inviteDraft.acceptLine2"),
    "",
    fillMessage(t("gallery.inviteDraft.registrySignup"), { site }),
    "",
    galleryLine,
    "",
    t("gallery.inviteDraft.afterOnboarding"),
  ].join("\n");
}

type GalleryRole = "admin" | "staff";

export default function GalleryDashboardPage() {
  const { t, region } = useLocalePreferences();
  const sb = useSupabaseBrowserLazy();
  const guardUser = useStudioGuardUser();
  const userId = guardUser?.userId ?? null;
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<GalleryRow | null>(null);
  const [membershipRole, setMembershipRole] = useState<GalleryRole | null>(null);
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [invites, setInvites] = useState<GalleryInviteRow[]>([]);
  const [artworks, setArtworks] = useState<ArtworkRow[]>([]);
  const [readinessContext, setReadinessContext] = useState<{
    ownershipByArtworkId: Record<string, number>;
    hasDeclaredValueByArtworkId: Record<string, boolean>;
  }>({ ownershipByArtworkId: {}, hasDeclaredValueByArtworkId: {} });
  const [integrityContext, setIntegrityContext] = useState<{
    ownershipEventCountByArtworkId: Record<string, number>;
    ownershipLastToUserIdByArtworkId: Record<string, string | null>;
    hasAnyValueEventByArtworkId: Record<string, boolean>;
    hasGalleryVerificationByArtworkId: Record<string, boolean>;
    hasLiveCertificateByArtworkId: Record<string, boolean>;
    hasRevokedCertificateByArtworkId: Record<string, boolean>;
    maxDeclaredValueByArtworkId: Record<
      string,
      { value: number; currency: string | null } | null
    >;
    lastActivityAtByArtworkId: Record<string, string | null>;
    isListedByArtworkId: Record<string, boolean>;
  }>({
    ownershipEventCountByArtworkId: {},
    ownershipLastToUserIdByArtworkId: {},
    hasAnyValueEventByArtworkId: {},
    hasGalleryVerificationByArtworkId: {},
    hasLiveCertificateByArtworkId: {},
    hasRevokedCertificateByArtworkId: {},
    maxDeclaredValueByArtworkId: {},
    lastActivityAtByArtworkId: {},
    isListedByArtworkId: {},
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    location: "",
    description: "",
    website_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteCopyDone, setInviteCopyDone] = useState(false);
  /** Keeps “To:” line accurate in the draft after the input is cleared post-save. */
  const [lastRecordedInviteEmail, setLastRecordedInviteEmail] = useState<
    string | null
  >(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const [publishingPublicInviteId, setPublishingPublicInviteId] = useState<
    string | null
  >(null);
  const [invitePublishError, setInvitePublishError] = useState<string | null>(null);
  const [disputeFlags, setDisputeFlags] = useState<{
    byInviteId: Record<string, boolean>;
    byArtistId: Record<string, boolean>;
  }>({ byInviteId: {}, byArtistId: {} });
  /** Set when POST /send-artist-invite returns 409 duplicate (list may be stale). */
  const [inviteDuplicateFromApi, setInviteDuplicateFromApi] = useState<{
    inviteId: string;
  } | null>(null);
  const [artworkAuthInvites, setArtworkAuthInvites] = useState<
    ArtworkAuthenticationInviteRow[]
  >([]);
  const [resendingArtworkAuthInviteId, setResendingArtworkAuthInviteId] =
    useState<string | null>(null);
  const [artworkAuthInviteMessage, setArtworkAuthInviteMessage] = useState<
    string | null
  >(null);
  const [artworkAuthInviteError, setArtworkAuthInviteError] = useState<
    string | null
  >(null);
  const [authInviteTarget, setAuthInviteTarget] =
    useState<ArtworkAuthInviteTarget | null>(null);
  const [authInvitePrefillEmail, setAuthInvitePrefillEmail] = useState("");
  const artistsSectionRef = useRef<HTMLDivElement | null>(null);
  const inviteSectionRef = useRef<HTMLDivElement | null>(null);
  const verificationSectionRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState<
    | "studio"
    | "record-depth"
    | "roster"
    | "invitations"
    | "catalogue"
    | "verification"
    | "opportunities"
  >("studio");
  const [workspaceGuideOpen, setWorkspaceGuideOpen] = useState(false);
  const [isTransitioningSection, setIsTransitioningSection] = useState(false);

  useEffect(() => {
    const pending = consumePendingGallerySection();
    if (pending) {
      setActiveSection(pending);
    }
  }, []);

  const [representationSummary, setRepresentationSummary] =
    useState<GalleryRepresentationSummary | null>(null);
  const [representationAmendments, setRepresentationAmendments] = useState<
    RepresentationAmendmentListItem[]
  >([]);
  const [amendmentBusyId, setAmendmentBusyId] = useState<string | null>(null);
  const [endRepTarget, setEndRepTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [endRepBusy, setEndRepBusy] = useState(false);
  const [historicalArtistIds, setHistoricalArtistIds] = useState<Set<string>>(
    () => new Set()
  );
  const [lastRegistration, setLastRegistration] =
    useState<GalleryRegistrationOutcomeData | null>(null);
  const [participationPendingWorks, setParticipationPendingWorks] = useState<
    ParticipationPendingWork[]
  >([]);
  const [artworkIdsAwaitingArtistAttestation, setArtworkIdsAwaitingArtistAttestation] =
    useState<Set<string>>(() => new Set());
  const [verifyTarget, setVerifyTarget] = useState<ArtworkRow | null>(null);

  const [insightPack, setInsightPack] = useState<Awaited<
    ReturnType<typeof getDashboardInsights>
  > | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightOpen, setInsightOpen] = useState<null | "works" | "value" | "health">(
    null
  );
  const [insightData, setInsightData] = useState<any[]>([]);
  const [insightLines, setInsightLines] = useState<{ key: string; label: string }[]>(
    []
  );
  const [insightTitle, setInsightTitle] = useState("");
  const [insightSubtitle, setInsightSubtitle] = useState("");
  const [insightKind, setInsightKind] = useState<"line" | "bar">("line");
  const [insightBreakdown, setInsightBreakdown] = useState<
    { label: string; value: string }[]
  >([]);
  const [insightDataNotes, setInsightDataNotes] = useState<string[]>([]);
  const [catalogueMetrics, setCatalogueMetrics] =
    useState<StudioCatalogueMetrics | null>(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [registerArtistId, setRegisterArtistId] = useState("");
  const [registerCatalogueArtistName, setRegisterCatalogueArtistName] =
    useState("");
  const [registerPendingArtistEmail, setRegisterPendingArtistEmail] =
    useState("");
  const [newArtwork, setNewArtwork] = useState<RegisterModalArtwork>({
    title: "",
    year: "",
    medium: "",
    dimensions: "",
    description: "",
    visibility_level: "private",
    imageFile: null,
    declared_value: "",
    currency: "",
    value_type: "initial_valuation",
  });

  const load = useCallback(async () => {
    const uid = guardUser?.userId;
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    await sb().auth.refreshSession();

    const { data: memRow, error: memErr } = await sb()
      .from("gallery_users")
      .select(
        `
        role,
        galleries (
          id,
          name,
          slug,
          location,
          description,
          website_url,
          verified,
          subscription_status
        )
      `
      )
      .eq("user_id", uid)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (memErr) {
      setProfileError(
        summarizeRpcError(memErr) || t("gallery.toast.loadMembershipFailed")
      );
      setGallery(null);
      setArtworks([]);
      setRepresentationAmendments([]);
      setHistoricalArtistIds(new Set());
      setReadinessContext({
        ownershipByArtworkId: {},
        hasDeclaredValueByArtworkId: {},
      });
      setLoading(false);
      return;
    }

    const raw = memRow?.galleries as
      | GalleryRow
      | GalleryRow[]
      | null
      | undefined;
    const g = Array.isArray(raw) ? raw[0] : raw;

    if (!g?.id) {
      setGallery(null);
      setProfileError(null);
      setArtworks([]);
      setRepresentationAmendments([]);
      setHistoricalArtistIds(new Set());
      setReadinessContext({
        ownershipByArtworkId: {},
        hasDeclaredValueByArtworkId: {},
      });
      setLoading(false);
      return;
    }

    setGallery(g);
    const r = memRow?.role;
    setMembershipRole(r === "admin" || r === "staff" ? r : null);
    setDraft({
      location: g.location?.trim() || "",
      description: g.description?.trim() || "",
      website_url: g.website_url?.trim() || "",
    });

    const [{ data: ar }, { data: inv }, { data: artAuthInv }] = await Promise.all([
      sb()
        .from("artists")
        .select(
          "id, display_name, full_name, slug, represented_by_gallery, shown_on_institutional_public"
        )
        .eq("gallery_id", g.id)
        .returns(),
      sb()
        .from("gallery_artist_invites")
        .select(
          "id, artist_email, status, created_at, visibility_status, token_expires_at, accepted_user_id, invite_token"
        )
        .eq("gallery_id", g.id)
        .order("created_at", { ascending: false })
        .returns(),
      sb()
        .from("artwork_authentication_invites")
        .select(
          `id, artwork_id, gallery_id, artist_email, artist_name, status, created_at, token_expires_at, invite_token, authenticated_at,
          artworks ( title, registry_id, image_url, catalogue_artist_name, artist_id )`
        )
        .eq("gallery_id", g.id)
        .order("created_at", { ascending: false })
        .returns(),
    ]);

    const artistList: ArtistRow[] = (ar as ArtistRow[] | null) || [];
    setArtists(artistList);
    setInvites(((inv as GalleryInviteRow[] | null) || []) satisfies GalleryInviteRow[]);
    setArtworkAuthInvites(
      ((artAuthInv as ArtworkAuthenticationInviteRow[] | null) || []) as ArtworkAuthenticationInviteRow[]
    );

    const { data: summaryRaw } = await sb().rpc(
      "get_gallery_representation_summary",
      { p_gallery_id: g.id }
    );
    setRepresentationSummary(parseGalleryRepresentationSummary(summaryRaw));

    let amendmentList: RepresentationAmendmentListItem[] = [];
    try {
      const { data: amdRaw } = await sb()
        .from("representation_amendment_requests")
        .select(
          `id, artwork_id, gallery_id, requester_role, notes, proposed_changes, status, created_at, resolved_at, resolution_notes,
          artworks ( title, registry_id, image_url, artist_id ),
          galleries ( name )`
        )
        .eq("gallery_id", g.id)
        .order("created_at", { ascending: false })
        .limit(40);
      amendmentList = (amdRaw || [])
        .map((x) => mapAmendmentRequestRow(x))
        .filter((x): x is RepresentationAmendmentListItem => x != null);
    } catch {
      amendmentList = [];
    }
    setRepresentationAmendments(amendmentList);

    const artistNameById: Record<string, string> = {};
    for (const a of artistList) {
      artistNameById[a.id] =
        a.display_name?.trim() || a.full_name?.trim() || t("gallery.fallback.artist");
    }

    const artistConfirmTypes = [
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedAuthorship,
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedRepresentation,
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedChronology,
    ] as string[];

    try {
      const [{ data: filedRows }, { data: confirmedRows }] = await Promise.all([
        sb()
          .from("artwork_confirmation_events")
          .select(
            "artwork_id, created_at, artworks ( id, title, registry_id, image_url, artist_id, catalogue_artist_name )"
          )
          .eq("gallery_id", g.id)
          .eq("event_type", ARTWORK_CONFIRMATION_EVENT_TYPES.institutionFiled)
          .order("created_at", { ascending: false }),
        sb()
          .from("artwork_confirmation_events")
          .select("artwork_id")
          .eq("gallery_id", g.id)
          .in("event_type", artistConfirmTypes),
      ]);

      const confirmedIds = new Set(
        (confirmedRows ?? []).map((r) => String((r as { artwork_id: string }).artwork_id))
      );
      const seenArt = new Set<string>();
      const pending: ParticipationPendingWork[] = [];
      for (const row of filedRows ?? []) {
        const aid = String((row as { artwork_id?: string }).artwork_id ?? "");
        if (!aid || confirmedIds.has(aid) || seenArt.has(aid)) continue;
        seenArt.add(aid);
        const artRaw = (row as { artworks?: unknown }).artworks;
        const art = (Array.isArray(artRaw) ? artRaw[0] : artRaw) as
          | {
              title?: string | null;
              registry_id?: string | null;
              image_url?: string | null;
              artist_id?: string | null;
            }
          | null
          | undefined;
        const artistId = art?.artist_id ? String(art.artist_id) : "";
        pending.push({
          artwork_id: aid,
          registry_id: art?.registry_id ?? null,
          title: art?.title ?? null,
          image_url: art?.image_url ?? null,
          artist_name: artistId ? artistNameById[artistId] ?? null : null,
          filed_at: (row as { created_at?: string }).created_at ?? null,
        });
      }
      setParticipationPendingWorks(pending);
      setArtworkIdsAwaitingArtistAttestation(
        new Set(pending.map((p) => p.artwork_id))
      );
    } catch {
      setParticipationPendingWorks([]);
      setArtworkIdsAwaitingArtistAttestation(new Set());
    }

    const ids = artistList.map((a) => a.id).filter(Boolean);
    if (ids.length > 0) {
      const { data: endedRows } = await sb()
        .from("artwork_representation_relationships")
        .select("artist_id")
        .eq("gallery_id", g.id)
        .in("artist_id", ids)
        .not("ended_at", "is", null);
      setHistoricalArtistIds(
        new Set(
          (endedRows ?? [])
            .map((r) => String((r as { artist_id?: string }).artist_id ?? ""))
            .filter(Boolean)
        )
      );
    } else {
      setHistoricalArtistIds(new Set());
    }
    let awQuery = sb()
      .from("artworks")
      .select(
        "id, title, registry_id, artist_id, catalogue_artist_name, pending_artist_email, filing_gallery_id, verification_status, created_at, approved_at, image_url, year, medium, metadata_hash, current_owner_id"
      )
      .order("created_at", { ascending: false });

    if (g.id && ids.length > 0) {
      awQuery = awQuery.or(
        `filing_gallery_id.eq.${g.id},artist_id.in.(${ids.join(",")})`
      );
    } else if (g.id) {
      awQuery = awQuery.eq("filing_gallery_id", g.id);
    } else if (ids.length > 0) {
      awQuery = awQuery.in("artist_id", ids);
    } else {
      setArtworks([]);
      setReadinessContext({
        ownershipByArtworkId: {},
        hasDeclaredValueByArtworkId: {},
      });
      setIntegrityContext({
        ownershipEventCountByArtworkId: {},
        ownershipLastToUserIdByArtworkId: {},
        hasAnyValueEventByArtworkId: {},
        hasGalleryVerificationByArtworkId: {},
        hasLiveCertificateByArtworkId: {},
        hasRevokedCertificateByArtworkId: {},
        maxDeclaredValueByArtworkId: {},
        lastActivityAtByArtworkId: {},
        isListedByArtworkId: {},
      });
      setLoading(false);
      return;
    }

    const { data: aw } = await awQuery.returns();

    const list: ArtworkRow[] = (aw as ArtworkRow[] | null) || [];
    const artworkIds = list.map((a) => a.id).filter(Boolean);
    const ownershipByArtworkId: Record<string, number> = {};
    const hasDeclaredValueByArtworkId: Record<string, boolean> = {};
    const ownershipLastToUserIdByArtworkId: Record<string, string | null> = {};
    const ownershipLastAtByArtworkId: Record<string, string> = {};
    const hasAnyValueEventByArtworkId: Record<string, boolean> = {};
    const hasGalleryVerificationByArtworkId: Record<string, boolean> = {};
    const hasLiveCertificateByArtworkId: Record<string, boolean> = {};
    const hasRevokedCertificateByArtworkId: Record<string, boolean> = {};
    const maxDeclaredValueByArtworkId: Record<
      string,
      { value: number; currency: string | null } | null
    > = {};
    const lastActivityAtByArtworkId: Record<string, string | null> = {};
    const isListedByArtworkId: Record<string, boolean> = {};

    if (artworkIds.length > 0) {
      const [oeRes, veRes, verRes, certRes, listingRes] = await Promise.all([
        sb()
          .from("ownership_events")
          .select("artwork_id, to_user_id, created_at, id")
          .in("artwork_id", artworkIds),
        sb()
          .from("value_events")
          .select("artwork_id, declared_value, currency, created_at")
          .in("artwork_id", artworkIds),
        sb()
          .from("verification_events")
          .select(
            "artwork_id, status, source, source_id, verification_method, verified_by_gallery_id, created_at"
          )
          .in("artwork_id", artworkIds),
        sb()
          .from("certificates")
          .select("artwork_id, revoked, issued_at")
          .in("artwork_id", artworkIds),
        // Optional market context: active listings only.
        sb()
          .from("market_listings")
          .select("artwork_id, status")
          .in("artwork_id", artworkIds)
          .eq("status", "active"),
      ]);

      const ownershipRowsByArt = new Map<
        string,
        Array<{
          artwork_id: string;
          to_user_id: string | null;
          created_at: string | null;
          id: string;
        }>
      >();

      for (const row of oeRes.data ?? []) {
        const r = row as {
          artwork_id: string;
          to_user_id: string | null;
          created_at: string | null;
          id: string;
        };
        const aid = String(r.artwork_id);
        const list = ownershipRowsByArt.get(aid) ?? [];
        list.push(r);
        ownershipRowsByArt.set(aid, list);
        const at = r.created_at || "";
        if (at) {
          const prev = lastActivityAtByArtworkId[aid];
          if (!prev || at > prev) lastActivityAtByArtworkId[aid] = at;
        }
      }

      for (const [aid, rows] of ownershipRowsByArt) {
        ownershipByArtworkId[aid] = rows.length;
        const latest = pickLatestOwnershipEvent(rows);
        ownershipLastToUserIdByArtworkId[aid] = latest?.to_user_id ?? null;
        if (latest?.created_at) {
          ownershipLastAtByArtworkId[aid] = latest.created_at;
        }
      }

      for (const row of veRes.data ?? []) {
        const r = row as {
          artwork_id: string;
          declared_value: unknown;
          currency: string | null;
          created_at: string | null;
        };
        const aid = String(r.artwork_id);
        hasAnyValueEventByArtworkId[aid] = true;
        const dv = r.declared_value;
        const ok =
          dv != null &&
          String(dv).trim() !== "" &&
          !Number.isNaN(Number(dv));
        if (ok) hasDeclaredValueByArtworkId[aid] = true;
        if (ok) {
          const v = Number(dv);
          const existing = maxDeclaredValueByArtworkId[aid];
          if (!existing || v > existing.value) {
            maxDeclaredValueByArtworkId[aid] = { value: v, currency: r.currency ?? null };
          }
        }
        const at = r.created_at || "";
        if (at) {
          const prev = lastActivityAtByArtworkId[aid];
          if (!prev || at > prev) lastActivityAtByArtworkId[aid] = at;
        }
      }

      const galleryVerified = Boolean(g.verified);
      for (const row of verRes.data ?? []) {
        const r = row as any;
        const aid = String(r.artwork_id);
        const status = String(r.status || "confirmed").toLowerCase().trim();
        if (status !== "confirmed") continue;
        const src = String(r.source || r.verification_method || "")
          .toLowerCase()
          .trim();
        const galleryId =
          (r.source_id as string | null | undefined) ??
          (r.verified_by_gallery_id as string | null | undefined) ??
          null;
        if (galleryVerified && src === "gallery" && galleryId && galleryId === g.id) {
          hasGalleryVerificationByArtworkId[aid] = true;
        }
        // recency boost: consider verification event timestamp if present on row
        const at = String(r.created_at || "");
        if (at) {
          const prev = lastActivityAtByArtworkId[aid];
          if (!prev || at > prev) lastActivityAtByArtworkId[aid] = at;
        }
      }

      for (const row of certRes.data ?? []) {
        const r = row as any;
        const aid = String(r.artwork_id);
        const revoked = r.revoked === true;
        const at = String(r.issued_at || "");
        if (at) {
          const prev = lastActivityAtByArtworkId[aid];
          if (!prev || at > prev) lastActivityAtByArtworkId[aid] = at;
        }
        if (revoked) {
          hasRevokedCertificateByArtworkId[aid] = true;
        } else {
          hasLiveCertificateByArtworkId[aid] = true;
        }
      }

      for (const row of listingRes.data ?? []) {
        const r = row as { artwork_id: string };
        const aid = String(r.artwork_id);
        isListedByArtworkId[aid] = true;
      }
    }

    setArtworks(list);
    setReadinessContext({
      ownershipByArtworkId,
      hasDeclaredValueByArtworkId,
    });
    setIntegrityContext({
      ownershipEventCountByArtworkId: ownershipByArtworkId,
      ownershipLastToUserIdByArtworkId,
      hasAnyValueEventByArtworkId,
      hasGalleryVerificationByArtworkId,
      hasLiveCertificateByArtworkId,
      hasRevokedCertificateByArtworkId,
      maxDeclaredValueByArtworkId,
      lastActivityAtByArtworkId,
      isListedByArtworkId,
    });

    if (artworkIds.length > 0) {
      try {
        const [insights, metrics] = await Promise.all([
          getDashboardInsights({
            supabase: sb(),
            userId: uid,
            artworkIds,
          }),
          fetchStudioCatalogueMetrics(sb(), {
            role: "gallery",
            userId: uid,
            artworks: list.map((row) => ({
              id: row.id,
              title: row.title,
              created_at: row.created_at,
            })),
          }),
        ]);
        setInsightPack(insights);
        setCatalogueMetrics(metrics);
      } catch {
        setInsightPack(null);
        setCatalogueMetrics(null);
      }
    } else {
      setInsightPack(null);
      setCatalogueMetrics(null);
    }

    setActivityRefreshKey((k) => k + 1);
    setLoading(false);
  }, [guardUser?.userId, sb, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolveAmendment = useCallback(
    async (
      amendmentId: string,
      accept: boolean,
      resolutionNotes: string | null
    ) => {
      setAmendmentBusyId(amendmentId);
      try {
        const res = await fetch("/api/representation/amendment/resolve", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amendment_id: amendmentId,
            accept,
            resolution_notes: resolutionNotes,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setProfileError(j?.error || t("studio.toast.amendmentResolveFailed"));
          return;
        }
        setProfileError(null);
        setSuccessMessage(
          accept
            ? t("studio.toast.amendmentAccepted")
            : t("studio.toast.amendmentDeclined")
        );
        await load();
      } catch {
        setProfileError(t("studio.toast.amendmentResolveError"));
      } finally {
        setAmendmentBusyId(null);
      }
    },
    [load, t]
  );

  const withdrawAmendment = useCallback(
    async (amendmentId: string) => {
      setAmendmentBusyId(amendmentId);
      try {
        const res = await fetch("/api/representation/amendment/withdraw", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amendment_id: amendmentId }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setProfileError(j?.error || t("studio.toast.withdrawFailed"));
          return;
        }
        setProfileError(null);
        setSuccessMessage(t("studio.toast.amendmentWithdrawn"));
        await load();
      } catch {
        setProfileError(t("studio.toast.withdrawError"));
      } finally {
        setAmendmentBusyId(null);
      }
    },
    [load, t]
  );

  const confirmEndRepresentation = useCallback(
    async (notes: string) => {
      if (!endRepTarget) return;
      setEndRepBusy(true);
      try {
        const res = await fetch("/api/representation/end", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artist_id: endRepTarget.id,
            notes: notes || null,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setProfileError(j?.error || t("studio.toast.endRepresentationFailed"));
          return;
        }
        setProfileError(null);
        setSuccessMessage(t("gallery.toast.representationEndedFull"));
        setEndRepTarget(null);
        await load();
      } catch {
        setProfileError(t("studio.toast.endRepresentationError"));
      } finally {
        setEndRepBusy(false);
      }
    },
    [endRepTarget, load, t]
  );

  const submitGalleryAmendmentRequest = useCallback(
    async (payload: {
      artwork_id: string;
      notes: string;
      proposed_changes: Record<string, string>;
    }) => {
      const res = await fetch("/api/representation/amendment/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j?.error || t("gallery.toast.registerRequestFailed"));
      }
      setProfileError(null);
      setSuccessMessage(t("studio.toast.amendmentRequestFiled"));
      await load();
    },
    [load, t]
  );

  const verifyQueue = useMemo(
    () =>
      artworks.filter(
        (a) => String(a.verification_status || "").toLowerCase() !== "verified"
      ),
    [artworks]
  );

  const worksCountByArtistId = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of artworks) {
      const aid = w.artist_id;
      if (!aid) continue;
      m.set(aid, (m.get(aid) ?? 0) + 1);
    }
    return m;
  }, [artworks]);

  const artistNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of artists) {
      m.set(
        a.id,
        a.display_name?.trim() || a.full_name?.trim() || t("gallery.fallback.artist")
      );
    }
    return m;
  }, [artists]);

  const artistNamesByIdRecord = useMemo(
    () => Object.fromEntries(Array.from(artistNameById.entries())),
    [artistNameById]
  );

  const amendmentArtworkOptions = useMemo(
    () =>
      artworks.map((a) => ({
        id: a.id,
        title: a.title,
        registry_id: a.registry_id,
      })),
    [artworks]
  );

  const { items: accountActivityItems } = useAccountActivityFeed(
    userId,
    1,
    activityRefreshKey
  );

  const latestActivityLine = useMemo(() => {
    const item = accountActivityItems[0];
    if (!item) return null as string | null;
    return translateActivityMessage(item, t);
  }, [accountActivityItems, t]);

  const pendingInviteCount = useMemo(
    () => invites.filter((i) => i.status === "pending").length,
    [invites]
  );

  const hasDuplicatePendingInvite = useMemo(() => {
    const e = inviteEmail.trim().toLowerCase();
    if (!e) return false;
    return invites.some(
      (i) =>
        String(i.status || "").toLowerCase().trim() === "pending" &&
        String(i.artist_email || "").trim().toLowerCase() === e
    );
  }, [invites, inviteEmail]);

  const pendingInviteIdForTypedEmail = useMemo(() => {
    const e = inviteEmail.trim().toLowerCase();
    if (!e) return null;
    const row = invites.find(
      (i) =>
        String(i.status || "").toLowerCase().trim() === "pending" &&
        String(i.artist_email || "").trim().toLowerCase() === e
    );
    return row?.id ?? null;
  }, [invites, inviteEmail]);

  const duplicateResendInviteId =
    pendingInviteIdForTypedEmail ?? inviteDuplicateFromApi?.inviteId ?? null;

  const duplicateInviteActive =
    hasDuplicatePendingInvite || inviteDuplicateFromApi !== null;

  const isAdmin = membershipRole === "admin";
  const canManageRepresentation =
    membershipRole === "admin" || membershipRole === "staff";

  useEffect(() => {
    if (!gallery?.id) {
      setDisputeFlags({ byInviteId: {}, byArtistId: {} });
      return;
    }
    const inviteIds = invites.map((i) => i.id).filter(Boolean);
    const artistIds = artists.map((a) => a.id).filter(Boolean);
    if (inviteIds.length === 0 && artistIds.length === 0) {
      setDisputeFlags({ byInviteId: {}, byArtistId: {} });
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/gallery/dispute-flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gallery_id: gallery.id,
            invite_ids: inviteIds,
            artist_ids: artistIds,
          }),
        });
        const data = (await res.json()) as {
          byInviteId?: Record<string, boolean>;
          byArtistId?: Record<string, boolean>;
        };
        if (cancelled) return;
        if (!res.ok) {
          setDisputeFlags({ byInviteId: {}, byArtistId: {} });
          return;
        }
        setDisputeFlags({
          byInviteId: data.byInviteId ?? {},
          byArtistId: data.byArtistId ?? {},
        });
      } catch {
        if (!cancelled) setDisputeFlags({ byInviteId: {}, byArtistId: {} });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gallery?.id, invites, artists]);

  const rosterTierByArtistId = useMemo(() => {
    const out: Record<string, ArtistTier> = {};
    const acceptedInv = invites.filter(
      (i) => String(i.status || "").toLowerCase() === "accepted"
    );
    for (const a of artists) {
      const inv =
        acceptedInv.find(
          (i) => (i.accepted_user_id || "").trim() === a.id
        ) ?? null;
      const base = getArtistTier(inv, {
        id: a.id,
        shown_on_institutional_public: a.shown_on_institutional_public,
      });
      const relD = inv?.id ? disputeFlags.byInviteId[inv.id] : false;
      const artD = disputeFlags.byArtistId[a.id];
      out[a.id] = withDisputeOverride(base, Boolean(relD || artD));
    }
    return out;
  }, [artists, invites, disputeFlags]);

  const registrationTrend = useMemo(
    () => insightPack?.artworkTrend.series.slice(-10) ?? [],
    [insightPack]
  );
  const maxRegistrationTrend = useMemo(
    () => Math.max(1, ...registrationTrend.map((p) => p.works)),
    [registrationTrend]
  );

  const valuePreviewLine = useMemo(() => {
    if (!insightPack?.valueTrend?.latestValues) return null;
    const lv = insightPack.valueTrend.latestValues;
    const keys = Object.keys(lv);
    if (keys.length === 0) return null;
    return keys
      .sort()
      .map((c) => formatCurrency(lv[c], c))
      .join(" · ");
  }, [insightPack]);

  const representedArtistOptions = useMemo(
    () =>
      artists
        .filter((a) => a.represented_by_gallery === true)
        .map((a) => ({
          id: a.id,
          label:
            a.display_name?.trim() || a.full_name?.trim() || t("gallery.fallback.artist"),
        })),
    [artists]
  );

  const scrollToArtistsSection = () => {
    setActiveSection("roster");
    window.setTimeout(() => {
      artistsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const openRegisterWorkspace = () => {
    setRegisterArtistId("");
    setRegisterCatalogueArtistName("");
    setRegisterPendingArtistEmail("");
    setProfileError(null);
    setShowRegisterModal(true);
  };

  const recordArtistInvite = async () => {
    if (!isAdmin) {
      setInviteError(t("gallery.toast.inviteRecordAdminOnly"));
      setInviteMessage(null);
      return;
    }
    if (!gallery?.id || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteMessage(null);
    setInviteError(null);
    setInvitePublishError(null);
    setInviteCopyDone(false);
    setInviteDuplicateFromApi(null);
    const trimmed = inviteEmail.trim().toLowerCase();

    let payload: {
      ok?: boolean;
      duplicate?: boolean;
      invite_id?: string;
      row?: GalleryInviteRow;
      emailSent?: boolean;
      emailDeliveryError?: string;
      error?: string;
    } = {};

    try {
      const res = await fetch("/api/gallery/send-artist-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gallery_id: gallery.id,
          artist_email: trimmed,
          lang: region.lang,
        }),
      });
      payload = (await res.json().catch(() => ({}))) as typeof payload;
      if (!res.ok) {
        if (res.status === 409 && payload.duplicate) {
          const id =
            typeof payload.invite_id === "string" ? payload.invite_id.trim() : "";
          if (id) {
            setInviteDuplicateFromApi({ inviteId: id });
            setInviteError(null);
          } else {
            setInviteDuplicateFromApi(null);
            setInviteError(t("gallery.toast.inviteDuplicateOnFile"));
          }
          setInviteMessage(null);
          return;
        }
        setInviteDuplicateFromApi(null);
        setInviteError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : fillMessage(t("gallery.toast.requestIncomplete"), { status: res.status })
        );
        return;
      }
    } catch {
      setInviteDuplicateFromApi(null);
      setInviteError(t("gallery.artworkAuth.networkError"));
      return;
    } finally {
      setInviting(false);
    }

    if (payload.row) {
      const r = payload.row as GalleryInviteRow & { visibility_status?: string | null };
      const row: GalleryInviteRow = {
        id: r.id,
        artist_email: r.artist_email,
        status: r.status,
        created_at: r.created_at,
        visibility_status: r.visibility_status ?? null,
        token_expires_at: (r as { token_expires_at?: string | null })
          .token_expires_at ?? null,
        accepted_user_id:
          (r as { accepted_user_id?: string | null }).accepted_user_id ?? null,
        invite_token: (r as { invite_token?: string | null }).invite_token ?? null,
      };
      setInvites((prev) => [row, ...prev]);
      setInviteDuplicateFromApi(null);
    }
    setInviteEmail("");
    setLastRecordedInviteEmail(trimmed);

    if (payload.emailDeliveryError) {
      setInviteMessage(
        fillMessage(t("gallery.toast.inviteOnFileWithDetail"), {
          email: trimmed,
          detail: payload.emailDeliveryError,
        })
      );
      return;
    }
    if (payload.emailSent) {
      setInviteMessage(
        fillMessage(t("gallery.toast.inviteSentTo"), { email: trimmed })
      );
      return;
    }
    setInviteMessage(
      fillMessage(t("gallery.toast.inviteRecordedNoEmail"), { email: trimmed })
    );
  };

  const resendArtworkAuthInvite = async (inviteId: string) => {
    if (!isAdmin) return;
    setResendingArtworkAuthInviteId(inviteId);
    setArtworkAuthInviteError(null);
    setArtworkAuthInviteMessage(null);
    try {
      const res = await fetch("/api/artwork-authentication/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invite_id: inviteId, lang: region.lang }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailDeliveryError?: string;
      };
      if (!res.ok) {
        setArtworkAuthInviteError(
          payload.error ||
            fillMessage(t("gallery.toast.couldNotResend"), { status: res.status })
        );
        return;
      }
      setArtworkAuthInviteMessage(
        payload.emailSent
          ? t("gallery.toast.artworkAuthResent")
          : payload.emailDeliveryError ||
              t("gallery.toast.artworkAuthRefreshedNoEmail")
      );
      await load();
    } catch {
      setArtworkAuthInviteError(t("gallery.artworkAuth.networkError"));
    } finally {
      setResendingArtworkAuthInviteId(null);
    }
  };

  const resendArtistInvite = async (inviteId: string) => {
    if (!isAdmin) return;
    setResendingInviteId(inviteId);
    setInviteError(null);
    setInviteMessage(null);
    setInvitePublishError(null);
    let payload: {
      ok?: boolean;
      row?: GalleryInviteRow;
      emailSent?: boolean;
      emailDeliveryError?: string;
      error?: string;
    } = {};
    try {
      const res = await fetch("/api/gallery/resend-artist-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId, lang: region.lang }),
      });
      payload = (await res.json().catch(() => ({}))) as typeof payload;
      if (!res.ok) {
        setInviteError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : fillMessage(t("gallery.toast.requestIncomplete"), { status: res.status })
        );
        return;
      }
    } catch {
      setInviteError(t("gallery.artworkAuth.networkError"));
      return;
    } finally {
      setResendingInviteId(null);
    }

    if (payload.row) {
      const r = payload.row as GalleryInviteRow & { visibility_status?: string | null };
      const row: GalleryInviteRow = {
        id: r.id,
        artist_email: r.artist_email,
        status: r.status,
        created_at: r.created_at,
        visibility_status: r.visibility_status ?? null,
        token_expires_at: (r as { token_expires_at?: string | null })
          .token_expires_at ?? null,
        accepted_user_id:
          (r as { accepted_user_id?: string | null }).accepted_user_id ?? null,
        invite_token: (r as { invite_token?: string | null }).invite_token ?? null,
      };
      let merged = row;
      try {
        const { data: tokRow } = await sb()
          .from("gallery_artist_invites")
          .select("invite_token")
          .eq("id", inviteId)
          .maybeSingle();
        const t = (tokRow as { invite_token?: string | null } | null)?.invite_token;
        if (t) merged = { ...row, invite_token: String(t) };
      } catch {
        // ignore
      }
      setInvites((prev) => prev.map((x) => (x.id === inviteId ? merged : x)));
    }

    setInviteDuplicateFromApi(null);

    if (payload.emailDeliveryError) {
      setInviteMessage(payload.emailDeliveryError);
      return;
    }
    if (payload.emailSent) {
      setInviteMessage(
        t("gallery.toast.inviteResentSignupLink")
      );
    } else {
      setInviteMessage(t("gallery.toast.inviteLinkRefreshedNoEmail"));
    }
  };

  const makeInvitePublic = async (inviteId: string) => {
    if (membershipRole !== "admin") return;
    setPublishingPublicInviteId(inviteId);
    setInvitePublishError(null);
    try {
      const res = await fetch("/api/invite/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_id: inviteId,
          visibility_status: "public",
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setInvitePublishError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : fillMessage(t("gallery.toast.couldNotPublish"), { status: res.status })
        );
        return;
      }
      setInvites((prev) =>
        prev.map((x) =>
          x.id === inviteId ? { ...x, visibility_status: "public" } : x
        )
      );
      setInviteMessage(t("gallery.toast.inviteVisibilityPublic"));
    } catch {
      setInvitePublishError(t("gallery.artworkAuth.networkError"));
    } finally {
      setPublishingPublicInviteId(null);
    }
  };

  const inviteEmailDraft = useMemo(() => {
    if (!gallery?.id) return "";
    const sample =
      inviteEmail.trim() ||
      lastRecordedInviteEmail?.trim() ||
      "artist@example.com";
    return buildArtistInviteEmailDraft({
      galleryName: gallery.name?.trim() || t("gallery.fallback.gallery"),
      artistEmail: sample,
      gallerySlug: gallery.slug,
      t,
    });
  }, [gallery?.id, gallery?.name, gallery?.slug, inviteEmail, lastRecordedInviteEmail, t]);

  const copyInviteDraft = async () => {
    if (!inviteEmailDraft) return;
    try {
      await navigator.clipboard.writeText(inviteEmailDraft);
      setInviteCopyDone(true);
      window.setTimeout(() => setInviteCopyDone(false), 2500);
    } catch {
      setInviteError(t("gallery.toast.copyFailed"));
    }
  };

  const handleGalleryRegisterArtwork = async () => {
    if (!userId || !gallery?.id) return;
    const linkedArtistId = registerArtistId.trim() || null;
    const catalogueName =
      linkedArtistId
        ? ""
        : registerCatalogueArtistName.trim();
    if (!newArtwork.title.trim()) return;
    if (!newArtwork.imageFile) {
      setProfileError(t("gallery.toast.imageRequired"));
      return;
    }
    if (!linkedArtistId && !catalogueName) {
      setProfileError(t("gallery.toast.artistNameRequired"));
      return;
    }
    setRegisterLoading(true);
    let imageUrl: string | null = null;
    try {
      const sha256Hex = async (input: string) => {
        const data = new TextEncoder().encode(input);
        const digest = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      };

      if (newArtwork.imageFile) {
        const fileExt = newArtwork.imageFile.name.split(".").pop();
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: upErr } = await sb().storage
          .from("artwork-images")
          .upload(fileName, newArtwork.imageFile);
        if (upErr) throw upErr;

        const { data } = sb().storage
          .from("artwork-images")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const registryId = `RROWM-${Date.now().toString(36).toUpperCase()}-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

      const metadataHash = await sha256Hex(
        JSON.stringify({
          gallery_id: gallery.id,
          artist_id: linkedArtistId,
          catalogue_artist_name: catalogueName,
          pending_artist_email: registerPendingArtistEmail.trim() || null,
          title: newArtwork.title,
          year: newArtwork.year,
          medium: newArtwork.medium,
          dimensions: newArtwork.dimensions,
          description: newArtwork.description,
          image_url: imageUrl,
          visibility_level: newArtwork.visibility_level,
        })
      );

      const regRes = await fetch("/api/representation/register-institution-artwork", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gallery_id: gallery.id,
          title: newArtwork.title,
          year: newArtwork.year || null,
          medium: newArtwork.medium || null,
          dimensions: newArtwork.dimensions || null,
          description: newArtwork.description || null,
          image_url: imageUrl,
          registry_id: registryId,
          metadata_hash: metadataHash,
          catalogue_artist_name: catalogueName || null,
          artist_id: linkedArtistId,
          pending_artist_email: registerPendingArtistEmail.trim() || null,
          declared_value: newArtwork.declared_value || null,
          currency: newArtwork.currency || null,
          value_type: newArtwork.value_type || "initial_valuation",
          visibility_level: newArtwork.visibility_level,
        }),
      });
      const regBody = (await regRes.json().catch(() => ({}))) as {
        ok?: boolean;
        artwork_id?: string | null;
        artwork?: { id?: string } | null;
        error?: string;
      };
      if (!regRes.ok) {
        throw new Error(
          regBody.error ||
            `Registration failed (${regRes.status}). Apply Supabase migrations 20260513120000 and 20260513140000 if this persists.`
        );
      }

      let artworkIdForValue: string | null =
        regBody.artwork_id?.trim() ||
        (regBody.artwork && typeof regBody.artwork === "object"
          ? String(regBody.artwork.id ?? "").trim() || null
          : null);

      if (!artworkIdForValue) {
        const { data: latestArtworks } = await sb()
          .from("artworks")
          .select("id")
          .eq("registry_id", registryId)
          .limit(1);
        artworkIdForValue = latestArtworks?.[0]?.id ?? null;
      }

      const institutionFilingOk = true;
      const institutionFilingError: string | null = null;

      const selectedArtist = linkedArtistId
        ? artists.find((a) => a.id === linkedArtistId)
        : null;

      setShowRegisterModal(false);
      setProfileError(null);
      setSuccessMessage(null);
      setLastRegistration({
        title: newArtwork.title.trim() || t("gallery.fallback.untitled"),
        registryId,
        artworkId: artworkIdForValue,
        institutionFilingOk,
        institutionFilingError,
        artistName:
          selectedArtist?.display_name?.trim() ||
          selectedArtist?.full_name?.trim() ||
          catalogueName ||
          null,
        pendingArtistEmail: registerPendingArtistEmail.trim() || null,
        artistAccountLinked: Boolean(linkedArtistId),
        imageUrl,
        catalogueArtistName: catalogueName || null,
      });
      setRegisterArtistId("");
      setRegisterCatalogueArtistName("");
      setRegisterPendingArtistEmail("");
      setNewArtwork({
        title: "",
        year: "",
        medium: "",
        dimensions: "",
        description: "",
        visibility_level: "private",
        imageFile: null,
        declared_value: "",
        currency: "",
        value_type: "initial_valuation",
      });
      await load();
    } catch (e) {
      const detail = formatRegisterFailure(e, t);
      console.error("[gallery register]", detail);
      setProfileError(detail);
    }
    setRegisterLoading(false);
  };

  const saveProfile = async () => {
    if (!isAdmin) {
      setProfileError(t("gallery.toast.profileAdminOnly"));
      return;
    }
    if (!gallery?.id || !userId) return;
    setSavingProfile(true);
    setProfileError(null);
    const { error } = await sb()
      .from("galleries")
      .update({
        location: draft.location.trim() || null,
        description: draft.description.trim() || null,
        website_url: draft.website_url.trim() || null,
      })
      .eq("id", gallery.id);
    setSavingProfile(false);
    if (error) {
      setProfileError(error.message || t("gallery.toast.profileSaveFailed"));
      return;
    }
    await load();
  };

  const confirmVerifyArtwork = async () => {
    const artworkId = verifyTarget?.id;
    if (!gallery?.verified || !artworkId) return;
    setVerifyBusy(artworkId);
    setProfileError(null);
    const res = await fetch("/api/registry/verify-artwork", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ artwork_id: artworkId }),
    });
    const payload = (await res.json()) as { error?: string };
    setVerifyBusy(null);
    if (!res.ok) {
      setProfileError(payload.error || t("gallery.toast.verifyFailed"));
      return;
    }
    setVerifyTarget(null);
    setSuccessMessage(t("gallery.toast.verifySuccess"));
    triggerConsequenceFeedback("sealCommit");
    await load();
  };

  const openInsight = async (kind: "works" | "value" | "health") => {
    if (!userId) return;
    setInsightOpen(kind);
    setInsightLoading(true);
    setInsightData([]);
    setInsightLines([]);
    setInsightBreakdown([]);
    setInsightDataNotes([]);

    const artworkIds = artworks.map((a) => a.id).filter(Boolean);
    try {
      const insights =
        insightPack && artworkIds.length > 0
          ? insightPack
          : await getDashboardInsights({ supabase: sb(), userId, artworkIds });

      if (kind === "works") {
        const { series } = insights.artworkTrend;
        const cat = insights.catalogue;
        setInsightKind("line");
        setInsightTitle(t("studio.insight.title.worksGallery"));
        setInsightSubtitle(
          translateRoleInsight(
            "gallery",
            {
              artworkTrend: insights.artworkTrend,
              catalogue: cat,
            },
            t
          )
        );
        setInsightLines([
          { key: "works", label: t("studio.insight.line.worksGallery") },
        ]);
        setInsightData(series);
        setInsightBreakdown([
          { label: t("studio.insight.breakdown.totalWorks"), value: String(cat.totalWorks) },
          { label: t("studio.insight.breakdown.unique"), value: String(cat.uniqueWorks) },
          { label: t("studio.insight.breakdown.editions"), value: String(cat.editionWorks) },
          ...(cat.mostActivePeriod
            ? [
                {
                  label: t("studio.insight.breakdown.peakPeriod"),
                  value: cat.mostActivePeriod,
                },
              ]
            : []),
        ]);
        return;
      }

      if (kind === "health") {
        const h = insights.health;
        const healthBreakdown = buildHealthInsightBreakdown({
          health: h,
          role: "gallery",
          t,
        });
        setInsightKind("bar");
        setInsightTitle(t("studio.insight.title.health"));
        setInsightSubtitle(translateRoleInsight("gallery", { health: h }, t));
        setInsightData([
          {
            month: translateInsightBarCategory("fullyVerified", t),
            events: h.fullyVerified,
          },
          {
            month: translateInsightBarCategory("certified", t),
            events: h.withCertificates,
          },
          {
            month: translateInsightBarCategory("incomplete", t),
            events: h.missingVerification,
          },
        ]);
        setInsightBreakdown(healthBreakdown.breakdown);
        setInsightDataNotes(healthBreakdown.dataNotes);
        return;
      }

      const metrics =
        catalogueMetrics ??
        (await fetchStudioCatalogueMetrics(sb(), {
          role: "gallery",
          userId,
          artworks: artworks.map((row) => ({
            id: row.id,
            title: row.title,
            created_at: row.created_at,
          })),
        }));
      if (!catalogueMetrics) setCatalogueMetrics(metrics);

      const { series, currencies } = insights.valueTrend;
      const valueBreakdown = buildValueInsightBreakdown({
        role: "gallery",
        metrics,
        latestValues: insights.valueTrend.latestValues,
        t,
        formatCurrency,
      });
      setInsightKind("line");
      setInsightTitle(t("studio.insight.title.valueGallery"));
      setInsightSubtitle(
        translateRoleInsight("gallery", { valueTrend: insights.valueTrend }, t)
      );
      setInsightLines(currencies.map((c) => ({ key: c, label: c })));
      setInsightData(series);
      setInsightBreakdown(valueBreakdown.breakdown);
      setInsightDataNotes(valueBreakdown.dataNotes);
    } catch {
      setInsightSubtitle(t("studio.insight.loadFailed"));
    } finally {
      setInsightLoading(false);
    }
  };

  const selectGallerySection = useCallback(
    (id: string) => {
      const allowed = new Set([
        "studio",
        "record-depth",
        "roster",
        "invitations",
        "catalogue",
        "verification",
        "opportunities",
      ]);
      if (!allowed.has(id)) return;
      if (id === activeSection) return;
      setIsTransitioningSection(true);
      window.setTimeout(() => {
        setActiveSection(
          id as
            | "studio"
            | "record-depth"
            | "roster"
            | "invitations"
            | "catalogue"
            | "verification"
            | "opportunities"
        );
        setIsTransitioningSection(false);
      }, 180);
    },
    [activeSection]
  );

  const goToRecordDepthSection = useCallback(
    (scrollTargetId?: string) => {
      selectGallerySection("record-depth");
      if (!scrollTargetId || typeof document === "undefined") return;
      window.setTimeout(() => {
        document
          .getElementById(scrollTargetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 220);
    },
    [selectGallerySection]
  );

  const scrollToGalleryAmendments = useCallback(() => {
    goToRecordDepthSection("gallery-representation-amendments");
  }, [goToRecordDepthSection]);

  const goToInvitationsSection = useCallback(
    (prefillEmail?: string) => {
      if (prefillEmail?.trim()) {
        setInviteEmail(prefillEmail.trim().toLowerCase());
      }
      selectGallerySection("invitations");
      window.setTimeout(() => {
        inviteSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 220);
    },
    [selectGallerySection]
  );

  const authenticatedAuthInviteArtworkIds = useMemo(
    () => authenticatedArtworkAuthInviteIds(artworkAuthInvites),
    [artworkAuthInvites]
  );

  const pendingAuthInviteByArtworkId = useMemo(
    () => pendingArtworkAuthInviteByArtworkId(artworkAuthInvites),
    [artworkAuthInvites]
  );

  const openArtworkAuthInviteForWork = useCallback(
    (artworkId: string, prefillEmail?: string) => {
      const w = artworks.find((a) => a.id === artworkId);
      if (!w) return;
      const email =
        prefillEmail?.trim() ||
        w.pending_artist_email?.trim() ||
        pendingAuthInviteByArtworkId.get(artworkId)?.artist_email?.trim() ||
        "";
      setAuthInvitePrefillEmail(email);
      setAuthInviteTarget({
        id: w.id,
        title: w.title,
        registry_id: w.registry_id,
        image_url: w.image_url,
        catalogue_artist_name: w.catalogue_artist_name,
        artist_id: w.artist_id,
      });
    },
    [artworks, pendingAuthInviteByArtworkId]
  );

  const openArtworkAuthInviteFromRegistration = useCallback(() => {
    if (!lastRegistration?.artworkId) return;
    const id = lastRegistration.artworkId;
    const w = artworks.find((a) => a.id === id);
    if (w) {
      openArtworkAuthInviteForWork(
        id,
        lastRegistration.pendingArtistEmail?.trim() || undefined
      );
      return;
    }
    setAuthInvitePrefillEmail(lastRegistration.pendingArtistEmail?.trim() || "");
    setAuthInviteTarget({
      id,
      title: lastRegistration.title,
      registry_id: lastRegistration.registryId,
      image_url: lastRegistration.imageUrl ?? null,
      catalogue_artist_name: lastRegistration.catalogueArtistName ?? null,
      artist_id: null,
    });
  }, [artworks, lastRegistration, openArtworkAuthInviteForWork]);

  const openVerifyFromIntegrity = useCallback(
    (artworkId: string) => {
      const target = artworks.find((a) => a.id === artworkId) ?? null;
      if (!target) return;
      selectGallerySection("verification");
      window.setTimeout(() => {
        verificationSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setVerifyTarget(target);
      }, 220);
    },
    [artworks, selectGallerySection]
  );

  const issueCertificateFromIntegrity = useCallback(
    async (artworkId: string) => {
      setProfileError(null);
      setSuccessMessage(null);
      try {
        const { fetchRegistryCsrfToken } = await import(
          "@/lib/registry-action-security/fetch-csrf"
        );
        const csrfToken = await fetchRegistryCsrfToken();
        if (!csrfToken) {
          setProfileError(t("gallery.toast.certificateFailed"));
          return;
        }
        const res = await fetch("/api/issue-certificate", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ artwork_id: artworkId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg =
            typeof body?.error === "string" && body.error.trim()
              ? body.error.trim()
              : t("gallery.toast.certificateFailed");
          setProfileError(msg);
          return;
        }
        const body = await res.json().catch(() => ({}));
        const created = Boolean(body?.created);
        setSuccessMessage(
          created
            ? t("gallery.toast.certificateFiled")
            : t("gallery.toast.certificateAlreadyOnFile")
        );
        triggerConsequenceFeedback("sealCommit");
        await load();
      } catch {
        setProfileError(t("gallery.toast.certificateRetryFailed"));
      }
    },
    [load, t]
  );

  const participationAttention =
    (representationSummary?.participation_pending ?? 0) > 0 ||
    (representationSummary?.amendments_pending ?? 0) > 0;

  const galleryNavItems = useMemo(
    () =>
      buildOrganisationNavItems(t, {
        participationAttention,
        verificationQueueActive:
          Boolean(gallery?.verified) && verifyQueue.length > 0,
        pendingInviteCount,
      }),
    [
      pendingInviteCount,
      gallery?.verified,
      verifyQueue.length,
      participationAttention,
      t,
    ]
  );

  const sidebarActivityNode = userId ? (
    <WorkspaceSidebarActivityFeed
      userId={userId}
      variant="compact"
      refreshKey={activityRefreshKey}
      emptyMessage={t("gallery.shell.noCatalogueActivity")}
    />
  ) : null;

  const priorityQueue = useMemo(() => {
    if (!gallery || artworks.length === 0) return [];
    const galleryIsVerified = Boolean(gallery.verified);
    const items = artworks.map((a) =>
      computeArtworkPriorityQueueItem({
        artwork: a,
        signals: {
          galleryIsVerified,
          ownershipEventCount:
            integrityContext.ownershipEventCountByArtworkId[a.id] ?? 0,
          ownershipLastToUserId:
            integrityContext.ownershipLastToUserIdByArtworkId[a.id] ?? null,
          hasAnyValueEvent: Boolean(
            integrityContext.hasAnyValueEventByArtworkId[a.id]
          ),
          maxDeclaredValue:
            integrityContext.maxDeclaredValueByArtworkId[a.id]?.value ?? null,
          maxDeclaredValueCurrency:
            integrityContext.maxDeclaredValueByArtworkId[a.id]?.currency ?? null,
          hasGalleryVerification: Boolean(
            integrityContext.hasGalleryVerificationByArtworkId[a.id]
          ),
          hasLiveCertificate: Boolean(
            integrityContext.hasLiveCertificateByArtworkId[a.id]
          ),
          hasRevokedCertificate: Boolean(
            integrityContext.hasRevokedCertificateByArtworkId[a.id]
          ),
          isListed: Boolean(integrityContext.isListedByArtworkId[a.id]),
          lastActivityAt: integrityContext.lastActivityAtByArtworkId[a.id] ?? null,
          artworkCreatedAt: (a as any).created_at ?? null,
        },
      })
    );
    return sortPriorityQueue(items);
  }, [artworks, gallery, integrityContext]);

  if (loading) {
    return (
      <div className="ds-page-environment min-h-screen pt-24 text-center text-sm text-neutral-500">
        {t("gallery.shell.loading")}
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (!gallery) {
    return (
      <div className="ds-page-environment min-h-screen px-6 pt-24 text-neutral-800">
        <main className="mx-auto max-w-lg">
          <TestDataControls />
          <p className="font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
            {t("gallery.empty.createProfile")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {t("gallery.empty.createProfileBody")}
          </p>
          {profileError ? (
            <p className="mt-4 text-sm text-red-800">{profileError}</p>
          ) : null}
          <Link
            href="/onboarding?focus=gallery"
            className="mt-10 inline-block border-b border-neutral-900 pb-1 text-sm font-medium text-neutral-900 transition hover:opacity-70"
          >
            {t("gallery.empty.continueOnboarding")}
          </Link>
        </main>
      </div>
    );
  }

  const orgName = gallery.name?.trim() || t("gallery.fallback.gallery");
  const worksCount = artworks.length;
  const verifiedWorksCount = artworks.filter(
    (w) => w.verification_status === "verified"
  ).length;
  const awaitingVerificationCount = verifyQueue.length;
  const verificationPct =
    worksCount > 0 ? Math.round((verifiedWorksCount / worksCount) * 100) : 0;
  const certificatesIssued =
    insightPack?.health.withCertificates ??
    Object.values(integrityContext.hasLiveCertificateByArtworkId).filter(Boolean)
      .length;
  const activeDeals =
    (representationSummary?.participation_pending ?? 0) +
    (representationSummary?.amendments_pending ?? 0);

  const identityLocation = gallery.location?.trim() || "";

  return (
    <>
      <WelcomeModal role="gallery" steps={galleryIntroSteps} />
      <StudioShell
        role="gallery"
        userId={userId}
        atmosphereClassName="ds-workspace-environment"
        navItems={galleryNavItems}
        activeId={activeSection}
        onSelect={selectGallerySection}
        isTransitioning={isTransitioningSection}
        sidebarActivity={sidebarActivityNode}
        activityHeading={t("studio.shell.catalogueActivity")}
      >
        {activeSection === "studio" ? (
          <>
            <TestDataControls />

            <div className={`max-w-6xl pb-8 ${studioOverviewStackClass}`}>
          <StudioRoleBand
            role="organisation"
            {...studioRoleBandCopy("organisation", t)}
            metrics={[
              {
                label: t("studio.overview.worksRepresented"),
                value: worksCount,
              },
              {
                label: t("gallery.hero.worksVerified"),
                value: verifiedWorksCount,
              },
              {
                label: t("gallery.hero.verificationPending"),
                value: awaitingVerificationCount,
              },
            ]}
          />
          <GalleryInstitutionalHero
            orgName={orgName}
            slug={gallery.slug}
            verified={gallery.verified}
            location={identityLocation || null}
            subscriptionStatus={gallery.subscription_status}
            artworks={artworks}
            worksOnFile={worksCount}
            verifiedWorks={verifiedWorksCount}
            pendingVerification={awaitingVerificationCount}
            artistsRepresented={artists.length}
            certificatesIssued={certificatesIssued}
            activeDeals={activeDeals}
            participationPendingCount={
              representationSummary?.participation_pending ?? 0
            }
            amendmentsPendingCount={
              representationSummary?.amendments_pending ?? 0
            }
            onGoToSection={selectGallerySection}
            onRegister={openRegisterWorkspace}
            onInvite={goToInvitationsSection}
            isAdmin={isAdmin}
            onAboutWorkspace={() => setWorkspaceGuideOpen(true)}
            onGoToAmendments={scrollToGalleryAmendments}
          />

          <OrganisationVerificationCommand
            galleryVerified={gallery.verified}
            verifyQueue={verifyQueue}
            verifyBusy={verifyBusy}
            artistNameById={artistNameById}
            hasLiveCertificateByArtworkId={
              integrityContext.hasLiveCertificateByArtworkId
            }
            hasRevokedCertificateByArtworkId={
              integrityContext.hasRevokedCertificateByArtworkId
            }
            onReview={(id) => {
              const target = artworks.find((a) => a.id === id);
              if (target) setVerifyTarget(target);
            }}
            onVerify={(id) => {
              const target = artworks.find((a) => a.id === id);
              if (target) setVerifyTarget(target);
            }}
            onRequestAmendment={scrollToGalleryAmendments}
            maxVisible={5}
            onViewAll={() => selectGallerySection("verification")}
          />

        {profileError ? (
          <p className="text-[13px] text-red-800">{profileError}</p>
        ) : null}
        {successMessage ? (
          <p className="text-[13px] text-emerald-900/90">
            {successMessage}{" "}
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="font-medium underline underline-offset-4"
            >
              {t("gallery.shell.dismiss")}
            </button>
          </p>
        ) : null}
        {lastRegistration ? (
          <GalleryRegistrationOutcome
            data={lastRegistration}
            isAdmin={isAdmin}
            onDismiss={() => setLastRegistration(null)}
            onSendAuthenticationInvite={openArtworkAuthInviteFromRegistration}
            onViewRecordDepth={() => goToRecordDepthSection()}
            onViewWork={() => selectGallerySection("catalogue")}
          />
        ) : null}

        <StudioContentSlab
          className="studio-reveal opacity-[0.97]"
          title={t("gallery.intelligence.title")}
          actions={
            insightLoading ? (
              <span className="text-[11px] text-neutral-400">
                {t("gallery.intelligence.syncing")}
              </span>
            ) : null
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StudioInsightTile
              label={t("gallery.intelligence.registrationPace")}
              onClick={() => void openInsight("works")}
              disabled={worksCount === 0}
              footer={t("gallery.intelligence.tapCatalogueDetail")}
            >
              <p className="font-serif text-3xl tabular-nums leading-none text-neutral-950">
                {worksCount}
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">
                {t("gallery.intelligence.worksRegistered")}
              </p>
              {registrationTrend.length === 0 ? (
                <div className="mt-4 min-h-12">
                  <span className="text-[11px] leading-snug text-neutral-400">
                    {t("gallery.intelligence.addWorksTrend")}
                  </span>
                </div>
              ) : (
                <RrowmMiniBarChart
                  className="mt-4 border-t border-neutral-900/[0.06] pt-3"
                  trackClassName="h-12"
                  minHeightPercent={12}
                  heightsPercent={registrationTrend.map(
                    (p) => (p.works / maxRegistrationTrend) * 100
                  )}
                />
              )}
            </StudioInsightTile>

            <StudioInsightTile
              label={t("gallery.intelligence.declaredValue")}
              onClick={() => void openInsight("value")}
              disabled={worksCount === 0}
              footer={t("gallery.intelligence.multiCurrencyTap")}
            >
              <p className="line-clamp-4 text-[13px] leading-relaxed text-neutral-700">
                {valuePreviewLine ?? (
                  <span className="text-neutral-400">
                    {t("gallery.intelligence.noDeclaredValues")}
                  </span>
                )}
              </p>
            </StudioInsightTile>

            <StudioInsightTile
              label={t("gallery.intelligence.recordHealth")}
              onClick={() => void openInsight("health")}
              disabled={worksCount === 0}
              footer={t("gallery.intelligence.certificatesAndGaps")}
            >
              {insightPack ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-serif text-xl tabular-nums text-neutral-950">
                      {insightPack.health.fullyVerified}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-neutral-600">
                      {t("studio.insight.bar.fullyVerified")}
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-xl tabular-nums text-neutral-950">
                      {insightPack.health.withCertificates}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-neutral-600">
                      {t("studio.insight.bar.certified")}
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-xl tabular-nums text-amber-900/90">
                      {insightPack.health.missingVerification}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-neutral-600">
                      {t("gallery.intelligence.gaps")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-neutral-400">
                  {worksCount === 0
                    ? t("gallery.intelligence.noData")
                    : t("gallery.intelligence.loadingBreakdown")}
                </p>
              )}
            </StudioInsightTile>

            <StudioInsightTile
              label={t("gallery.hero.institutionalVerification")}
              onClick={() => setActiveSection("verification")}
              footer={t("gallery.intelligence.openVerification")}
            >
              <p className="font-serif text-3xl tabular-nums leading-none text-neutral-950">
                {verificationPct}
                <span className="text-lg text-neutral-400">%</span>
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">
                {t("gallery.intelligence.ofCatalogueVerified")}
              </p>
              {gallery.verified && awaitingVerificationCount > 0 ? (
                <p className="mt-3 text-[12px] font-medium text-amber-900/90">
                  {fillMessage(t("gallery.intelligence.recordsNotVerified"), {
                    count: String(awaitingVerificationCount),
                  })}
                </p>
              ) : !gallery.verified ? (
                <p className="mt-3 text-[12px] text-neutral-500">
                  {t("gallery.intelligence.galleryVerificationPending")}
                </p>
              ) : (
                <p className="mt-3 text-[12px] text-neutral-400">
                  {t("gallery.intelligence.queueClear")}
                </p>
              )}
            </StudioInsightTile>
          </div>
        </StudioContentSlab>

        <div className="studio-reveal opacity-[0.96]">
        <StudioCatalogueMetricsPanels
          role="gallery"
          metrics={catalogueMetrics}
          onOpenValueInsight={() => void openInsight("value")}
        />

        <StudioContentSlab compact headerless title="" className="opacity-95">
          <div className="flex flex-col gap-1.5 text-[13px] leading-snug text-neutral-600 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-1">
            <p className="tabular-nums">
              {fillMessage(t("gallery.summary.representedWorks"), {
                artists: String(artists.length),
                works: String(worksCount),
              })}
              {verifiedWorksCount > 0
                ? fillMessage(t("gallery.summary.verifiedSuffix"), {
                    count: String(verifiedWorksCount),
                  })
                : null}
            </p>
            {latestActivityLine ? (
              <p className="text-[12px] text-neutral-500 sm:border-l sm:border-neutral-900/10 sm:pl-6">
                {latestActivityLine}
              </p>
            ) : (
              <p className="text-[12px] text-neutral-400 sm:border-l sm:border-neutral-900/10 sm:pl-6">
                {t("gallery.summary.noRecentActivity")}
              </p>
            )}
          </div>
        </StudioContentSlab>
        </div>
            </div>
          </>
        ) : null}

        {activeSection === "record-depth" ? (
          <div className="max-w-6xl space-y-10 pb-8">
            <GalleryParticipationPendingSection
              items={participationPendingWorks}
              onGoToInvitations={goToInvitationsSection}
              isAdmin={isAdmin}
              onInviteWork={(artworkId) => openArtworkAuthInviteForWork(artworkId)}
            />
            <RepresentationAmendmentsSection
              viewer="gallery"
              anchorId="gallery-representation-amendments"
              items={representationAmendments}
              artworkOptions={amendmentArtworkOptions}
              artistNamesById={artistNamesByIdRecord}
              showRequestButton={
                membershipRole === "admin" || membershipRole === "staff"
              }
              busyAmendmentId={amendmentBusyId}
              onRequest={submitGalleryAmendmentRequest}
              onResolve={resolveAmendment}
              onWithdraw={withdrawAmendment}
            />
            {representationAmendments.length === 0 &&
            (representationSummary?.participation_pending ?? 0) === 0 ? (
              <p className="text-sm leading-relaxed text-neutral-500">
                {t("gallery.recordDepth.empty")}
              </p>
            ) : null}
          </div>
        ) : null}

        {activeSection === "roster" ? (
          <section
            ref={artistsSectionRef}
            id="gallery-represented-artists"
            className="studio-reveal scroll-mt-20 max-w-6xl opacity-[0.96]"
          >
            <div className={`${studioV2.surface.filingSheet} overflow-hidden`}>
              <div className="border-b border-[var(--v2-border)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <InfoTooltip text={t("gallery.roster.tooltip")} />
                    <h2 className="font-serif text-[1.35rem] font-normal text-neutral-950 md:text-[1.75rem]">
                      {t(ORGANISATION_SECTION_LABEL_KEYS.roster)}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-neutral-900/[0.06] bg-white/70 px-3 py-1 text-[12px] tabular-nums text-neutral-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                    <span className="font-semibold text-neutral-900">{artists.length}</span>
                    <span className="ml-1.5 text-neutral-500">
                      {artists.length === 1
                        ? t("gallery.roster.artist")
                        : t("gallery.roster.artists")}
                    </span>
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {artists.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-neutral-900/15 bg-gradient-to-br from-neutral-50/80 via-white/55 to-white/40 px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <p className="font-serif text-lg text-neutral-900">
                      {t("gallery.roster.noArtists")}
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-neutral-600">
                      {t("gallery.roster.noArtistsBody")}
                    </p>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => goToInvitationsSection()}
                        className="mt-8 inline-flex items-center rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-neutral-900/20 transition hover:bg-neutral-800"
                      >
                        {t("gallery.roster.goToInvitations")}
                      </button>
                    ) : (
                      <p className="mt-6 text-[13px] text-neutral-500">
                        {t("gallery.roster.askAdmin")}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {artists.map((a) => {
                        const name =
                          a.display_name?.trim() || a.full_name?.trim() || t("gallery.fallback.artist");
                        const worksN = worksCountByArtistId.get(a.id) ?? 0;
                        const represented =
                          a.represented_by_gallery === true;
                        const historical =
                          !represented && historicalArtistIds.has(a.id);
                        const initial = name.trim().charAt(0).toUpperCase() || "?";
                        return (
                          <li key={a.id}>
                            <div className="group flex gap-4 rounded-xl border border-neutral-900/[0.06] bg-white/50 p-4 transition hover:border-neutral-900/12 hover:bg-white/90 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] sm:items-center sm:justify-between sm:p-5">
                              <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
                                <div
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200/80 font-serif text-lg font-normal text-neutral-600 ring-1 ring-black/[0.05]"
                                  aria-hidden
                                >
                                  {initial}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium leading-snug text-neutral-950">
                                    {name}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    {a.slug ? (
                                      <Link
                                        href={`/artist/${a.slug}`}
                                        className="text-[12px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900"
                                      >
                                        {t("gallery.roster.viewPublicProfile")}
                                      </Link>
                                    ) : (
                                      <span className="text-[12px] text-neutral-400">
                                        {t("gallery.roster.noPublicProfile")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                    represented
                                      ? "bg-emerald-500/12 text-emerald-900"
                                      : historical
                                        ? "bg-neutral-500/12 text-neutral-700"
                                        : "bg-amber-500/12 text-amber-950/90"
                                  }`}
                                >
                                  {represented
                                    ? t("gallery.representation.represented")
                                    : historical
                                      ? t("gallery.representation.historical")
                                      : t("gallery.representation.pending")}
                                </span>
                                {represented && canManageRepresentation ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEndRepTarget({ id: a.id, name })
                                    }
                                    className="rounded-lg border border-neutral-900/[0.1] bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 transition hover:bg-neutral-50"
                                  >
                                    End on file
                                  </button>
                                ) : null}
                                <ArtistTierBadge
                                  tier={rosterTierByArtistId[a.id] ?? "unverified"}
                                />
                                {rosterTierByArtistId[a.id] === "disputed" ? (
                                  <span className="max-w-[10rem] text-[10px] leading-snug text-neutral-600">
                                    Under review
                                  </span>
                                ) : null}
                                <span className="tabular-nums text-[12px] text-neutral-500">
                                  {worksN > 0
                                    ? `${worksN} ${worksN === 1 ? "work" : "works"}`
                                    : "–"}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === "invitations" ? (
          <GalleryInvitationsHub
            galleryName={orgName}
            registrySiteUrl={getSiteUrl()}
            representationInvites={invites}
            artworkAuthInvites={artworkAuthInvites}
            isAdmin={isAdmin}
            inviteEmail={inviteEmail}
            onInviteEmailChange={(v) => {
              setInviteEmail(v);
              setLastRecordedInviteEmail(null);
              setInviteError(null);
              setInviteMessage(null);
              setInviteDuplicateFromApi(null);
            }}
            inviting={inviting}
            onSendRepresentationInvite={() => void recordArtistInvite()}
            resendingRepresentationId={resendingInviteId}
            onResendRepresentationInvite={(id) => void resendArtistInvite(id)}
            resendingArtworkAuthId={resendingArtworkAuthInviteId}
            onResendArtworkAuthInvite={(id) => void resendArtworkAuthInvite(id)}
            inviteError={inviteError}
            inviteMessage={inviteMessage}
            artworkInviteMessage={artworkAuthInviteMessage}
            artworkInviteError={artworkAuthInviteError}
            duplicateInviteActive={duplicateInviteActive}
            duplicateResendInviteId={duplicateResendInviteId}
            manualDraft={inviteEmailDraft}
            manualDraftCopyDone={inviteCopyDone}
            onCopyManualDraft={() => void copyInviteDraft()}
            sectionRef={inviteSectionRef}
            publishingPublicInviteId={publishingPublicInviteId}
            onMakeInvitePublic={(id) => void makeInvitePublic(id)}
            invitePublishError={invitePublishError}
          />
        ) : null}

        {activeSection === "catalogue" ? (
          <div className="studio-reveal max-w-6xl opacity-[0.96]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <InfoTooltip text={t("gallery.catalogue.tooltip")} />
                <h2 className="font-serif text-[1.35rem] font-normal text-neutral-950 md:text-[1.75rem]">
                  {t(ORGANISATION_SECTION_LABEL_KEYS.catalogue)}
                </h2>
              </div>
              <button
                type="button"
                onClick={openRegisterWorkspace}
                className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {t("gallery.catalogue.registerWork")}
              </button>
            </div>
            <PriorityQueueSection
              items={priorityQueue}
              maxVisible={8}
              onGoToRoster={() => {
                selectGallerySection("roster");
                window.setTimeout(() => {
                  artistsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 220);
              }}
              onVerifyArtwork={openVerifyFromIntegrity}
              onIssueCertificate={(artworkId) =>
                void issueCertificateFromIntegrity(artworkId)
              }
            />
            <RecordIntegritySection
              artworks={artworks}
              galleryIsVerified={Boolean(gallery?.verified)}
              ownershipEventCountByArtworkId={
                integrityContext.ownershipEventCountByArtworkId
              }
              ownershipLastToUserIdByArtworkId={
                integrityContext.ownershipLastToUserIdByArtworkId
              }
              hasAnyValueEventByArtworkId={
                integrityContext.hasAnyValueEventByArtworkId
              }
              hasGalleryVerificationByArtworkId={
                integrityContext.hasGalleryVerificationByArtworkId
              }
              hasLiveCertificateByArtworkId={
                integrityContext.hasLiveCertificateByArtworkId
              }
              hasRevokedCertificateByArtworkId={
                integrityContext.hasRevokedCertificateByArtworkId
              }
              onGoToRoster={() => {
                selectGallerySection("roster");
                window.setTimeout(() => {
                  artistsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 220);
              }}
              onVerifyArtwork={openVerifyFromIntegrity}
              onIssueCertificate={(artworkId) => void issueCertificateFromIntegrity(artworkId)}
            />
            <RecordReadinessSection
              artworks={artworks}
              ownershipByArtworkId={readinessContext.ownershipByArtworkId}
              hasDeclaredValueByArtworkId={
                readinessContext.hasDeclaredValueByArtworkId
              }
              onGoToRoster={() => {
                selectGallerySection("roster");
                window.setTimeout(() => {
                  artistsSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 220);
              }}
            />
            <section className="rounded-2xl border border-neutral-900/[0.05] bg-white/40 p-6 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-sm sm:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
                  {t("gallery.catalogue.registeredWorks")}
                </h2>
                {worksCount > 0 ? (
                  <span className="text-[11px] tabular-nums text-neutral-400">
                    {fillMessage(t("gallery.catalogue.inCatalogue"), {
                      count: String(worksCount),
                    })}
                  </span>
                ) : null}
              </div>
              {artworks.length === 0 ? (
                <p className="mt-4 text-[13px] text-neutral-500">
                  {t("gallery.catalogue.empty")}
                </p>
              ) : (
                <ul className="mt-6 max-h-[min(70vh,36rem)] divide-y divide-neutral-900/[0.05] overflow-y-auto pr-1">
                  {artworks.map((w) => {
                    const linkedName = w.artist_id
                      ? artistNameById.get(w.artist_id)
                      : null;
                    const artistLabel =
                      linkedName ||
                      (w.catalogue_artist_name?.trim() || t("gallery.catalogue.artistOnFile"));
                    const authInviteComplete = authenticatedAuthInviteArtworkIds.has(
                      w.id
                    );
                    const needsAuthInvite =
                      isAdmin &&
                      artworkNeedsAuthenticationInvite(
                        w.id,
                        artworkIdsAwaitingArtistAttestation,
                        authenticatedAuthInviteArtworkIds
                      );
                    const pendingAuthInvite = pendingAuthInviteByArtworkId.get(
                      w.id
                    );
                    const artistAuthLabel = authInviteComplete
                      ? t("gallery.catalogue.artistAttestationOnFile")
                      : w.artist_id
                        ? t("gallery.catalogue.artistAttestationMayDeepen")
                        : t("gallery.catalogue.artistAttestationNotYetOnFile");
                    const verified =
                      String(w.verification_status || "").toLowerCase() === "verified";
                    const statusLabel = verified
                      ? t("gallery.catalogue.verified")
                      : t("gallery.catalogue.onFile");
                    return (
                      <li
                        key={w.id}
                        className="group flex gap-3 py-3.5 first:pt-0 transition-colors hover:bg-white/35"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-neutral-100 to-neutral-200/80 ring-1 ring-black/[0.04]">
                          {w.image_url ? (
                            <img
                              src={w.image_url}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={
                              w.registry_id
                                ? `/registry/${encodeURIComponent(w.registry_id)}`
                                : "#"
                            }
                            className="text-[14px] font-medium text-neutral-950 underline decoration-neutral-200/90 underline-offset-2 transition hover:decoration-neutral-500"
                          >
                            {(w.title || "").trim() || t("gallery.fallback.untitled")}
                          </Link>
                          {w.registry_id ? (
                            <p className="mt-0.5 font-mono text-[10px] tracking-tight text-neutral-400">
                              {w.registry_id}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-[11px] text-neutral-500">{artistLabel}</p>
                          <p className="mt-0.5 text-[10px] text-neutral-400">
                            {artistAuthLabel}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2 pt-0.5">
                          <span
                            className={`inline-block text-sm font-medium ${
                              verified ? "text-emerald-800/90" : "text-neutral-400"
                            }`}
                          >
                            {statusLabel}
                          </span>
                          {needsAuthInvite && pendingAuthInvite ? (
                            <span className="text-[10px] text-neutral-500">
                              {t("gallery.catalogue.invitationOnFile")}
                            </span>
                          ) : needsAuthInvite ? (
                            <button
                              type="button"
                              onClick={() => openArtworkAuthInviteForWork(w.id)}
                              className="rounded-lg border border-neutral-900/10 bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 transition hover:bg-neutral-50"
                            >
                              {t("gallery.catalogue.inviteArtistAuthenticate")}
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {activeSection === "verification" ? (
          <OrganisationVerificationCommand
            galleryVerified={gallery.verified}
            verifyQueue={verifyQueue}
            verifyBusy={verifyBusy}
            artistNameById={artistNameById}
            hasLiveCertificateByArtworkId={
              integrityContext.hasLiveCertificateByArtworkId
            }
            hasRevokedCertificateByArtworkId={
              integrityContext.hasRevokedCertificateByArtworkId
            }
            onReview={(id) => {
              const target = artworks.find((a) => a.id === id);
              if (target) setVerifyTarget(target);
            }}
            onVerify={(id) => {
              const target = artworks.find((a) => a.id === id);
              if (target) setVerifyTarget(target);
            }}
            onRequestAmendment={scrollToGalleryAmendments}
            sectionRef={verificationSectionRef}
          />
        ) : null}

        {activeSection === "opportunities" ? (
          <OrganisationOpportunitiesSection
            galleryId={gallery.id}
            galleryVerified={gallery.verified}
            gallerySlug={gallery.slug}
          />
        ) : null}
      </StudioShell>

      <ModalShell
        isOpen={workspaceGuideOpen}
        onClose={() => setWorkspaceGuideOpen(false)}
        tone="light"
        panelClassName="max-w-lg pr-14 md:pr-16"
      >
        <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-[1.75rem]">
          {t("gallery.guide.title")}
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-neutral-600">
          {t("gallery.guide.body")}
        </p>
      </ModalShell>

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        newArtwork={newArtwork}
        onArtworkChange={setNewArtwork}
        onRegister={() => void handleGalleryRegisterArtwork()}
        registerLoading={registerLoading}
        representedArtistOptions={representedArtistOptions}
        representedArtistId={registerArtistId}
        onRepresentedArtistChange={(id) => {
          setRegisterArtistId(id);
          if (id) {
            const a = artists.find((x) => x.id === id);
            setRegisterCatalogueArtistName(
              a?.display_name?.trim() || a?.full_name?.trim() || ""
            );
          }
        }}
        catalogueArtistName={registerCatalogueArtistName}
        onCatalogueArtistNameChange={setRegisterCatalogueArtistName}
        pendingArtistEmail={registerPendingArtistEmail}
        onPendingArtistEmailChange={setRegisterPendingArtistEmail}
        variant="gallery"
      />

      <ArtworkAuthenticationInviteModal
        isOpen={authInviteTarget !== null}
        onClose={() => {
          setAuthInviteTarget(null);
          setAuthInvitePrefillEmail("");
        }}
        artwork={authInviteTarget}
        artistNameOnFile={
          authInviteTarget?.catalogue_artist_name?.trim() ||
          (authInviteTarget?.artist_id
            ? artistNameById.get(authInviteTarget.artist_id) || t("gallery.fallback.artist")
            : t("gallery.catalogue.artistOnFile"))
        }
        artistAttestationOnFile={
          authInviteTarget
            ? authenticatedAuthInviteArtworkIds.has(authInviteTarget.id)
            : false
        }
        defaultEmail={authInvitePrefillEmail}
        isAdmin={isAdmin}
        onSent={() => void load()}
      />

      <GalleryVerifyAttestationModal
        isOpen={verifyTarget !== null}
        onClose={() => setVerifyTarget(null)}
        artworkTitle={(verifyTarget?.title || "").trim()}
        registryId={verifyTarget?.registry_id ?? null}
        busy={Boolean(verifyTarget && verifyBusy === verifyTarget.id)}
        onConfirm={() => void confirmVerifyArtwork()}
      />

      <DataInsightModal
        open={insightOpen !== null}
        onClose={() => setInsightOpen(null)}
        title={insightTitle || t("studio.insight.fallbackTitle")}
        subtitle={insightSubtitle || null}
        chartLoading={insightLoading}
        kind={insightKind}
        data={insightData}
        lines={insightLines}
        barKey="events"
        breakdown={insightBreakdown}
        dataNotes={insightDataNotes}
      />

      <EndRepresentationModal
        open={endRepTarget != null}
        onClose={() => !endRepBusy && setEndRepTarget(null)}
        subjectName={endRepTarget?.name ?? t("gallery.fallback.artist")}
        institutionName={orgName}
        busy={endRepBusy}
        onConfirm={confirmEndRepresentation}
      />
    </>
  );
}
