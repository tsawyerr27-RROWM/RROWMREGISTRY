"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WelcomeModal } from "@/components/ui/IntroModal";
import { galleryIntroSteps } from "@/components/ui/intro-content";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import {
  WorkspaceShell,
  WorkspaceShellFooterLinks,
} from "@/components/Studio/WorkspaceShell";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { TestDataControls } from "@/components/Admin/TestDataControls";
import { getOnboardingRedirectPath } from "@/lib/onboarding";
import {
  deferredRouterPush,
  deferredRouterReplace,
} from "@/lib/deferred-app-router";
import {
  RegisterModal,
  type RegisterModalArtwork,
} from "@/components/Dashboard/RegisterModal";
import { DataInsightModal } from "@/components/Insights/DataInsightModal";
import { GalleryInstitutionalHero } from "@/components/gallery/GalleryInstitutionalHero";
import { ArtistTierBadge } from "@/components/artist/ArtistTierBadge";
import { consumePendingGallerySection } from "@/lib/gallery-workspace-nav";
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
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { GalleryVerifyAttestationModal } from "@/components/gallery/GalleryVerifyAttestationModal";
import { INVITE_EMAIL_UPDATED_MAIL_FAILED_MESSAGE } from "@/lib/email-config";
import { formatCurrency } from "@/lib/formatCurrency";
import { generateRoleInsight, getDashboardInsights } from "@/lib/insights";
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

