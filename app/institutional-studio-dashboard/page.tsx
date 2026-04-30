"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
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
import { GalleryVerifyAttestationModal } from "@/components/gallery/GalleryVerifyAttestationModal";
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
  if (s === "verified") return "Verified on registry";
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
};

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  artist_id: string | null;
  verification_status: string | null;
  created_at: string | null;
  approved_at: string | null;
  image_url: string | null;
  year: string | number | null;
  medium: string | null;
  metadata_hash: string | null;
  current_owner_id: string | null;
};

type InviteRow = {
  id: string;
  artist_email: string;
  status: string;
  created_at: string;
};

function siteOriginForInviteCopy(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function buildArtistInviteEmailDraft(params: {
  galleryName: string;
  artistEmail: string;
}): string {
  const origin = siteOriginForInviteCopy() || "https://your-registry-domain";
  const { galleryName, artistEmail } = params;
  const joinLink = `${origin}/signup?role=artist&email=${encodeURIComponent(artistEmail.trim().toLowerCase() || "artist@example.com")}`;
  return [
    `Subject: ${galleryName} invited you to join the RROWM Registry`,
    "",
    `To: ${artistEmail}`,
    "",
    `${galleryName} invited you to join the RROWM Registry as a represented artist.`,
    "",
    `To accept the invitation:`,
    joinLink,
    "",
    `Gallery page: ${origin}/institutional-studio/<gallery-slug>`,
    "",
    `Once you complete artist setup, your profile will be linked to the gallery automatically.`,
  ].join("\n");
}

type GalleryRole = "admin" | "staff";

export default function GalleryDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryRow | null>(null);
  const [membershipRole, setMembershipRole] = useState<GalleryRole | null>(null);
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
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
  const [inviteFilter, setInviteFilter] = useState<
    "pending" | "accepted" | "declined" | "all"
  >("pending");
  const [invitesExpanded, setInvitesExpanded] = useState(false);
  const artistsSectionRef = useRef<HTMLDivElement | null>(null);
  const inviteSectionRef = useRef<HTMLDivElement | null>(null);
  const verificationSectionRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState<
    "studio" | "roster" | "catalogue" | "verification"
  >("studio");
  const [isTransitioningSection, setIsTransitioningSection] = useState(false);
  const [lastRegistration, setLastRegistration] = useState<{
    title: string;
    registryId: string;
    at: string;
  } | null>(null);
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
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      deferredRouterReplace(
        router,
        `/login?next=${encodeURIComponent("/institutional-studio-dashboard")}`
      );
      return;
    }
    const uid = sessionData.session.user.id;
    setUserId(uid);

    await supabase.auth.refreshSession();

    const onboardingPath = await getOnboardingRedirectPath(supabase, uid);
    if (onboardingPath) {
      deferredRouterReplace(router, onboardingPath);
      return;
    }

    const { data: actor } = await supabase
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

    const { data: memRow, error: memErr } = await supabase
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

    const [{ data: ar }, { data: inv }] = await Promise.all([
      supabase
        .from("artists")
        .select("id, display_name, full_name, slug, represented_by_gallery")
        .eq("gallery_id", g.id)
        .returns(),
      supabase
        .from("gallery_artist_invites")
        .select("id, artist_email, status, created_at")
        .eq("gallery_id", g.id)
        .order("created_at", { ascending: false })
        .returns(),
    ]);

    const artistList: ArtistRow[] = (ar as ArtistRow[] | null) || [];
    setArtists(artistList);
    setInvites(((inv as InviteRow[] | null) || []) satisfies InviteRow[]);

    const ids = artistList.map((a) => a.id).filter(Boolean);
    if (ids.length === 0) {
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

    const { data: aw } = await supabase
      .from("artworks")
      .select(
        "id, title, registry_id, artist_id, verification_status, created_at, approved_at, image_url, year, medium, metadata_hash, current_owner_id"
      )
      .in("artist_id", ids)
      .order("created_at", { ascending: false })
      .returns();

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
        supabase
          .from("ownership_events")
          .select("artwork_id, to_user_id, created_at")
          .in("artwork_id", artworkIds),
        supabase
          .from("value_events")
          .select("artwork_id, declared_value, currency, created_at")
          .in("artwork_id", artworkIds),
        supabase
          .from("verification_events")
          .select(
            "artwork_id, status, source, source_id, verification_method, verified_by_gallery_id, created_at"
          )
          .in("artwork_id", artworkIds),
        supabase
          .from("certificates")
          .select("artwork_id, revoked, issued_at")
          .in("artwork_id", artworkIds),
        // Optional market context: active listings only.
        supabase
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
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const filteredInvites = useMemo(() => {
    if (inviteFilter === "all") return invites;
    return invites.filter((i) => i.status === inviteFilter);
  }, [invites, inviteFilter]);

  const visibleInvites = useMemo(() => {
    if (invitesExpanded) return filteredInvites;
    return filteredInvites.slice(0, 4);
  }, [filteredInvites, invitesExpanded]);

  const isAdmin = membershipRole === "admin";

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
      artists.map((a) => ({
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

  const scrollToInviteSection = () => {
    setActiveSection("roster");
    window.setTimeout(() => {
      inviteSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);
  };

  const openRegisterWorkspace = () => {
    if (artists.length === 0) {
      scrollToArtistsSection();
      return;
    }
    setRegisterArtistId(artists[0]?.id || "");
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
    setInviteCopyDone(false);
    const trimmed = inviteEmail.trim().toLowerCase();

    let payload: {
      ok?: boolean;
      row?: InviteRow;
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
        setInviteError(
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : `Request failed (${res.status}).`
        );
        return;
      }
    } catch {
      setInviteError("Network error — try again.");
      return;
    } finally {
      setInviting(false);
    }

    if (payload.row) {
      setInvites((prev) => [payload.row as InviteRow, ...prev]);
    }
    setInviteEmail("");
    setLastRecordedInviteEmail(trimmed);

    if (payload.emailDeliveryError) {
      setInviteMessage(
        `Invite saved for ${trimmed}. ${payload.emailDeliveryError}`
      );
      return;
    }
    if (payload.emailSent) {
      setInviteMessage(
        `Invitation emailed to ${trimmed} and saved to your outreach log. You can still copy the draft below to customise a follow-up.`
      );
      return;
    }
    setInviteMessage(
      `Recorded for ${trimmed}. Outbound email is not configured on this server — copy the draft below and send from your gallery address (set RESEND_API_KEY and GALLERY_INVITE_EMAIL_FROM or CONTACT_EMAIL_FROM to enable email).`
    );
  };

  const inviteEmailDraft = useMemo(() => {
    if (!gallery?.name?.trim()) return "";
    const sample =
      inviteEmail.trim() ||
      lastRecordedInviteEmail?.trim() ||
      "artist@example.com";
    return buildArtistInviteEmailDraft({
      galleryName: gallery.name.trim(),
      artistEmail: sample,
    });
  }, [gallery?.name, inviteEmail, lastRecordedInviteEmail]);

  const copyInviteDraft = async () => {
    if (!inviteEmailDraft) return;
    try {
      await navigator.clipboard.writeText(inviteEmailDraft);
      setInviteCopyDone(true);
      window.setTimeout(() => setInviteCopyDone(false), 2500);
    } catch {
      setInviteError("Could not copy — select the text manually.");
    }
  };

  const handleGalleryRegisterArtwork = async () => {
    if (!userId || !registerArtistId) return;
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

        const { error: upErr } = await supabase.storage
          .from("artwork-images")
          .upload(fileName, newArtwork.imageFile);
        if (upErr) throw upErr;

        const { data } = supabase.storage
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
          artist_id: registerArtistId,
          title: newArtwork.title,
          year: newArtwork.year,
          medium: newArtwork.medium,
          dimensions: newArtwork.dimensions,
          description: newArtwork.description,
          image_url: imageUrl,
          visibility_level: newArtwork.visibility_level,
        })
      );

      const { data: registered, error } = await supabase.rpc(
        "register_artwork_atomic",
        {
          p_artist_id: registerArtistId,
          p_title: newArtwork.title,
          p_year: newArtwork.year,
          p_medium: newArtwork.medium,
          p_dimensions: newArtwork.dimensions,
          p_description: newArtwork.description,
          p_image_url: imageUrl,
          p_registry_id: registryId,
          p_metadata_hash: metadataHash,
        }
      );
      if (error) throw error;

      let artworkIdForValue: string | null = null;
      if (registered && typeof registered === "object" && "id" in registered) {
        artworkIdForValue = (registered as { id: string }).id;
      } else {
        const { data: latestArtworks } = await supabase
          .from("artworks")
          .select("id")
          .eq("artist_id", registerArtistId)
          .order("created_at", { ascending: false })
          .limit(1);
        artworkIdForValue = latestArtworks?.[0]?.id ?? null;
      }

      if (newArtwork.declared_value && artworkIdForValue) {
        await supabase.rpc("add_value_event", {
          p_artwork_id: artworkIdForValue,
          p_declared_value: Number(newArtwork.declared_value),
          p_currency: String(newArtwork.currency || "").toUpperCase(),
          p_value_type: newArtwork.value_type || "initial",
          p_visibility_level: newArtwork.visibility_level,
          p_note: null,
        });
      }

      setShowRegisterModal(false);
      setProfileError(null);
      setLastRegistration({
        title: newArtwork.title.trim() || "Work",
        registryId,
        at: new Date().toISOString(),
      });
      setSuccessMessage(
        `Registry record issued: ${registryId}. The work appears below with full traceability.`
      );
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
      console.error(e);
      setProfileError("Could not register artwork. Check permissions and fields.");
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
    const { error } = await supabase
      .from("galleries")
      .update({
        location: draft.location.trim() || null,
        description: draft.description.trim() || null,
        website_url: draft.website_url.trim() || null,
      })
      .eq("id", gallery.id);
    setSavingProfile(false);
    if (error) {
      setProfileError(error.message || "Could not save.");
      return;
    }
    await load();
  };

  const confirmVerifyArtwork = async () => {
    const artworkId = verifyTarget?.id;
    if (!gallery?.verified || !artworkId) return;
    setVerifyBusy(artworkId);
    setProfileError(null);
    const { error } = await supabase.rpc("gallery_verify_artwork", {
      p_artwork_id: artworkId,
    });
    setVerifyBusy(null);
    if (error) {
      setProfileError(
        summarizeRpcError(error) || "Verification failed. Check gallery verified status."
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
          : await getDashboardInsights({ supabase, userId, artworkIds });

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
          "“Fully verified” requires a non-revoked certificate, a gallery attestation, and verified ownership — stricter than the per-row “verified” badge on each artwork.",
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
        "Figures are the latest declared value per currency from value events — the same basis as the chart series — not a roll-up of every artwork’s current list price.",
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
        "roster",
        "catalogue",
        "verification",
      ]);
      if (!allowed.has(id)) return;
      if (id === activeSection) return;
      setIsTransitioningSection(true);
      window.setTimeout(() => {
        setActiveSection(
          id as "studio" | "roster" | "catalogue" | "verification"
        );
        setIsTransitioningSection(false);
      }, 180);
    },
    [activeSection]
  );

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
              : "Could not issue certificate.";
          setProfileError(msg);
          return;
        }
        const body = await res.json().catch(() => ({}));
        const created = Boolean(body?.created);
        setSuccessMessage(
          created
            ? "Certificate issued for this work."
            : "Certificate already exists for this work."
        );
        await load();
      } catch {
        setProfileError("Could not issue certificate. Try again.");
      }
    },
    [load]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    deferredRouterPush(router, "/login");
  }, [router]);

  const galleryNavItems = useMemo(
    () => [
      { id: "studio", label: "Studio" },
      {
        id: "roster",
        label: "Roster",
        showDot: pendingInviteCount > 0,
      },
      { id: "catalogue", label: "Catalogue" },
      {
        id: "verification",
        label: "Verification",
        showDot: Boolean(gallery?.verified) && verifyQueue.length > 0,
      },
    ],
    [pendingInviteCount, gallery?.verified, verifyQueue.length]
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
      <WorkspaceShell
        atmosphereClassName="ds-page-environment"
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
            onRegister={openRegisterWorkspace}
            onInvite={scrollToInviteSection}
            isAdmin={isAdmin}
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
              onClick={() => {
                setSuccessMessage(null);
                setLastRegistration(null);
              }}
              className="font-medium underline underline-offset-4"
            >
              Dismiss
            </button>
          </p>
        ) : null}
        {lastRegistration && !successMessage ? (
          <p className="mt-4 font-mono text-[10px] text-neutral-500">
            {lastRegistration.registryId} · {formatShortWhen(lastRegistration.at)}
          </p>
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
                    No declared values yet — capture value when registering works.
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
                      Certs
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
                  Gallery verification pending — attestation unlocks after approval.
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

        {activeSection === "roster" ? (
          <div className="space-y-10">
            <header className="overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/90 via-white/70 to-neutral-50/40 shadow-[0_1px_0_rgba(15,23,42,0.05),0_24px_48px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md">
              <div className="border-b border-neutral-900/[0.06] bg-white/40 px-6 py-6 sm:px-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-[1.75rem]">
                      Roster & presence
                    </h2>
                    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-neutral-600 md:text-[15px]">
                      Represented artists, invitations, and how your gallery appears publicly.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-neutral-900/[0.06] bg-white/70 px-3 py-1 text-[12px] tabular-nums text-neutral-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                      <span className="font-semibold text-neutral-900">{artists.length}</span>
                      <span className="ml-1.5 text-neutral-500">
                        {artists.length === 1 ? "artist" : "artists"}
                      </span>
                    </span>
                    {pendingInviteCount > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50/95 px-3 py-1 text-[12px] font-medium text-amber-950/95 shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                        {pendingInviteCount} pending invite{pendingInviteCount === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-neutral-900/[0.05] bg-neutral-50/80 px-3 py-1 text-[12px] text-neutral-500">
                        No pending invites
                      </span>
                    )}
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={scrollToInviteSection}
                        className="rounded-full border border-neutral-900/[0.08] bg-neutral-950 px-3.5 py-1 text-[12px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
                      >
                        Record invite
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </header>

            {isAdmin ? (
              <section
                className="overflow-hidden rounded-[1.25rem] border border-amber-200/65 bg-gradient-to-br from-amber-50/90 via-amber-50/70 to-white/40 shadow-[0_1px_0_rgba(15,23,42,0.05),0_18px_44px_-28px_rgba(120,53,15,0.18)] backdrop-blur-sm"
                aria-label="Pending artist invitations"
              >
                <div className="border-b border-amber-200/70 bg-white/35 px-6 py-5 sm:px-7">
                  <h3 className="text-[13px] font-semibold text-amber-950/95">
                    Invitations
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-950/85">
                    Saved to your outreach log. If email is configured, recording an
                    invite also sends from the registry.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(
                      [
                        { id: "pending", label: "Pending" },
                        { id: "accepted", label: "Accepted" },
                        { id: "declined", label: "Declined" },
                        { id: "all", label: "All" },
                      ] as const
                    ).map((t) => {
                      const active = inviteFilter === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setInviteFilter(t.id)}
                          className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                            active
                              ? "bg-amber-950/90 text-white"
                              : "bg-white/70 text-amber-950/90 ring-1 ring-amber-200/70 hover:bg-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[12px] text-amber-950/80">
                      Showing{" "}
                      <span className="font-semibold text-amber-950/95">
                        {Math.min(visibleInvites.length, filteredInvites.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-amber-950/95">
                        {filteredInvites.length}
                      </span>
                    </p>
                    {filteredInvites.length > 4 ? (
                      <button
                        type="button"
                        onClick={() => setInvitesExpanded((v) => !v)}
                        className="rounded-full border border-amber-200/70 bg-white/70 px-3 py-1 text-[12px] font-medium text-amber-950/90 transition hover:bg-white"
                      >
                        {invitesExpanded ? "Show less" : "Show all"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {filteredInvites.length > 0 ? (
                  <ul className="max-h-64 divide-y divide-amber-200/60 overflow-auto px-6 py-1 sm:px-7">
                    {visibleInvites.map((inv) => (
                      <li
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-950">
                            {inv.artist_email}
                          </p>
                          <p className="mt-1 text-[11px] text-neutral-600">
                            Status:{" "}
                            <span className="font-medium text-neutral-800">
                              {inv.status}
                            </span>
                          </p>
                        </div>
                        <p className="tabular-nums text-[12px] text-neutral-700">
                          {formatShortWhen(inv.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-6 py-6 text-[13px] text-neutral-700 sm:px-7">
                    <p className="font-medium text-neutral-900">
                      No invites in this view.
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                      Switch filters or record a new invitation.
                    </p>
                  </div>
                )}
              </section>
            ) : null}

            <section
              ref={artistsSectionRef}
              id="gallery-represented-artists"
              className="scroll-mt-20 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/90 via-white/70 to-neutral-50/40 shadow-[0_1px_0_rgba(15,23,42,0.05),0_24px_48px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md"
            >
              <div className="border-b border-neutral-900/[0.06] bg-white/40 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-normal text-neutral-950">
                      Artists
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Linked to your gallery on the registry
                    </p>
                  </div>
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
                      <div
                        ref={inviteSectionRef}
                        id="gallery-invite-artist"
                        className="mx-auto mt-8 max-w-xl scroll-mt-24 text-left"
                      >
                        <div className="rounded-[1.15rem] border border-neutral-900/[0.08] bg-white/70 p-5 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-6">
                        <label className="text-sm font-semibold text-neutral-900">
                          Record an invitation
                        </label>
                        <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                          Saves an entry in your outreach log. When email is configured
                          on the server, we also send an invitation from the registry;
                          otherwise copy the draft below and send from your gallery
                          address.
                        </p>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => {
                              setInviteEmail(e.target.value);
                              setLastRecordedInviteEmail(null);
                            }}
                            placeholder="artist@example.com"
                            className="min-w-0 flex-1 rounded-xl border border-neutral-900/10 bg-white/90 px-3.5 py-3 text-[13px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-neutral-900/25 focus:ring-2 focus:ring-neutral-900/10"
                          />
                          <button
                            type="button"
                            disabled={inviting || !inviteEmail.trim()}
                            onClick={() => void recordArtistInvite()}
                            className="shrink-0 rounded-xl bg-neutral-950 px-5 py-3 text-[13px] font-semibold text-white shadow-md shadow-neutral-900/15 transition hover:bg-neutral-800 disabled:opacity-40"
                          >
                            {inviting ? "Recording…" : "Record invitation"}
                          </button>
                        </div>
                        {inviteError ? (
                          <p className="mt-3 text-[12px] text-red-800">{inviteError}</p>
                        ) : null}
                        {inviteMessage ? (
                          <p className="mt-3 text-[12px] leading-relaxed text-emerald-900/90">
                            {inviteMessage}
                          </p>
                        ) : null}
                        {inviteEmailDraft ? (
                          <div className="mt-5 overflow-hidden rounded-xl border border-neutral-900/10 bg-white/75">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="px-4 pt-4 text-[12px] font-semibold text-neutral-900">
                                Suggested email copy
                              </p>
                              <button
                                type="button"
                                onClick={() => void copyInviteDraft()}
                                className="mr-4 mt-3 rounded-lg border border-neutral-900/15 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                              >
                                {inviteCopyDone ? "Copied" : "Copy all"}
                              </button>
                            </div>
                            <p className="px-4 pb-3 text-[11px] leading-snug text-neutral-600">
                              Edit freely before sending. If automated email is enabled, this can be used for follow-ups.
                            </p>
                            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words border-t border-neutral-900/10 bg-neutral-950/[0.03] p-4 font-mono text-[10px] leading-relaxed text-neutral-800">
                              {inviteEmailDraft}
                            </pre>
                          </div>
                        ) : null}
                        </div>
                      </div>
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
                                      : "bg-amber-500/12 text-amber-950/90"
                                  }`}
                                >
                                  {represented ? "Represented" : "Pending"}
                                </span>
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
                    {isAdmin ? (
                      <div
                        ref={inviteSectionRef}
                        id="gallery-invite-artist"
                        className="mt-8 scroll-mt-24 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-white/85 via-white/65 to-neutral-50/40 shadow-[0_1px_0_rgba(15,23,42,0.05),0_24px_48px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md"
                      >
                        <div className="border-b border-neutral-900/[0.06] bg-white/40 px-5 py-5 sm:px-7 sm:py-6">
                          <p className="text-[13px] font-semibold text-neutral-950">
                            Invite another artist
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-neutral-600">
                            Records an outreach entry and attempts to email the artist if outbound email is configured.
                          </p>
                        </div>
                        <div className="px-5 py-5 sm:px-7 sm:py-6">
                        <div className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => {
                              setInviteEmail(e.target.value);
                              setLastRecordedInviteEmail(null);
                            }}
                            placeholder="artist@example.com"
                            className="min-w-0 flex-1 rounded-xl border border-neutral-900/10 bg-white/90 px-3.5 py-3 text-[13px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-900/25 focus:ring-2 focus:ring-neutral-900/10"
                          />
                          <button
                            type="button"
                            disabled={inviting || !inviteEmail.trim()}
                            onClick={() => void recordArtistInvite()}
                            className="shrink-0 rounded-xl bg-neutral-950 px-5 py-3 text-[13px] font-semibold text-white shadow-md shadow-neutral-900/15 transition hover:bg-neutral-800 disabled:opacity-40"
                          >
                            {inviting ? "Recording…" : "Record invitation"}
                          </button>
                        </div>
                        {inviteError ? (
                          <p className="mt-3 text-[12px] text-red-800">{inviteError}</p>
                        ) : null}
                        {inviteMessage ? (
                          <p className="mt-3 text-[12px] leading-relaxed text-emerald-900/90">
                            {inviteMessage}
                          </p>
                        ) : null}
                        {inviteEmailDraft ? (
                          <div className="mt-5 overflow-hidden rounded-xl border border-neutral-900/10 bg-white/75">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
                              <p className="text-[12px] font-semibold text-neutral-900">
                                Suggested email copy
                              </p>
                              <button
                                type="button"
                                onClick={() => void copyInviteDraft()}
                                className="rounded-lg border border-neutral-900/15 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-900 transition hover:bg-neutral-50"
                              >
                                {inviteCopyDone ? "Copied" : "Copy all"}
                              </button>
                            </div>
                            <p className="px-4 pb-3 text-[11px] leading-snug text-neutral-600">
                              Edit freely before sending. If automated email is enabled, this can be used for follow-ups.
                            </p>
                            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words border-t border-neutral-900/10 bg-neutral-950/[0.03] p-4 font-mono text-[10px] leading-relaxed text-neutral-800">
                              {inviteEmailDraft}
                            </pre>
                          </div>
                        ) : null}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {activeSection === "catalogue" ? (
          <>
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
                  {artists.length === 0
                    ? "No works — add an artist first."
                    : "No works in the catalogue yet."}
                </p>
              ) : (
                <ul className="mt-6 max-h-[min(70vh,36rem)] divide-y divide-neutral-900/[0.05] overflow-y-auto pr-1">
                  {artworks.map((w) => {
                    const artistLabel =
                      (w.artist_id && artistNameById.get(w.artist_id)) || "—";
                    const verified =
                      String(w.verification_status || "").toLowerCase() === "verified";
                    const statusLabel = verified ? "Verified" : "Unverified";
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
                        </div>
                        <div className="shrink-0 pt-0.5 text-right">
                          <span
                            className={`inline-block text-sm font-medium ${
                              verified ? "text-emerald-800/90" : "text-neutral-400"
                            }`}
                          >
                            {statusLabel}
                          </span>
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
                    Confirm only when the record is ready — a confirmation step follows.
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

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        newArtwork={newArtwork}
        onArtworkChange={setNewArtwork}
        onRegister={() => void handleGalleryRegisterArtwork()}
        registerLoading={registerLoading}
        representedArtistOptions={representedArtistOptions}
        representedArtistId={registerArtistId}
        onRepresentedArtistChange={setRegisterArtistId}
        variant="gallery"
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
        subtitle={insightLoading ? "Loading…" : insightSubtitle || null}
        kind={insightKind}
        data={insightData}
        lines={insightLines}
        barKey="events"
        breakdown={insightBreakdown}
        dataNotes={insightDataNotes}
      />
    </>
  );
}