function formatVerificationStatus(status: string | null | undefined): string {
  const s = String(status || "").toLowerCase();
  if (s === "verified") return "Verified";
  if (!s) return "Pending";
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

function formatRegisterFailure(error: unknown): string {
  const msg = summarizeRpcError(error);
  if (msg && msg !== "RPC error (no enumerable fields)") return msg;
  if (error instanceof Error && error.message) return error.message;
  return "Work could not be registered on file. Check permissions, required fields, and that institution catalogue migrations are applied in Supabase.";
}

function buildArtistInviteEmailDraft(params: {
  galleryName: string;
  artistEmail: string;
  gallerySlug?: string | null;
}): string {
  const site = getSiteUrl();
  const { galleryName, artistEmail } = params;
  const slug = params.gallerySlug?.trim();
  const galleryLine = slug
    ? `Gallery page: ${site}/gallery/${slug}`
    : `Gallery page: ${site}/gallery/<gallery-slug>`;
  return [
    `Subject: ${galleryName} invited you to join the RROWM Registry`,
    "",
    `To: ${artistEmail}`,
    "",
    `${galleryName} invited you to join the RROWM Registry as a represented artist.`,
    "",
    `To accept, use the personalised link from the registry email (single-use token).`,
    `Sign up with exactly this invited address.`,
    "",
    `Registry signup: ${site}/signup?invite_token=<paste-from-registry-email-if-needed>`,
    "",
    galleryLine,
    "",
    `After you finish artist onboarding, your invitation is confirmed and your gallery may be notified.`,
  ].join("\n");
}

type GalleryRole = "admin" | "staff";

export default function GalleryDashboardPage() {
  const router = useRouter();
  const sb = useSupabaseBrowserLazy();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
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

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
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
    value_type: "initial",
  });

  const load = useCallback(async () => {
    const { data: sessionData } = await sb().auth.getSession();
    if (!sessionData?.session) {
      deferredRouterReplace(
        router,
        `/login?next=${encodeURIComponent("/institutional-studio-dashboard")}`
      );
      return;
    }
    const uid = sessionData.session.user.id;
    setUserId(uid);

    await sb().auth.refreshSession();

    const onboardingPath = await getOnboardingRedirectPath(sb(), uid);
    if (onboardingPath) {
      deferredRouterReplace(router, onboardingPath);
      return;
    }

    const { data: actor } = await sb()
      .from("actor_profiles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();
    if (!actor?.role) {
      deferredRouterReplace(router, "/onboarding");
      return;
    }

    if (actor.role !== "gallery") {
      deferredRouterReplace(
        router,
        actor.role === "collector" ? "/collector-studio" : "/studio"
      );
      return;
    }

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
        summarizeRpcError(memErr) || "Could not load gallery membership."
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
        a.display_name?.trim() || a.full_name?.trim() || "Artist";
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
          .select("artwork_id, to_user_id, created_at")
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

      for (const row of oeRes.data ?? []) {
        const r = row as {
          artwork_id: string;
          to_user_id: string | null;
          created_at: string | null;
        };
        const aid = String(r.artwork_id);
        ownershipByArtworkId[aid] = (ownershipByArtworkId[aid] ?? 0) + 1;
        const at = r.created_at || "";
        const existingAt = ownershipLastAtByArtworkId[aid];
        if (!existingAt || at > existingAt) {
          ownershipLastToUserIdByArtworkId[aid] = r.to_user_id ?? null;
          ownershipLastAtByArtworkId[aid] = at;
        }
        if (at) {
          const prev = lastActivityAtByArtworkId[aid];
          if (!prev || at > prev) lastActivityAtByArtworkId[aid] = at;
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
    setLoading(false);
  }, [router, sb]);

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
          setProfileError(j?.error || "Amendment could not be resolved.");
          return;
        }
        setProfileError(null);
        setSuccessMessage(
          accept ? "Amendment accepted on file." : "Amendment declined on file."
        );
        await load();
      } catch {
        setProfileError("Amendment could not be resolved.");
      } finally {
        setAmendmentBusyId(null);
      }
    },
    [load]
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
          setProfileError(j?.error || "Could not withdraw amendment.");
          return;
        }
        setProfileError(null);
        setSuccessMessage("Amendment withdrawn on file.");
        await load();
      } catch {
        setProfileError("Could not withdraw amendment.");
      } finally {
        setAmendmentBusyId(null);
      }
    },
    [load]
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
          setProfileError(j?.error || "Could not end representation.");
          return;
        }
        setProfileError(null);
        setSuccessMessage(
          "Representation ended on file. Prior filings remain visible on the chronology."
        );
        setEndRepTarget(null);
        await load();
      } catch {
        setProfileError("Could not end representation.");
      } finally {
        setEndRepBusy(false);
      }
    },
    [endRepTarget, load]
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
        throw new Error(j?.error || "Request failed.");
      }
      setProfileError(null);
      setSuccessMessage("Amendment request filed on the chronology.");
      await load();
    },
    [load]
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
        a.display_name?.trim() || a.full_name?.trim() || "Artist"
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

  const latestActivityLine = useMemo(() => {
    if (artworks.length === 0) return null as string | null;
    const sorted = [...artworks].sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
    const w = sorted[0];
    const t = (w.title || "").trim() || "Work";
    const when = formatShortWhen(w.created_at);
    return when ? `Latest activity: ${t} · ${when}` : `Latest activity: ${t}`;
  }, [artworks]);

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
            a.display_name?.trim() || a.full_name?.trim() || "Artist",
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
      setInviteError(
        "Only gallery administrators can record invitations."
      );
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
            setInviteError("An invite for this address is already on file.");
          }
          setInviteMessage(null);
          return;
        }
        setInviteDuplicateFromApi(null);
        setInviteError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : `The request did not complete (${res.status}).`
        );
        return;
      }
    } catch {
      setInviteDuplicateFromApi(null);
      setInviteError("Network error. Try again.");
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
        `On file for ${trimmed}. ${payload.emailDeliveryError}`
      );
      return;
    }
    if (payload.emailSent) {
      setInviteMessage(`Invite on file. Copy sent to ${trimmed}.`);
      return;
    }
    setInviteMessage(
      `Recorded for ${trimmed}. Email not sent; copy the manual draft or adjust mail settings (RESEND_API_KEY, RESEND_FROM_* on email.rrowm.io, NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_SITE_URL).`
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
        body: JSON.stringify({ invite_id: inviteId }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailDeliveryError?: string;
      };
      if (!res.ok) {
        setArtworkAuthInviteError(
          payload.error || `Could not resend (${res.status}).`
        );
        return;
      }
      setArtworkAuthInviteMessage(
        payload.emailSent
          ? "Artwork authentication invitation resent."
          : payload.emailDeliveryError ||
              "Invitation refreshed on file; email not sent."
      );
      await load();
    } catch {
      setArtworkAuthInviteError("Network error. Try again.");
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
        body: JSON.stringify({ invite_id: inviteId }),
      });
      payload = (await res.json().catch(() => ({}))) as typeof payload;
      if (!res.ok) {
        setInviteError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : `The request did not complete (${res.status}).`
        );
        return;
      }
    } catch {
      setInviteError("Network error. Try again.");
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
        "Invite resent on file. A new signup link was sent to the artist."
      );
    } else {
      setInviteMessage(INVITE_EMAIL_UPDATED_MAIL_FAILED_MESSAGE);
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
            : `Could not publish (${res.status}).`
        );
        return;
      }
      setInvites((prev) =>
        prev.map((x) =>
          x.id === inviteId ? { ...x, visibility_status: "public" } : x
        )
      );
      setInviteMessage(
        "Visibility updated. The artist is now Public on your institutional page."
      );
    } catch {
      setInvitePublishError("Network error. Try again.");
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
      galleryName: gallery.name?.trim() || "Gallery",
      artistEmail: sample,
      gallerySlug: gallery.slug,
    });
  }, [gallery?.id, gallery?.name, gallery?.slug, inviteEmail, lastRecordedInviteEmail]);

  const copyInviteDraft = async () => {
    if (!inviteEmailDraft) return;
    try {
      await navigator.clipboard.writeText(inviteEmailDraft);
      setInviteCopyDone(true);
      window.setTimeout(() => setInviteCopyDone(false), 2500);
    } catch {
      setInviteError("Could not copy. Select the text manually.");
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
      setProfileError("Image is required to open the canonical record on file.");
      return;
    }
    if (!linkedArtistId && !catalogueName) {
      setProfileError("Artist name is required when no roster artist is linked.");
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

      if (newArtwork.declared_value && artworkIdForValue) {
        const { error: valueErr } = await sb().rpc("add_value_event", {
          p_artwork_id: artworkIdForValue,
          p_declared_value: Number(newArtwork.declared_value),
          p_currency: String(newArtwork.currency || "").toUpperCase(),
          p_value_type: newArtwork.value_type || "initial",
          p_visibility_level: newArtwork.visibility_level,
          p_note: null,
        });
        if (valueErr) {
          console.warn(
            "[gallery register] value event",
            summarizeRpcError(valueErr)
          );
        }
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
        title: newArtwork.title.trim() || "Work",
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
        value_type: "initial",
      });
      await load();
    } catch (e) {
      const detail = formatRegisterFailure(e);
      console.error("[gallery register]", detail);
      setProfileError(detail);
    }
    setRegisterLoading(false);
  };

  const saveProfile = async () => {
    if (!isAdmin) {
      setProfileError("Only gallery administrators can edit institutional presence.");
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
      setProfileError(error.message || "Changes could not be filed.");
      return;
    }
    await load();
  };

  const confirmVerifyArtwork = async () => {
    const artworkId = verifyTarget?.id;
    if (!gallery?.verified || !artworkId) return;
    setVerifyBusy(artworkId);
    setProfileError(null);
    const { error } = await sb().rpc("gallery_verify_artwork", {
      p_artwork_id: artworkId,
    });
    setVerifyBusy(null);
    if (error) {
      setProfileError(
        summarizeRpcError(error) || "Verification did not complete."
      );
      return;
    }
    setVerifyTarget(null);
    setSuccessMessage(
      "Attestation recorded. This work is now verified on the registry."
    );
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
        setInsightTitle("Catalogue over time");
        setInsightSubtitle(
          generateRoleInsight("gallery", {
            artworkTrend: insights.artworkTrend,
            catalogue: cat,
          })
        );
        setInsightLines([{ key: "works", label: "Cumulative works" }]);
        setInsightData(series);
        setInsightBreakdown([
          { label: "Total works", value: String(cat.totalWorks) },
          { label: "Unique", value: String(cat.uniqueWorks) },
          { label: "Editions", value: String(cat.editionWorks) },
          ...(cat.mostActivePeriod
            ? [{ label: "Peak period", value: cat.mostActivePeriod }]
            : []),
        ]);
        return;
      }

      if (kind === "health") {
        const h = insights.health;
        setInsightKind("bar");
        setInsightTitle("Record health");
        setInsightSubtitle(generateRoleInsight("gallery", { health: h }));
        setInsightData([
          { month: "Fully verified", events: h.fullyVerified },
          { month: "Certified", events: h.withCertificates },
          { month: "Incomplete", events: h.missingVerification },
        ]);
        setInsightBreakdown([
          {
            label: "Fully verified (strict)",
            value: String(h.fullyVerified),
          },
          { label: "With certificate", value: String(h.withCertificates) },
          {
            label: "Missing verification",
            value: String(h.missingVerification),
          },
        ]);
        setInsightDataNotes([
          "These bars are not additive: one work can count toward more than one category.",
          "“Fully verified” needs a non-revoked certificate, a gallery attestation, and verified ownership. That bar is stricter than the per-row “verified” badge on each artwork.",
        ]);
        return;
      }

      const { series, currencies } = insights.valueTrend;
      setInsightKind("line");
      setInsightTitle("Declared value");
      setInsightSubtitle(
        generateRoleInsight("gallery", { valueTrend: insights.valueTrend })
      );
      setInsightLines(currencies.map((c) => ({ key: c, label: c })));
      setInsightData(series);
      const breakdown = Object.entries(insights.valueTrend.latestValues)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([c, v]) => ({
          label: `Latest declared (${c})`,
          value: formatCurrency(v, c),
        }));
      setInsightBreakdown(breakdown);
      setInsightDataNotes([
        "Figures are the latest declared value per currency from value events (the same basis as the chart series), not a roll-up of every artwork’s current list price.",
      ]);
    } catch {
      setInsightSubtitle("Could not load this insight. Try again.");
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
        const res = await fetch("/api/issue-certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artwork_id: artworkId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg =
            typeof body?.error === "string" && body.error.trim()
              ? body.error.trim()
              : "Certificate could not be filed.";
          setProfileError(msg);
          return;
        }
        const body = await res.json().catch(() => ({}));
        const created = Boolean(body?.created);
        setSuccessMessage(
          created
            ? "Certificate filed for this work."
            : "Certificate already on file for this work."
        );
        await load();
      } catch {
        setProfileError("Certificate could not be filed. Try again.");
      }
    },
    [load]
  );

  const handleSignOut = useCallback(async () => {
    await sb().auth.signOut();
    deferredRouterPush(router, "/login");
  }, [router, sb]);

  const participationAttention =
    (representationSummary?.participation_pending ?? 0) > 0 ||
    (representationSummary?.amendments_pending ?? 0) > 0;

  const galleryNavItems = useMemo(
    () => [
      { id: "studio", label: "Overview" },
      {
        id: "record-depth",
        label: "Record depth",
        showDot: participationAttention,
      },
      { id: "roster", label: "Artists" },
      { id: "catalogue", label: "Works" },
      {
        id: "verification",
        label: "Continuity & certs",
        showDot: Boolean(gallery?.verified) && verifyQueue.length > 0,
      },
      {
        id: "invitations",
        label: "Invitations",
        showDot: pendingInviteCount > 0,
      },
    ],
    [
      pendingInviteCount,
      gallery?.verified,
      verifyQueue.length,
      participationAttention,
    ]
  );

  const sidebarActivityNode = latestActivityLine ? (
    <p className="text-[13px] leading-snug text-neutral-600">{latestActivityLine}</p>
  ) : (
    <p className="text-[13px] text-neutral-500">No recent catalogue activity.</p>
  );

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
        Loading…
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="ds-page-environment min-h-screen px-6 pt-24 text-neutral-800">
        <main className="mx-auto max-w-lg">
          <TestDataControls />
          <p className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
            Create your gallery profile
          </p>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            This establishes your presence and authority within the registry. You
            need a linked gallery record before the dashboard can load.
          </p>
          {profileError ? (
            <p className="mt-4 text-sm text-red-800">{profileError}</p>
          ) : null}
          <Link
            href="/onboarding?focus=gallery"
            className="mt-10 inline-block border-b border-neutral-900 pb-1 text-sm font-medium text-neutral-900 transition hover:opacity-70"
          >
            Continue to gallery onboarding →
          </Link>
        </main>
      </div>
    );
  }

  const orgName = gallery.name?.trim() || "Gallery";
  const worksCount = artworks.length;
  const verifiedWorksCount = artworks.filter(
    (w) => w.verification_status === "verified"
  ).length;
  const awaitingVerificationCount = verifyQueue.length;
  const verificationPct =
    worksCount > 0 ? Math.round((verifiedWorksCount / worksCount) * 100) : 0;

  const identityDescription =
    gallery.description?.trim() || "";
  const identityLocation = gallery.location?.trim() || "";

  return (
    <>
      <WelcomeModal role="gallery" steps={galleryIntroSteps} />
      <WorkspaceShell
        atmosphereClassName="ds-workspace-environment"
        navItems={galleryNavItems}
        activeId={activeSection}
        onSelect={selectGallerySection}
        isLightChrome
        isTransitioning={isTransitioningSection}
        sidebarFooter={<WorkspaceShellFooterLinks isLight />}
        sidebarActivity={sidebarActivityNode}
        activityHeading="Catalogue activity"
        onSignOut={handleSignOut}
      >
        {activeSection === "studio" ? (
          <>
            <TestDataControls />

            <div className="mt-6">
          <GalleryInstitutionalHero
            orgName={orgName}
            slug={gallery.slug}
            verified={gallery.verified}
            description={identityDescription || null}
            location={identityLocation || null}
            subscriptionStatus={gallery.subscription_status}
            artworks={artworks}
            worksCount={worksCount}
            verifiedWorksCount={verifiedWorksCount}
            verificationPct={verificationPct}
            awaitingVerificationCount={awaitingVerificationCount}
            institutionFiledCount={
              representationSummary?.institution_filed ?? 0
            }
            artistConfirmedCount={representationSummary?.artist_confirmed ?? 0}
            participationPendingCount={
              representationSummary?.participation_pending ?? 0
            }
            rosterInvitesPendingCount={
              representationSummary?.roster_invites_pending ?? 0
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
        </div>

        {profileError ? (
          <p className="mt-6 text-[13px] text-red-800">{profileError}</p>
        ) : null}
        {successMessage ? (
          <p className="mt-5 text-[13px] text-emerald-900/90">
            {successMessage}{" "}
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="font-medium underline underline-offset-4"
            >
              Dismiss
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

        <section className="mt-10" aria-label="Catalogue intelligence">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-normal text-neutral-950 md:text-2xl">
                Catalogue intelligence
              </h2>
            </div>
            {insightLoading ? (
              <span className="text-[11px] text-neutral-400">Syncing metrics…</span>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => void openInsight("works")}
              disabled={worksCount === 0}
              className="group rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <p className="text-sm font-medium text-neutral-700">
                Registration pace
              </p>
              <p className="mt-2 font-serif text-3xl tabular-nums leading-none text-neutral-950">
                {worksCount}
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">works registered</p>
              {registrationTrend.length === 0 ? (
                <div className="mt-4 min-h-12">
                  <span className="text-[11px] leading-snug text-neutral-400">
                    Add works to see cumulative trend.
                  </span>
                </div>
              ) : (
                <RrowmMiniBarChart
                  className="mt-4 border-t border-black/[0.05] pt-3"
                  trackClassName="h-12"
                  minHeightPercent={12}
                  heightsPercent={registrationTrend.map(
                    (p) => (p.works / maxRegistrationTrend) * 100
                  )}
                />
              )}
              <p className="mt-3 text-[11px] leading-snug text-neutral-400">
                Tap for catalogue detail and composition.
              </p>
            </button>

            <button
              type="button"
              onClick={() => void openInsight("value")}
              disabled={worksCount === 0}
              className="group rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <p className="text-sm font-medium text-neutral-700">
                Declared value
              </p>
              <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-neutral-700">
                {valuePreviewLine ?? (
                  <span className="text-neutral-400">
                    No declared values yet. Capture value when registering works.
                  </span>
                )}
              </p>
              <p className="mt-4 text-[11px] leading-snug text-neutral-400">
                Multi-currency progression · tap to explore.
              </p>
            </button>

            <button
              type="button"
              onClick={() => void openInsight("health")}
              disabled={worksCount === 0}
              className="group rounded-2xl border border-neutral-900/[0.06] bg-white/50 p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12 hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <p className="text-sm font-medium text-neutral-700">
                Record health
              </p>
              {insightPack ? (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-serif text-xl tabular-nums text-neutral-950">
                      {insightPack.health.fullyVerified}
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-600">
                      Verified
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-xl tabular-nums text-neutral-950">
                      {insightPack.health.withCertificates}
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-600">
                      Certified
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-xl tabular-nums text-amber-900/90">
                      {insightPack.health.missingVerification}
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-600">
                      Gaps
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-neutral-400">
                  {worksCount === 0 ? "No data yet." : "Loading breakdown…"}
                </p>
              )}
              <p className="mt-4 text-[11px] leading-snug text-neutral-400">
                Certificates and verification gaps · tap for chart.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("verification")}
              className="rounded-2xl border border-neutral-900/[0.06] bg-gradient-to-br from-white/80 to-neutral-50/90 p-5 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition hover:border-neutral-900/12"
            >
              <p className="text-sm font-medium text-neutral-700">
                Institutional verification
              </p>
              <p className="mt-2 font-serif text-3xl tabular-nums leading-none text-neutral-950">
                {verificationPct}
                <span className="text-lg text-neutral-400">%</span>
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">
                of catalogue verified on registry
              </p>
              {gallery.verified && awaitingVerificationCount > 0 ? (
                <p className="mt-3 text-[12px] font-medium text-amber-900/90">
                  {awaitingVerificationCount} record
                  {awaitingVerificationCount === 1 ? "" : "s"} not yet verified
                </p>
              ) : !gallery.verified ? (
                <p className="mt-3 text-[12px] text-neutral-500">
                  Gallery verification pending. Attestation unlocks after approval.
                </p>
              ) : (
                <p className="mt-3 text-[12px] text-neutral-400">Queue clear.</p>
              )}
              <p className="mt-4 text-[11px] leading-snug text-neutral-400">
                Open Verification to attest pending works.
              </p>
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-white/70 bg-white/45 px-4 py-3.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm">
          <div className="flex flex-col gap-1.5 text-[13px] leading-snug text-neutral-600 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-1">
            <p className="tabular-nums">
              <span className="font-semibold text-neutral-900">{artists.length}</span> represented
              {" · "}
              <span className="font-semibold text-neutral-900">{worksCount}</span> works
              {verifiedWorksCount > 0 ? (
                <>
                  {" "}
                  · <span className="font-semibold text-neutral-900">{verifiedWorksCount}</span>{" "}
                  verified
                </>
              ) : null}
            </p>
            {latestActivityLine ? (
              <p className="text-[12px] text-neutral-500 sm:border-l sm:border-neutral-900/10 sm:pl-6">
                {latestActivityLine}
              </p>
            ) : (
              <p className="text-[12px] text-neutral-400 sm:border-l sm:border-neutral-900/10 sm:pl-6">
                No recent activity.
              </p>
            )}
          </div>
        </section>
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
                No attestations awaiting depth. When canonical records are on file,
                artist authentication and amendments appear here.
              </p>
            ) : null}
          </div>
        ) : null}

        {activeSection === "roster" ? (
          <section
            ref={artistsSectionRef}
            id="gallery-represented-artists"
            className="scroll-mt-20 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/90 via-white/70 to-neutral-50/40 shadow-[0_1px_0_rgba(15,23,42,0.05),0_24px_48px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md"
          >
              <div className="border-b border-neutral-900/[0.06] bg-white/40 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-neutral-950 md:text-2xl">
                      Artists
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Linked to your gallery on the registry
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-neutral-900/[0.06] bg-white/70 px-3 py-1 text-[12px] tabular-nums text-neutral-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                    <span className="font-semibold text-neutral-900">{artists.length}</span>
                    <span className="ml-1.5 text-neutral-500">
                      {artists.length === 1 ? "artist" : "artists"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {artists.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-neutral-900/15 bg-gradient-to-br from-neutral-50/80 via-white/55 to-white/40 px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <p className="font-serif text-lg text-neutral-900">No artists yet</p>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-neutral-600">
                      When you connect artists, they appear here with representation status and work counts.
                    </p>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => goToInvitationsSection()}
                        className="mt-8 inline-flex items-center rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-neutral-900/20 transition hover:bg-neutral-800"
                      >
                        Go to Invitations
                      </button>
                    ) : (
                      <p className="mt-6 text-[13px] text-neutral-500">
                        Ask an administrator to invite artists.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {artists.map((a) => {
                        const name =
                          a.display_name?.trim() || a.full_name?.trim() || "Artist";
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
                                        View public profile
                                      </Link>
                                    ) : (
                                      <span className="text-[12px] text-neutral-400">
                                        No public profile
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
                                    ? "Represented"
                                    : historical
                                      ? "Historical"
                                      : "Pending"}
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
                                    : "—"}
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
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-normal text-neutral-950 md:text-2xl">
                  Works
                </h2>
                <p className="mt-1 max-w-xl text-sm text-neutral-500">
                  Catalogue records filed by your institution. Register a work to
                  open the chronology and layer institution attestations.
                </p>
              </div>
              <button
                type="button"
                onClick={openRegisterWorkspace}
                className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Register a work
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
                  Registered works
                </h2>
                {worksCount > 0 ? (
                  <span className="text-[11px] tabular-nums text-neutral-400">
                    {worksCount} in catalogue
                  </span>
                ) : null}
              </div>
              {artworks.length === 0 ? (
                <p className="mt-4 text-[13px] text-neutral-500">
                  No works in the institutional catalogue yet. Register a canonical
                  record at any time — artist accounts are optional.
                </p>
              ) : (
                <ul className="mt-6 max-h-[min(70vh,36rem)] divide-y divide-neutral-900/[0.05] overflow-y-auto pr-1">
                  {artworks.map((w) => {
                    const linkedName = w.artist_id
                      ? artistNameById.get(w.artist_id)
                      : null;
                    const artistLabel =
                      linkedName ||
                      (w.catalogue_artist_name?.trim() || "Artist on file");
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
                      ? CANONICAL_RECORD_PHRASES.artistAttestationOnFile
                      : w.artist_id
                        ? CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen
                        : CANONICAL_RECORD_PHRASES.artistAttestationNotYetOnFile;
                    const verified =
                      String(w.verification_status || "").toLowerCase() === "verified";
                    const statusLabel = verified ? "Verified" : "On file";
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
                            {(w.title || "").trim() || "Untitled"}
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
                              Invitation on file
                            </span>
                          ) : needsAuthInvite ? (
                            <button
                              type="button"
                              onClick={() => openArtworkAuthInviteForWork(w.id)}
                              className="rounded-lg border border-neutral-900/10 bg-white/90 px-2.5 py-1 text-[10px] font-medium text-neutral-800 transition hover:bg-neutral-50"
                            >
                              Invite artist to authenticate
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}

        {activeSection === "verification" ? (
            <section
              ref={verificationSectionRef}
              id="gallery-verification-queue"
              className="scroll-mt-24 rounded-2xl border border-neutral-900/[0.05] bg-white/35 p-6 backdrop-blur-sm sm:p-7"
            >
              <h2 className="font-serif text-lg font-normal text-neutral-950 md:text-xl">
                Verification
              </h2>
              {!gallery.verified ? (
                <p className="mt-4 text-[13px] text-neutral-500">
                  Your institution is not verified yet. Verification actions are unavailable.
                </p>
              ) : verifyQueue.length === 0 ? (
                <p className="mt-4 text-[13px] text-neutral-400">Nothing awaiting verification.</p>
              ) : (
                <>
                  <p className="mt-3 text-[12px] leading-snug text-neutral-500">
                    Confirm only when the record is ready. A confirmation step follows.
                  </p>
                  <ul className="mt-5 divide-y divide-neutral-900/[0.05]">
                    {verifyQueue.map((w) => (
                      <li
                        key={w.id}
                        className="flex flex-wrap items-start justify-between gap-3 py-3.5 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-neutral-950">
                            {(w.title || "").trim() || "Untitled"}
                          </p>
                          {w.registry_id ? (
                            <p className="font-mono text-[10px] text-neutral-400">{w.registry_id}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          disabled={verifyBusy === w.id}
                          onClick={() => setVerifyTarget(w)}
                          className="shrink-0 rounded-md bg-neutral-950 px-3.5 py-1.5 text-sm font-semibold text-white shadow-md shadow-neutral-900/15 transition [transition-timing-function:var(--rrowm-ease-out)] hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {verifyBusy === w.id ? "…" : "Mark verified"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
        ) : null}
      </WorkspaceShell>

      <ModalShell
        isOpen={workspaceGuideOpen}
        onClose={() => setWorkspaceGuideOpen(false)}
        tone="light"
        panelClassName="max-w-lg pr-14 md:pr-16"
      >
        <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950 md:text-2xl">
          About this workspace
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-neutral-600">
          This workspace groups your{" "}
          <span className="font-medium text-neutral-800">registry catalogue</span>,{" "}
          <span className="font-medium text-neutral-800">participation</span>,{" "}
          <span className="font-medium text-neutral-800">continuity & certs</span>, and{" "}
          <span className="font-medium text-neutral-800">Invitations</span> for optional
          artist authentication. Register canonical records at any time with a plain-text
          artist name; layered participation deepens over time — institution filing first,
          then artist attestation when ready.
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
            ? artistNameById.get(authInviteTarget.artist_id) || "Artist"
            : "Artist on file")
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
        title={insightTitle || "Insight"}
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
        subjectName={endRepTarget?.name ?? "Artist"}
        institutionName={orgName}
        busy={endRepBusy}
        onConfirm={confirmEndRepresentation}
      />
    </>
  );
}
