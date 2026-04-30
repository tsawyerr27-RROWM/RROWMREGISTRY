"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { useEffect, useState, useMemo, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CertificateOverviewModal } from "@/components/certificate/CertificateOverviewModal";
import { RegisterModal } from "@/components/Dashboard/RegisterModal";
import {
  ArtworksSection,
  type ArtworksListFilter,
} from "@/components/Dashboard/ArtworksSection";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { ArtworkDetailModal } from "@/components/Dashboard/ArtworkDetailModal";
import { OwnershipSection } from "@/components/Dashboard/OwnershipSection";
import {
  CertificatesSection,
  type CertificatesListFilter,
} from "@/components/Dashboard/CertificatesSection";
import ModalShell from "@/components/ui/ModalShell";
import { OwnershipLedgerActionConfirmModal } from "@/components/ownership/OwnershipLedgerActionConfirmModal";
import { AddValueEventModal } from "@/components/Dashboard/AddValueEventModal";
import { DataInsightModal } from "@/components/Insights/DataInsightModal";
import { resolveArtworkOwnerId } from "@/lib/resolve-artwork-owner-id";
import { formatCurrency } from "@/lib/formatCurrency";
import { generateRoleInsight, getDashboardInsights } from "@/lib/insights";
import { testModeEnabled } from "@/lib/test-mode";
import { TestDataControls } from "@/components/Admin/TestDataControls";
import { getOnboardingRedirectPath } from "@/lib/onboarding";
import { parseStudioArtworksAccent } from "@/lib/studio-artworks-accent";
import {
  deferredRouterPush,
  deferredRouterReplace,
} from "@/lib/deferred-app-router";
import {
  formatOwnershipParty,
  getLatestOwnershipEvent,
  isLatestOwnershipAssigned,
  latestOwnershipSystemStatus,
  normalizeVerificationStatus,
  formatOwnershipOwnerPrimary,
  ownershipStatusBadge,
  ownershipSystemTrustRank,
  formatOwnershipLedgerSubtitle,
} from "@/lib/ownership-ledger";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isSaleLikeValueType(valueType: string | null | undefined) {
  const v = String(valueType || "")
    .toLowerCase()
    .trim()
    .replaceAll("_", " ");
  return (
    v === "sale" ||
    v === "auction" ||
    v === "primary sale" ||
    v === "secondary sale"
  );
}

export default function Dashboard() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [certificateRows, setCertificateRows] = useState<any[]>([]);
  type SaleSignal = {
    artwork_id: string;
    value_event_id: string;
    value_type: string;
    created_at: string;
  };
  const [saleSignals, setSaleSignals] = useState<Record<string, SaleSignal>>(
    {}
  );
  const [latestOwners, setLatestOwners] = useState<
    Record<
      string,
      {
        to_user_id: string | null;
        to_name: string | null;
        to_type: string | null;
        created_at: string | null;
      }
    >
  >({});
  const [activeSection, setActiveSection] = useState("Studio");
  const [isTransitioningSection, setIsTransitioningSection] = useState(false);
  const [certificateOverviewRegistryId, setCertificateOverviewRegistryId] =
    useState<string | null>(null);
  const [ownershipClaims, setOwnershipClaims] = useState<any[]>([]);
  const [claimActionId, setClaimActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [artworksListFilter, setArtworksListFilter] =
    useState<ArtworksListFilter>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<
    "all" | "needs_transfer" | "sold" | "owned_by_you"
  >("all");
  const [certificatesListFilter, setCertificatesListFilter] =
    useState<CertificatesListFilter>("all");
  const [valueModalArtwork, setValueModalArtwork] = useState<any | null>(null);
  const [valueLoading, setValueLoading] = useState(false);
  const [valueForm, setValueForm] = useState({
    declared_value: "",
    currency: "",
    value_type: "initial",
    visibility_level: "private",
    note: "",
  });
  const [valueHistory, setValueHistory] = useState<any[]>([]);
  const [insightOpen, setInsightOpen] = useState<
    null | "works" | "value" | "health"
  >(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightData, setInsightData] = useState<any[]>([]);
  const [insightLines, setInsightLines] = useState<
    { key: string; label: string }[]
  >([]);
  const [insightTitle, setInsightTitle] = useState("");
  const [insightSubtitle, setInsightSubtitle] = useState("");
  const [insightKind, setInsightKind] = useState<"line" | "bar">("line");
  const [insightBreakdown, setInsightBreakdown] = useState<
    { label: string; value: string }[]
  >([]);
  const [insightDataNotes, setInsightDataNotes] = useState<string[]>([]);
  const [ownershipHistory, setOwnershipHistory] = useState<any[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);
  const [showOwnershipLedgerModal, setShowOwnershipLedgerModal] =
    useState(false);
  const [showSaleTransferForm, setShowSaleTransferForm] = useState(false);
  const [ownershipUiBusyId, setOwnershipUiBusyId] = useState<string | null>(
    null
  );
  const [ownershipActionConfirm, setOwnershipActionConfirm] = useState<
    | null
    | {
        variant: "admin_verify" | "request_verification";
        eventId: string;
      }
  >(null);
  const [saleTransferForm, setSaleTransferForm] = useState({
    buyer_mode: "external" as "user" | "external",
    buyer_user_id: "",
    buyer_name: "",
    buyer_type: "collector" as
      | "collector"
      | "gallery"
      | "institution"
      | "private"
      | "unknown",
    seller_id: "",
    sale_type: "secondary" as "primary" | "secondary",
    sale_date: "",
    note: "",
    owner_visibility: "private",
    owner_name: "",
    owner_location: "",
  });
  const [artworkDetail, setArtworkDetail] = useState<any | null>(null);
  const [newArtwork, setNewArtwork] = useState({
  title: "",
  year: "",
  medium: "",
  dimensions: "",
  description: "",
  visibility_level: "private",
  imageFile: null as File | null,
  declared_value: "",
  currency: "",
  value_type: "initial",
});
  const router = useRouter();
  const refreshSelectedArtworkEventsRef = useRef<
    (artworkId: string) => Promise<void>
  >(async () => {});

  // =============================
  // FETCH
  // =============================
  const fetchArtworks = async (artistId: string) => {
    const { data, error } = await supabase
      .from("artwork_read_model")
      .select("*")
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setArtworks([]);
      return;
    }

    setArtworks(data || []);
    const artworkIds = (data || []).map((a: any) => a.id).filter(Boolean);
    if (artworkIds.length > 0) {
      await fetchLatestOwnersForArtworks(artworkIds);
      await fetchSaleSignalsForArtworks(artworkIds);
    } else {
      setLatestOwners({});
      setSaleSignals({});
    }
  };

  const openInsight = async (kind: "works" | "value" | "health") => {
    if (!user?.id) return;
    setInsightOpen(kind);
    setInsightLoading(true);
    setInsightData([]);
    setInsightLines([]);
    setInsightBreakdown([]);
    setInsightDataNotes([]);

    try {
      const artworkIds = (artworks || [])
        .map((a: any) => String(a.id || ""))
        .filter(Boolean);

      if (kind === "works") {
        const insights = await getDashboardInsights({
          supabase,
          userId: user.id,
          artworkIds,
        });
        const { series } = insights.artworkTrend;
        const cat = insights.catalogue;
        setInsightKind("line");
        setInsightTitle("Catalogue highlights");
        setInsightSubtitle(
          generateRoleInsight("artist", {
            artworkTrend: insights.artworkTrend,
            catalogue: cat,
          })
        );
        setInsightLines([{ key: "works", label: "Works" }]);
        setInsightData(series);
        setInsightBreakdown([
          { label: "Total works", value: String(cat.totalWorks) },
          { label: "Unique works", value: String(cat.uniqueWorks) },
          { label: "Edition works", value: String(cat.editionWorks) },
          ...(cat.mostActivePeriod
            ? [{ label: "Most active period", value: cat.mostActivePeriod }]
            : []),
        ]);
        return;
      }

      if (kind === "health") {
        const insights = await getDashboardInsights({
          supabase,
          userId: user.id,
          artworkIds,
        });
        const h = insights.health;
        setInsightKind("bar");
        setInsightTitle("Record health");
        setInsightSubtitle(generateRoleInsight("artist", { health: h }));
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
          "“Fully verified” requires a non-revoked certificate, a gallery attestation, and verified ownership — stricter than the per-row “verified” badge in your studio list.",
        ]);
        return;
      }

      const insights = await getDashboardInsights({
        supabase,
        userId: user.id,
        artworkIds,
      });
      const { series, currencies, latestValues } = insights.valueTrend;
      setInsightKind("line");
      setInsightTitle("Value progression");
      setInsightSubtitle(
        generateRoleInsight("artist", { valueTrend: insights.valueTrend })
      );
      setInsightLines(currencies.map((c) => ({ key: c, label: c })));
      setInsightData(series);

      const breakdown = Object.keys(latestValues)
        .sort()
        .map((c) => ({
          label: `Latest declared (${c})`,
          value: formatCurrency(latestValues[c], c),
        }));
      setInsightBreakdown(breakdown);
      setInsightDataNotes([
        "Figures are the latest declared value per currency from your value events — the same basis as the chart series — not a roll-up of every artwork’s current list price.",
      ]);
    } finally {
      setInsightLoading(false);
    }
  };

  const fetchLatestOwnersForArtworks = async (artworkIds: string[]) => {
    const { data, error } = await supabase
      .from("ownership_events")
      .select(
        "artwork_id, transfer_type, to_user_id, to_owner_id, to_name, to_type, created_at, id"
      )
      .in("artwork_id", artworkIds);

    if (error) {
      setLatestOwners({});
      return;
    }

    const map: Record<
      string,
      {
        transfer_type: string | null;
        to_user_id: string | null;
        to_name: string | null;
        to_type: string | null;
        created_at: string | null;
      }
    > = {};

    const pickLatest = (
      rows: Array<{
        artwork_id?: string | null;
        transfer_type?: string | null;
        to_user_id?: string | null;
        to_owner_id?: string | null;
        to_name?: string | null;
        to_type?: string | null;
        created_at?: string | null;
        id?: string | null;
      }>
    ) => {
      if (!rows.length) return undefined;
      return rows.reduce((best, row) => {
        const ta = new Date(String(row.created_at || 0)).getTime();
        const tb = new Date(String(best.created_at || 0)).getTime();
        if (ta > tb) return row;
        if (ta < tb) return best;
        return String(row.id || "") > String(best.id || "") ? row : best;
      });
    };

    const byArt = new Map<string, typeof data>();
    for (const row of data || []) {
      const aid = row?.artwork_id ? String(row.artwork_id) : "";
      if (!aid) continue;
      if (!byArt.has(aid)) byArt.set(aid, []);
      byArt.get(aid)!.push(row);
    }

    for (const id of artworkIds) {
      const rows = byArt.get(id);
      if (!rows?.length) continue;
      const row = pickLatest(rows);
      if (!row) continue;
      const uid = row.to_user_id ?? row.to_owner_id;
      map[id] = {
        transfer_type: row.transfer_type ? String(row.transfer_type) : null,
        to_user_id: uid ? String(uid) : null,
        to_name: row.to_name ? String(row.to_name) : null,
        to_type: row.to_type ? String(row.to_type) : null,
        created_at: row.created_at ? String(row.created_at) : null,
      };
    }
    setLatestOwners(map);
  };

  const fetchSaleSignalsForArtworks = async (artworkIds: string[]) => {
    // Primary source: value events + robust unresolved inference.
    // Unresolved when:
    // 1) ownership_resolved = false (explicit), OR
    // 2) no ownership_event linked by value_event_id (structural fallback).
    let valueRows:
      | Array<{
          id: string;
          artwork_id: string;
          value_type: string | null;
          created_at: string | null;
          ownership_resolved?: boolean | null;
        }>
      | null = null;

    const withResolved = await supabase
      .from("value_events")
      .select("id, artwork_id, value_type, created_at, ownership_resolved")
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: false });

    if (withResolved.error) {
      // Fallback for projects where ownership_resolved column is missing.
      const fallback = await supabase
        .from("value_events")
        .select("id, artwork_id, value_type, created_at")
        .in("artwork_id", artworkIds)
        .order("created_at", { ascending: false });
      if (fallback.error) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn(
            "[sale signals] value_events fetch failed",
            summarizeRpcError(fallback.error)
          );
        }
        setSaleSignals({});
        return;
      }
      valueRows = (fallback.data || []) as Array<{
        id: string;
        artwork_id: string;
        value_type: string | null;
        created_at: string | null;
      }>;
    } else {
      valueRows = (withResolved.data || []) as Array<{
        id: string;
        artwork_id: string;
        value_type: string | null;
        created_at: string | null;
        ownership_resolved?: boolean | null;
      }>;
    }

    const sales = (valueRows || []).filter((r) =>
      isSaleLikeValueType(String(r.value_type || ""))
    );
    if (sales.length === 0) {
      setSaleSignals({});
      return;
    }

    const saleIds = sales.map((s) => s.id);
    const ownershipLinkFetch = await supabase
      .from("ownership_events")
      .select("value_event_id")
      .in("value_event_id", saleIds);
    const linked = new Set(
      (ownershipLinkFetch.data || [])
        .map((r: { value_event_id?: string | null }) => r.value_event_id || "")
        .filter(Boolean)
    );

    const map: Record<string, SaleSignal> = {};
    for (const row of sales) {
      const artworkId = String(row.artwork_id || "");
      if (!artworkId || map[artworkId]) continue;
      const explicitResolved = row.ownership_resolved === true;
      const hasLinkedOwnership = linked.has(String(row.id || ""));
      // Resolved if either flag is true OR linkage exists.
      const unresolved = !explicitResolved && !hasLinkedOwnership;
      if (!unresolved) continue;
      map[artworkId] = {
        artwork_id: artworkId,
        value_event_id: String(row.id),
        value_type: String(row.value_type || "sale"),
        created_at: String(row.created_at || ""),
      };
    }
    setSaleSignals(map);
  };

  const refreshSelectedArtworkEvents = async (artworkId: string) => {
    const { data: values } = await supabase
      .from("value_events")
      .select("*")
      .eq("artwork_id", artworkId)
      .order("created_at", { ascending: true });

    const { data: ownership } = await supabase
      .from("ownership_events")
      .select("*")
      .eq("artwork_id", artworkId)
      .order("created_at", { ascending: true });

    setValueHistory(values || []);
    setOwnershipHistory(ownership || []);
  };

  refreshSelectedArtworkEventsRef.current = refreshSelectedArtworkEvents;

  const fetchCertificatesForArtist = async (artistId: string) => {
    const { data, error } = await supabase
      .from("artwork_read_model")
      .select(
        `
        id,
        artist_id,
        title,
        registry_id,
        verification_status,
        image_url,
        year,
        medium,
        created_at,
        has_certificate,
        certificate_revoked,
        certificate_revoked_reason,
        certificate_issued_at
      `
      )
      .eq("artist_id", artistId)
      .eq("has_certificate", true)
      .eq("certificate_revoked", false)
      .order("certificate_issued_at", { ascending: false });

    if (error) {
      console.error(
        "[fetchCertificatesForArtist]",
        summarizeRpcError(error),
        error
      );
      setCertificateRows([]);
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[fetchCertificatesForArtist] rows:",
        (data ?? []).length,
        "artistId:",
        artistId
      );
    }
    setCertificateRows(data || []);
  };

  const userIsAdmin = Boolean(profile?.is_admin);

  const requestOwnershipVerification = async (eventId: string) => {
    if (!user?.id || !selectedArtwork?.id) return;
    setOwnershipUiBusyId(eventId);
    const { error } = await supabase.rpc("ownership_request_verification", {
      p_event_id: eventId,
    });
    if (error) {
      console.error(error);
      showToast(
        "error",
        error.message || "Could not request verification"
      );
      setOwnershipUiBusyId(null);
      return;
    }
    await refreshSelectedArtworkEventsRef.current(selectedArtwork.id);
    showToast("success", "Verification requested");
    setOwnershipUiBusyId(null);
  };

  const adminVerifyOwnership = async (eventId: string) => {
    setOwnershipUiBusyId(eventId);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      showToast("error", "Session expired");
      setOwnershipUiBusyId(null);
      return;
    }
    const res = await fetch("/api/admin/verify-ownership", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(
        "error",
        typeof json?.error === "string" ? json.error : "Verification failed"
      );
      setOwnershipUiBusyId(null);
      return;
    }
    if (selectedArtwork?.id) {
      await refreshSelectedArtworkEventsRef.current(selectedArtwork.id);
    }
    showToast("success", "Ownership verified");
    setOwnershipUiBusyId(null);
  };

// 1️ AUTH + INITIAL LOAD
useEffect(() => {
  const init = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData?.session) {
        deferredRouterPush(
          router,
          "/login?next=" + encodeURIComponent("/studio")
        );
        return;
      }

      const currentUser = sessionData.session.user;
      setUser(currentUser);

      const onboardingPath = await getOnboardingRedirectPath(
        supabase,
        currentUser.id
      );
      if (onboardingPath) {
        deferredRouterReplace(router, onboardingPath);
        return;
      }

      const { data: actorRow, error: actorError } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!actorError && actorRow?.role === "gallery") {
        deferredRouterReplace(router, "/institutional-studio-dashboard");
        return;
      }

      if (!actorError && actorRow?.role === "collector") {
        deferredRouterReplace(router, "/collector-studio");
        return;
      }

      const { data: profileData } = await supabase
        .from("artists")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setProfile(profileData);
      await fetchArtworks(currentUser.id);
      await fetchCertificatesForArtist(currentUser.id);
      await fetchActivity(currentUser.id);
      await fetchOwnershipClaimsForArtist(currentUser.id);
    } catch (e) {
      showToast(
        "error",
        "Network disconnected — reconnect to refresh your session."
      );
      // Let the rest of the UI render; the app will fail gracefully when calls error.
    }
  };

  init();
}, [router]);

// 2️ FETCH VALUE + OWNERSHIP EVENTS
useEffect(() => {
  if (!selectedArtwork) return;

  const fetchEvents = async () => {
    const { data: values } = await supabase
      .from("value_events")
      .select("*")
      .eq("artwork_id", selectedArtwork.id)
      .order("created_at", { ascending: true });

    const { data: ownership } = await supabase
      .from("ownership_events")
      .select("*")
      .eq("artwork_id", selectedArtwork.id)
      .order("created_at", { ascending: true });

    setValueHistory(values || []);
    setOwnershipHistory(ownership || []);
  };

  fetchEvents();
}, [selectedArtwork]);

useEffect(() => {
  if (!showOwnershipLedgerModal || !selectedArtwork) return;
  // Reset the sale transfer UI when switching works / reopening ledger.
  setShowSaleTransferForm(false);
  const seller =
    resolveArtworkOwnerId(selectedArtwork as Record<string, unknown>) ||
    selectedArtwork.artist_id ||
    "";
  setSaleTransferForm((prev) => ({
    ...prev,
    seller_id: String(seller || ""),
    buyer_mode: "external",
    buyer_user_id: "",
    buyer_name: "",
    buyer_type: "collector",
    note: "",
    owner_visibility: "private",
    owner_name: "",
    owner_location: "",
  }));
}, [showOwnershipLedgerModal, selectedArtwork]);

  useEffect(() => {
    if (!showOwnershipLedgerModal || !selectedArtwork?.id || !user?.id) return;
    let cancelled = false;
    void (async () => {
      const { error } = await supabase.rpc("ownership_certificate_verify", {
        p_artwork_id: selectedArtwork.id,
      });
      if (cancelled || error) return;
      await refreshSelectedArtworkEventsRef.current(selectedArtwork.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [showOwnershipLedgerModal, selectedArtwork?.id, user?.id]);

  const verifiedArtworks = artworks.filter(
    (a) => a.verification_status === "verified"
  );

  // Prefer certificate truth from the read-model (view adds has_certificate).
  // Fallback to showing verified if the column doesn't exist yet.
  const certifiedArtworksForUi =
    certificateRows.length > 0
      ? certificateRows
      : artworks.some((a) => "has_certificate" in a)
        ? artworks
            .filter(
              (a) =>
                Boolean(a.has_certificate) && !Boolean(a.certificate_revoked)
            )
            .sort((a, b) => {
              const at = a.certificate_issued_at
                ? new Date(a.certificate_issued_at).getTime()
                : 0;
              const bt = b.certificate_issued_at
                ? new Date(b.certificate_issued_at).getTime()
                : 0;
              return bt - at;
            })
        : verifiedArtworks;

  if (process.env.NODE_ENV === "development") {
    // Helps debug the “empty certificates section” issue.
    // eslint-disable-next-line no-console
    console.log("[dashboard] counts", {
      artworks: artworks.length,
      certificateRows: certificateRows.length,
      certifiedArtworksForUi: certifiedArtworksForUi.length,
      searchQuery,
      activeSection,
    });
  }

  const artworksListFilteredNoSearch = useMemo(() => {
    const vs = (a: (typeof artworks)[number]) =>
      String(a.verification_status || "").toLowerCase();
    let list = artworks;
    if (artworksListFilter === "verified") {
      list = list.filter((a) => vs(a) === "verified");
    } else if (artworksListFilter === "unverified") {
      list = list.filter((a) => vs(a) !== "verified");
    } else if (artworksListFilter === "priced") {
      list = list.filter((a) => {
        const v = a.latest_value;
        return v != null && !Number.isNaN(Number(v));
      });
    } else if (artworksListFilter === "unpriced") {
      list = list.filter((a) => {
        const v = a.latest_value;
        return v == null || Number.isNaN(Number(v));
      });
    }
    return list;
  }, [artworks, artworksListFilter]);

  const filteredArtworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artworksListFilteredNoSearch;
    return artworksListFilteredNoSearch.filter((a) =>
      a.title?.toLowerCase().includes(q)
    );
  }, [artworksListFilteredNoSearch, searchQuery]);

  const ownershipArtworksForUi = useMemo(() => {
    const passesOwnershipFilter = (a: any) => {
      const id = String(a.id || "");
      const sig = saleSignals[id];
      const latest = latestOwners[id];
      const latestType = String((latest as any)?.transfer_type || "");
      const soldByLatest =
        latestType === "sale" || latestType === "auction" || latestType === "primary_sale" || latestType === "secondary_sale";

      const ownedByYou =
        resolveArtworkOwnerId(a as Record<string, unknown>) === user?.id ||
        (latest?.to_user_id ? String(latest.to_user_id) === String(user?.id || "") : false);

      if (ownershipFilter === "needs_transfer") return Boolean(sig);
      if (ownershipFilter === "sold") return soldByLatest;
      if (ownershipFilter === "owned_by_you") return ownedByYou;
      return true;
    };

    // Sale signals should float to the top (signal, not alert).
    const arr = [...filteredArtworks].filter(passesOwnershipFilter);
    arr.sort((a: any, b: any) => {
      const aSig = saleSignals[String(a.id)];
      const bSig = saleSignals[String(b.id)];
      const aT = aSig?.created_at ? new Date(aSig.created_at).getTime() : 0;
      const bT = bSig?.created_at ? new Date(bSig.created_at).getTime() : 0;
      if (aSig && bSig) return bT - aT;
      if (aSig) return -1;
      if (bSig) return 1;
      return 0;
    });
    return arr;
  }, [filteredArtworks, saleSignals, ownershipFilter, latestOwners, user?.id]);

  /** Ownership filter applied to artwork list filters, ignoring title search */
  const ownershipCountIgnoringSearch = useMemo(() => {
    const passesOwnershipFilter = (a: any) => {
      const id = String(a.id || "");
      const sig = saleSignals[id];
      const latest = latestOwners[id];
      const latestType = String((latest as any)?.transfer_type || "");
      const soldByLatest =
        latestType === "sale" ||
        latestType === "auction" ||
        latestType === "primary_sale" ||
        latestType === "secondary_sale";

      const ownedByYou =
        resolveArtworkOwnerId(a as Record<string, unknown>) === user?.id ||
        (latest?.to_user_id
          ? String(latest.to_user_id) === String(user?.id || "")
          : false);

      if (ownershipFilter === "needs_transfer") return Boolean(sig);
      if (ownershipFilter === "sold") return soldByLatest;
      if (ownershipFilter === "owned_by_you") return ownedByYou;
      return true;
    };

    return artworksListFilteredNoSearch.filter(passesOwnershipFilter).length;
  }, [
    artworksListFilteredNoSearch,
    saleSignals,
    ownershipFilter,
    latestOwners,
    user?.id,
  ]);

  const ownershipFilterCounts = useMemo(() => {
    const soldByLatest = (a: any) => {
      const latest = latestOwners[String(a.id)];
      const t = String((latest as any)?.transfer_type || "").toLowerCase();
      return (
        t === "sale" ||
        t === "auction" ||
        t === "primary_sale" ||
        t === "secondary_sale"
      );
    };
    const ownedByYou = (a: any) =>
      resolveArtworkOwnerId(a as Record<string, unknown>) === user?.id ||
      (latestOwners[String(a.id)]?.to_user_id
        ? String(latestOwners[String(a.id)]?.to_user_id) === String(user?.id || "")
        : false);

    return {
      all: artworks.length,
      needs_transfer: artworks.filter((a) => Boolean(saleSignals[String(a.id)])).length,
      sold: artworks.filter(soldByLatest).length,
      owned_by_you: artworks.filter(ownedByYou).length,
    };
  }, [artworks, latestOwners, saleSignals, user?.id]);

  const filteredCertificates = useMemo(() => {
    let list = [...certifiedArtworksForUi];

    if (certificatesListFilter === "with_image") {
      list = list.filter((a) => Boolean(a.image_url));
    } else if (certificatesListFilter === "without_image") {
      list = list.filter((a) => !a.image_url);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => a.title?.toLowerCase().includes(q));
    }
    return list;
  }, [certifiedArtworksForUi, searchQuery, certificatesListFilter]);

  /** Aligned with public artwork / registry editorial surfaces */
  const sectionAtmosphere = {
    Studio: "rrowm-grad-studio",
    Artworks: "rrowm-grad-artworks",
    Certificates:
      "bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(55,55,62,0.55),transparent_55%),linear-gradient(to_bottom_right,#131316_0%,#0d0d10_45%,#12121a_100%)]",
    Ownership:
      "bg-[radial-gradient(ellipse_70%_50%_at_80%_100%,rgba(32,32,38,0.45),transparent_50%),linear-gradient(to_bottom,#101014_0%,#0a0a0c_100%)]",
  };

  const isStudio = activeSection === "Studio";
  const isArtworksSection = activeSection === "Artworks";
  const isLightSection = isStudio || isArtworksSection;

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activityFeed, setActivityFeed] = useState<
    { id: string; message: string; created_at?: string; at?: string }[]
  >([]);

  /** Global header reads this to invert logo + lighten nav on dark studio sections */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("rrowm-dashboard-atmosphere", {
        detail: { headerDark: !isLightSection },
      })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("rrowm-dashboard-atmosphere", {
          detail: { headerDark: false },
        })
      );
    };
  }, [isLightSection]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Prevent repeating the same network/session toast many times while the app is offline.
  const lastAuthToastAtRef = useRef(0);
  const showAuthToast = (message: string) => {
    const now = Date.now();
    if (now - lastAuthToastAtRef.current < 10000) return;
    lastAuthToastAtRef.current = now;
    showToast("error", message);
  };

  // Supabase auth refresh issues commonly surface as FAILED refresh requests.
  // When the session becomes unavailable, show a clearer message to the user.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: unknown, session: unknown) => {
        if (!session) {
          showAuthToast(
            event && String(event).toUpperCase().includes("REFRESH")
              ? "Session refresh failed — please reconnect."
              : "Session expired or disconnected — please reconnect."
          );
        }
      }
    );

    const onOffline = () => {
      showAuthToast("Network disconnected — reconnect to continue.");
    };

    window.addEventListener("offline", onOffline);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActivity = async (userId: string) => {
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setActivityFeed((data as any[]) || []);
  };

  /** Pending claims only for artworks owned by this artist (not global). */
  const fetchOwnershipClaimsForArtist = async (artistId: string) => {
    const { data: owned, error: ownedErr } = await supabase
      .from("artworks")
      .select("id")
      .eq("artist_id", artistId);

    if (ownedErr) {
      console.error(ownedErr);
      setOwnershipClaims([]);
      return;
    }

    const ids = (owned || []).map((r: { id: string }) => r.id);
    if (ids.length === 0) {
      setOwnershipClaims([]);
      return;
    }

    const { data, error } = await supabase
      .from("ownership_claims")
      .select(
        `
        id,
        created_at,
        artwork_id,
        collector_id,
        note,
        status,
        artworks(title, registry_id)
      `
      )
      .eq("status", "pending")
      .in("artwork_id", ids);

    if (error) {
      console.error(error);
      setOwnershipClaims([]);
      return;
    }

    setOwnershipClaims(data || []);
  };

  const logActivity = async ({
    type,
    message,
    artworkId = null,
    metadata = null,
  }: {
    type: string;
    message: string;
    artworkId?: string | null;
    metadata?: unknown;
  }) => {
    if (!user?.id) return;

    const params: Record<string, unknown> = {
      p_user_id: user.id,
      p_type: type,
      p_message: message,
    };
    if (artworkId != null && artworkId !== "") {
      params.p_artwork_id = artworkId;
    }
    if (metadata != null) {
      params.p_metadata = metadata;
    }

    const { error } = await supabase.rpc("log_activity_event", params);

    if (error) {
      console.error(
        "[log_activity_event]",
        summarizeRpcError(error),
        error
      );
      showToast(
        "error",
        "Could not save activity — your last action may still have succeeded. Check the console for details."
      );
    }
  };

  const approveClaim = async (claimId: string) => {
    const claim = ownershipClaims.find((c) => c.id === claimId);

    if (!claim || !user?.id) return;

    setClaimActionId(claimId);

    const { error: claimError } = await supabase
      .from("ownership_claims")
      .update({ status: "approved" })
      .eq("id", claimId);

    if (claimError) {
      console.error(claimError);
      showToast("error", "Failed to approve claim");
      setClaimActionId(null);
      return;
    }

    const claimNote =
      claim.note && String(claim.note).trim()
        ? `Ownership confirmed by artist — ${String(claim.note).trim()}`
        : "Ownership confirmed by artist";

    const { data: latestRow, error: latestErr } = await getLatestOwnershipEvent(
      supabase,
      claim.artwork_id
    );
    if (latestErr) {
      console.error(latestErr);
      showToast("error", "Failed to load ownership ledger");
      setClaimActionId(null);
      return;
    }

    if (latestRow?.id) {
      const { error: eventError } = await supabase
        .from("ownership_events")
        .update({
          to_user_id: claim.collector_id,
          to_name: null,
          to_type: "collector",
          verification_status: "claimed",
          claim_source: "user",
          verified_by: null,
          verified_at: null,
          verification_method: null,
          notes: claimNote,
          note: claimNote,
        })
        .eq("id", latestRow.id);

      if (eventError) {
        console.error(eventError);
        showToast("error", "Failed to update ownership event");
        setClaimActionId(null);
        return;
      }
    } else {
      const { error: eventError } = await supabase
        .from("ownership_events")
        .insert({
          artwork_id: claim.artwork_id,
          transfer_type: "collector_claim",
          to_user_id: claim.collector_id,
          verification_status: "claimed",
          claim_source: "user",
          notes: claimNote,
          note: claimNote,
          created_by: user.id,
        });

      if (eventError) {
        console.error(eventError);
        showToast("error", "Failed to record ownership event");
        setClaimActionId(null);
        return;
      }
    }

    // current_owner_id / test_owner_id refreshed by DB trigger when to_user_id is set.

    showToast("success", "Ownership confirmed");
    await logActivity({
      type: "ownership_confirmed",
      message: `Ownership confirmed — ${claim.artworks?.title || claim.artwork_id}`,
      artworkId: claim.artwork_id,
    });
    if (user?.id) {
      await fetchArtworks(user.id);
      await fetchActivity(user.id);
      await fetchOwnershipClaimsForArtist(user.id);
    }
    setClaimActionId(null);
  };

  const rejectClaim = async (claimId: string) => {
    setClaimActionId(claimId);
    const { error } = await supabase
      .from("ownership_claims")
      .update({ status: "rejected" })
      .eq("id", claimId);

    if (error) {
      console.error(error);
      showToast("error", "Failed to reject claim");
      setClaimActionId(null);
      return;
    }

    showToast("success", "Claim rejected");
    await logActivity({
      type: "ownership_claim_rejected",
      message: "Ownership claim rejected",
    });
    if (user?.id) {
      await fetchActivity(user.id);
      await fetchOwnershipClaimsForArtist(user.id);
    }
    setClaimActionId(null);
  };

  // =============================
// REGISTER HANDLER
// =============================
const handleRegisterArtwork = async () => {
  if (!user) return;

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
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("artwork-images")
        .upload(fileName, newArtwork.imageFile);

      if (error) throw error;

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
        artist_id: user.id,
        title: newArtwork.title,
        year: newArtwork.year,
        medium: newArtwork.medium,
        dimensions: newArtwork.dimensions,
        description: newArtwork.description,
        image_url: imageUrl,
        visibility_level: newArtwork.visibility_level,
      }),
    );

    const { data: registered, error } = await supabase.rpc(
      "register_artwork_atomic",
      {
      p_artist_id: user.id,
      p_title: newArtwork.title,
      p_year: newArtwork.year,
      p_medium: newArtwork.medium,
      p_dimensions: newArtwork.dimensions,
      p_description: newArtwork.description,
      p_image_url: imageUrl,
        p_registry_id: registryId,
        p_metadata_hash: metadataHash,
      },
    );

    if (error) throw error;

    await fetchArtworks(user.id);

    // Prefer the artwork id returned from the RPC. Fallback to "latest artwork"
    // to keep the flow resilient to RPC return-shape differences.
    let artworkIdForValue: string | null = null;
    if (registered && typeof registered === "object" && "id" in registered) {
      artworkIdForValue = (registered as any).id as string;
    } else {
      const { data: latestArtworks } = await supabase
        .from("artworks")
        .select("id")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      artworkIdForValue = latestArtworks?.[0]?.id ?? null;
    }

    // If an initial value was provided, create a value event using the artwork id.
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
    await logActivity({
      type: "artwork_registered",
      message: `Artwork registered — ${newArtwork.title}`,
      artworkId: artworkIdForValue,
    });
    if (user?.id) await fetchActivity(user.id);
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

  } catch (err) {
    console.error(err);
    showToast("error", "Error registering artwork");
  }

  setRegisterLoading(false);
};

  if (!user || !profile) {
    return (
      <div className="ds-page-environment flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-neutral-900">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"
          aria-hidden
        />
        <p className="mt-8 text-sm font-medium text-neutral-500">
          RROWM
        </p>
        <p className="mt-2 text-sm text-neutral-700">Loading your studio…</p>
      </div>
    );
  }

const totalsByCurrency: Record<string, number> = artworks.reduce(
  (acc: Record<string, number>, artwork) => {
    if (!artwork.latest_value) return acc;

    const currency = artwork.latest_currency || "USD";
    const value = Number(artwork.latest_value);

    if (!acc[currency]) acc[currency] = 0;
    acc[currency] += value;

    return acc;
  },
  {}
);

const totalWorks = artworks.length;

const pricedWorks = artworks.filter(a => a.latest_value).length;
const verifiedWorks = artworks.filter(a => a.verification_status === "verified").length;
const lockedWorks = artworks.filter(a => a.is_locked).length;

const percentPriced = totalWorks
  ? Math.round((pricedWorks / totalWorks) * 100)
  : 0;

const percentVerified = totalWorks
  ? Math.round((verifiedWorks / totalWorks) * 100)
  : 0;

const percentLocked = totalWorks
  ? Math.round((lockedWorks / totalWorks) * 100)
  : 0;

  // =============================
// VALUE PROGRESSION
// =============================

const growthData = artworks
  .filter(
    (a) =>
      a.initial_value &&
      a.latest_value &&
      a.initial_currency === a.latest_currency
  )
  .map((a) => {
    const initial = Number(a.initial_value);
    const latest = Number(a.latest_value);

    if (!initial || initial === 0) return null;

    const growth = ((latest - initial) / initial) * 100;

    return {
      id: a.id,
      growth,
    };
  })
  .filter(Boolean) as { id: string; growth: number }[];

const averageGrowth =
  growthData.length > 0
    ? Math.round(
        growthData.reduce((sum, g) => sum + g.growth, 0) /
          growthData.length
      )
    : null;

const growingWorks = growthData.filter((g) => g.growth > 0).length;
const decliningWorks = growthData.filter((g) => g.growth < 0).length;

// =============================
// OWNERSHIP INTELLIGENCE
// =============================

const totalTransfers = artworks.reduce(
  (sum, a) => sum + Number(a.ownership_transfer_count || 0),
  0
);

const worksStillHeld = artworks.filter(
  (a) => resolveArtworkOwnerId(a as Record<string, unknown>) === user?.id
).length;

const holdDurations = artworks
  .filter((a) => a.first_transfer_at)
  .map((a) => {
    const first = new Date(a.first_transfer_at).getTime();
    const latest = new Date(
      a.latest_transfer_at || a.first_transfer_at
    ).getTime();

    return latest - first;
  });

const avgHoldDurationDays =
  holdDurations.length > 0
    ? holdDurations.reduce((sum, d) => sum + d, 0) /
      holdDurations.length /
      (1000 * 60 * 60 * 24)
    : null;

const mostTransferredArtwork =
  artworks.length > 0
    ? artworks.reduce((max, a) =>
        (a.ownership_transfer_count || 0) >
        (max.ownership_transfer_count || 0)
          ? a
          : max,
      artworks[0])
    : null;

const longestHeldArtwork =
  artworks.length > 0
    ? artworks.reduce((max, a) => {
        if (!a.first_transfer_at) return max;
        const first = new Date(a.first_transfer_at).getTime();
        const latest = new Date(
          a.latest_transfer_at || a.first_transfer_at,
        ).getTime();
        const duration = latest - first;
        if (!max) return { artwork: a, duration };
        return duration > max.duration ? { artwork: a, duration } : max;
      }, null as null | { artwork: any; duration: number })
    : null;

const fastestAppreciatingArtwork =
  growthData.length > 0
    ? growthData.reduce((max, g) => (g.growth > max.growth ? g : max), growthData[0])
    : null;

const averageByCurrency: Record<string, number> = Object.keys(
  totalsByCurrency
).reduce((acc: Record<string, number>, currency) => {
  const count = artworks.filter(
    a => a.latest_currency === currency && a.latest_value
  ).length;

  if (count > 0) {
    acc[currency] = totalsByCurrency[currency] / count;
  }



  return acc;
}, {});

return (
  <div
    className={`relative min-h-screen pt-20 ${
      sectionAtmosphere[
        activeSection as keyof typeof sectionAtmosphere
      ]
    } transition-[background] duration-500 ease-out`}
  >
    {toast && (
      <div className="fixed right-6 top-24 z-50 pointer-events-none">
        <div
          className={`border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${
            toast.type === "success"
              ? "border-emerald-400/55 bg-emerald-600/88 text-white"
              : "border-red-400/55 bg-red-600/88 text-white"
          }`}
        >
          {toast.message}
        </div>
      </div>
    )}

    <div
      className={`relative z-10 mx-auto flex w-full max-w-[1600px] min-h-[calc(100vh-5rem)] ${
        isLightSection ? "text-neutral-800" : "text-white"
      }`}
    >
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 px-6 py-10 lg:block lg:w-80 lg:px-8 xl:px-10 xl:py-12">
        <div
          className={`sticky top-24 py-2 pr-6 transition-colors duration-300 xl:pr-8`}
        >
          <div className="flex flex-col gap-8 text-[13px]">
            {(["Studio", "Artworks", "Certificates", "Ownership"] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === activeSection) return;
                    setIsTransitioningSection(true);
                    setTimeout(() => {
                      setActiveSection(item);
                      setSearchQuery("");
                      setIsTransitioningSection(false);
                    }, 180);
                  }}
                  className={`group relative text-left transition-colors ${
                    activeSection === item
                      ? isLightSection
                        ? "text-neutral-900"
                        : "text-white"
                      : isLightSection
                        ? "text-neutral-500 hover:text-neutral-800"
                        : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>
                      {item}
                    </span>
                    {item === "Ownership" &&
                    Object.keys(saleSignals).length > 0 ? (
                      <span
                        className="inline-flex h-2 w-2 rounded-full bg-amber-300/80"
                        aria-label="New sale recorded"
                        title="New sale recorded"
                      />
                    ) : null}
                  </span>
                  <span
                    className={`absolute -bottom-2 left-0 h-px w-8 rounded-full transition-opacity ${
                      activeSection === item
                        ? isLightSection
                          ? "bg-neutral-900 opacity-70"
                          : "bg-white opacity-70"
                        : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                </button>
              )
            )}
          </div>

          <div className={`mt-10 pt-6 ${isLightSection ? "border-t border-black/10" : ""}`}>
            <Link
              href="/account"
              className={`mb-4 block text-sm font-medium transition ${
                isLightSection
                  ? "text-neutral-500 hover:text-neutral-800"
                  : "text-white hover:text-white/90"
              }`}
            >
              My account →
            </Link>
            <Link
              href="/registry"
              className={`text-sm font-medium transition ${
                isLightSection
                  ? "text-neutral-500 hover:text-neutral-800"
                  : "text-white hover:text-white/90"
              }`}
            >
              Public registry →
            </Link>
          </div>

          <div className={`mt-8 pt-6 ${isLightSection ? "border-t border-black/10" : ""}`}>
            <p
              className={`text-sm font-medium ${
                isLightSection ? "text-neutral-500" : "text-white/70"
              }`}
            >
              <span>Activity</span>
            </p>
            {activityFeed.length === 0 ? (
              <p
                className={`mt-3 text-xs ${
                  isLightSection ? "text-neutral-500" : "text-white/75"
                }`}
              >
                No recent activity yet.
              </p>
            ) : (
              <div
                className={`mt-3 space-y-3 ${
                  activityFeed.length > 3
                    ? "max-h-[14rem] overflow-y-auto overscroll-y-contain pr-1"
                    : ""
                }`}
              >
                {activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className={`text-xs ${
                      isLightSection ? "text-neutral-600" : "text-white/90"
                    }`}
                  >
                    <p>{item.message}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isLightSection ? "text-neutral-400" : "text-white/45"
                      }`}
                    >
                      {new Date(
                        (item.created_at ?? item.at) || Date.now()
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`mt-10 w-full text-left text-sm font-medium transition-colors ${
              isLightSection
                ? "text-neutral-400 hover:text-neutral-700"
                : "text-white/60 hover:text-white"
            }`}
            onClick={async () => {
              await supabase.auth.signOut();
              deferredRouterPush(
                router,
                "/login?next=" + encodeURIComponent("/studio")
              );
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex min-h-0 flex-1 flex-col px-5 pb-16 pt-8 transition-all duration-300 md:px-10 md:pt-10 lg:px-14 xl:px-20 xl:pb-24 xl:pt-12 ${
          isTransitioningSection
            ? "translate-y-2 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {testModeEnabled() ? (
          <div className="mb-6 max-w-2xl">
            <TestDataControls />
          </div>
        ) : null}
        {/* Mobile section switcher (sidebar is desktop-first) */}
        <div className="mb-8 flex gap-6 overflow-x-auto pb-0 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {(["Studio", "Artworks", "Certificates", "Ownership"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (item === activeSection) return;
                  setIsTransitioningSection(true);
                  setTimeout(() => {
                    setActiveSection(item);
                    setSearchQuery("");
                    setIsTransitioningSection(false);
                  }, 180);
                }}
                className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition ${
                  activeSection === item
                    ? isLightSection
                      ? "border-neutral-900 text-neutral-950"
                      : "border-white text-white"
                    : isLightSection
                      ? "border-transparent text-neutral-500 hover:text-neutral-800"
                      : "border-transparent text-white/55 hover:text-white/90"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>
                    {item}
                  </span>
                  {item === "Ownership" &&
                  Object.keys(saleSignals).length > 0 ? (
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-300/80" />
                  ) : null}
                </span>
              </button>
            )
          )}
        </div>

        {/* STUDIO (overview) */}
        {isStudio && (
          <div className="max-w-6xl space-y-14 pb-8">
            {/* Overview — typographic; optional angled artwork preview on the right */}
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/55 bg-gradient-to-br from-white/50 via-neutral-100/35 to-slate-400/30 shadow-[0_25px_50px_-18px_rgba(15,23,42,0.14),0_12px_24px_-16px_rgba(148,163,184,0.35),inset_0_1px_0_0_rgba(255,255,255,0.95),inset_0_-1px_0_0_rgba(100,116,139,0.1),inset_0_0_80px_-40px_rgba(255,255,255,0.35)] ring-1 ring-neutral-300/25 backdrop-blur-2xl backdrop-saturate-150">
              {/* Specular gloss + glass */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-white/70 via-white/25 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-white/20"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-12 top-4 h-56 w-56 rounded-full bg-white/45 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-8 bottom-4 h-52 w-52 rounded-full bg-slate-200/50 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                aria-hidden
              />
              <div className="relative z-[1] flex flex-col gap-10 p-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-12 lg:p-12 xl:p-14">
                <div className="min-w-0 flex-1 lg:max-w-2xl">
                  <h3 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
                    {profile?.display_name?.trim() ||
                      profile?.full_name?.trim() ||
                      "Artist"}
                  </h3>
                  <p className="mt-3 font-serif text-[1.75rem] font-normal leading-[1.12] tracking-tight text-neutral-700 md:text-4xl">
                    Overview
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => void openInsight("works")}
                      className="inline-flex items-center rounded-full border border-white/55 bg-white/40 px-3.5 py-1.5 text-[13px] tabular-nums text-neutral-800 shadow-sm backdrop-blur-md transition hover:border-white/70 hover:bg-white/55"
                    >
                      <span className="font-semibold text-neutral-950">
                        {totalWorks}
                      </span>
                      <span className="ml-1.5 text-neutral-500">
                        {totalWorks === 1 ? "work" : "works"}
                      </span>
                      <span className="ml-2 text-sm font-semibold text-neutral-600">
                        Details
                      </span>
                    </button>
                    <span className="inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-50/50 px-3.5 py-1.5 text-[13px] tabular-nums text-emerald-950/90 shadow-sm backdrop-blur-md">
                      <span className="font-semibold">{verifiedWorks}</span>
                      <span className="ml-1.5 font-normal text-emerald-900/75">
                        verified
                      </span>
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/45 bg-white/35 px-3.5 py-1.5 text-[13px] tabular-nums text-neutral-700 shadow-sm backdrop-blur-md">
                      <span className="font-semibold text-neutral-950">
                        {pricedWorks}
                      </span>
                      <span className="ml-1.5 text-neutral-500">priced</span>
                    </span>
                  </div>
                  <div className="mt-10 flex flex-wrap gap-2.5 border-t border-white/35 pt-8">
                    {[
                      { label: "Artworks", section: "Artworks" as const },
                      { label: "Certificates", section: "Certificates" as const },
                      { label: "Ownership", section: "Ownership" as const },
                    ].map(({ label, section }) => (
                      <button
                        key={section}
                        type="button"
                        onClick={() => {
                          setIsTransitioningSection(true);
                          setTimeout(() => {
                            setActiveSection(section);
                            setSearchQuery("");
                            setIsTransitioningSection(false);
                          }, 180);
                        }}
                        className="inline-flex items-center rounded-full border border-white/50 bg-white/40 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm backdrop-blur-md transition hover:border-white/65 hover:bg-white/55"
                      >
                        {label}
                        <span className="ml-1.5 text-neutral-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-start justify-center lg:pt-2">
                  <ArtworksHeroPreview
                    artworks={artworks}
                    variant="editorial"
                  />
                </div>
              </div>
            </div>

            <DashboardSection
              title="Value & coverage"
              subtitle="Totals and how complete your registry records are."
            >
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.keys(totalsByCurrency).length > 0 ? (
                      Object.keys(totalsByCurrency).map((currency) => (
                        <button
                          key={currency}
                          type="button"
                          onClick={() => void openInsight("value")}
                          className="cursor-pointer text-left"
                        >
                          <Metric
                            label={`Total value (${currency})`}
                            value={formatCurrency(totalsByCurrency[currency], currency)}
                            compact
                          />
                        </button>
                      ))
                    ) : (
                      <div className="sm:col-span-2">
                        <Metric
                          label="Total value"
                          value="No priced works yet"
                          compact
                        />
                      </div>
                    )}
                  </div>
                  {Object.keys(averageByCurrency).length > 0 && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {Object.keys(averageByCurrency).map((currency) => (
                        <Metric
                          key={`avg-${currency}`}
                          label={`Avg value (${currency})`}
                          value={new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency,
                            maximumFractionDigits: 0,
                          }).format(averageByCurrency[currency])}
                          compact
                          tone="neutral"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void openInsight("health")}
                  className="flex cursor-pointer flex-col gap-6 border-t border-black/[0.08] pt-8 text-left transition-opacity hover:opacity-85 lg:col-span-5 lg:border-t-0 lg:border-l lg:border-black/[0.08] lg:pl-10 lg:pt-0"
                >
                  <p className="text-sm font-semibold text-neutral-500">
                    Record health
                  </p>
                  <DashboardStatBar
                    label="Priced"
                    percent={percentPriced}
                    hint="Works with a declared value"
                  />
                  <DashboardStatBar
                    label="Verified"
                    percent={percentVerified}
                    hint="Verified in the registry"
                    barClass="bg-emerald-500"
                  />
                  <DashboardStatBar
                    label="Locked"
                    percent={percentLocked}
                    hint="Immutable after verification"
                    barClass="bg-neutral-700"
                  />
                </button>
              </div>
            </DashboardSection>

            {/* Ownership requests */}
            <DashboardSection
              title="Ownership requests"
              subtitle="Collectors requesting recognition—review and respond."
            >
              {ownershipClaims.length === 0 ? (
                <div className="border-t border-dashed border-black/20 py-14 text-center">
                  <p className="text-sm leading-relaxed text-neutral-600">
                    No pending claims. When a collector submits a claim on your
                    work, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.06]">
                  {ownershipClaims.map((claim) => (
                    <div key={claim.id} className="py-10 first:pt-2">
                      <p className="text-sm font-medium text-amber-800/90">
                        Pending review
                      </p>
                      <p className="mt-3 text-lg font-medium text-neutral-900">
                        {claim.artworks?.registry_id ? (
                          <Link
                            href={`/artwork/${encodeURIComponent(claim.artworks.registry_id)}`}
                            className="transition hover:text-emerald-800 hover:underline decoration-emerald-300 underline-offset-4"
                          >
                            {claim.artworks?.title}
                          </Link>
                        ) : (
                          claim.artworks?.title
                        )}
                      </p>
                      <p className="mt-2 font-mono text-[11px] text-neutral-500">
                        {claim.artworks?.registry_id}
                      </p>
                      <p className="mt-2 text-xs text-neutral-500">
                        Claimant{" "}
                        <span className="font-mono text-neutral-700">
                          {claim.collector_id?.slice(0, 8)}…
                        </span>
                      </p>
                      {claim.note && (
                        <p className="mt-4 border-l border-black/10 pl-4 text-sm italic leading-relaxed text-neutral-700">
                          &ldquo;{claim.note}&rdquo;
                        </p>
                      )}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={!!claimActionId}
                          onClick={() => approveClaim(claim.id)}
                          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                        >
                          {claimActionId === claim.id
                            ? "Processing…"
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={!!claimActionId}
                          onClick={() => rejectClaim(claim.id)}
                          className="border border-black/15 bg-transparent px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50"
                        >
                          {claimActionId === claim.id
                            ? "Processing…"
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardSection>

            {/* Value progression */}
            <DashboardSection
              title="Value progression"
              subtitle="How values move from initial to latest where comparable."
            >
              <div className="grid gap-5 md:grid-cols-3">
                {growthData.length > 0 ? (
                  <>
                    <Metric
                      label="Avg change in value"
                      value={
                        averageGrowth !== null
                          ? `${averageGrowth > 0 ? "↑" : averageGrowth < 0 ? "↓" : ""} ${averageGrowth}%`
                          : "—"
                      }
                      hint="Mean % change where initial and latest share a currency."
                      compact
                    />
                    <Metric
                      label="Works with increased value"
                      value={growingWorks}
                      compact
                      tone="emerald"
                    />
                    <Metric
                      label="Declining works"
                      value={decliningWorks}
                      compact
                      tone="amber"
                    />
                  </>
                ) : (
                  <div className="md:col-span-3">
                    <Metric
                      label="Value change"
                      value="No progression data yet"
                      compact
                    />
                  </div>
                )}
              </div>
            </DashboardSection>

            {/* Ownership intelligence */}
            <DashboardSection
              title="Ownership intelligence"
              subtitle="Transfers, holds, and movement across your catalogue."
            >
              <div className="grid gap-5 md:grid-cols-3">
                <Metric
                  label="Total transfers"
                  value={totalTransfers}
                  compact
                />
                <Metric
                  label="Works you still hold"
                  value={worksStillHeld}
                  compact
                  tone="emerald"
                />
                <Metric
                  label="Avg hold (days)"
                  value={
                    avgHoldDurationDays
                      ? Math.round(avgHoldDurationDays)
                      : "—"
                  }
                  compact
                />
              </div>
            </DashboardSection>

            {/* Registry insights */}
            <DashboardSection
              title="Catalogue highlights"
              subtitle="Standout records from your registry activity."
            >
              <div className="grid gap-5 md:grid-cols-3">
                <Metric
                  label="Most transferred"
                  value={
                    mostTransferredArtwork
                      ? `${mostTransferredArtwork.title} · ${mostTransferredArtwork.ownership_transfer_count || 0}`
                      : "—"
                  }
                  hint="Highest transfer count."
                  compact
                />
                <Metric
                  label="Longest held"
                  value={
                    longestHeldArtwork
                      ? `${longestHeldArtwork.artwork.title} · ${Math.round(longestHeldArtwork.duration / (1000 * 60 * 60 * 24))}d`
                      : "—"
                  }
                  hint="Longest span between first and latest transfer."
                  compact
                />
                <Metric
                  label="Fastest appreciating"
                  value={
                    fastestAppreciatingArtwork
                      ? `${fastestAppreciatingArtwork.growth}%`
                      : "—"
                  }
                  hint="Largest % gain from initial to latest (same currency)."
                  compact
                />
              </div>
            </DashboardSection>
          </div>
        )}

        {/* ARTWORKS */}
        {activeSection === "Artworks" && (
          <ArtworksSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            artworksFilter={artworksListFilter}
            onArtworksFilterChange={setArtworksListFilter}
            onRegisterClick={() => {
              setArtworkDetail(null);
              setSelectedArtwork(null);
              setShowOwnershipLedgerModal(false);
              setShowRegisterModal(true);
            }}
            filteredArtworks={filteredArtworks}
            totalArtworkCount={artworks.length}
            onArtworkClick={(artwork) => {
              setArtworkDetail(artwork);
              setSelectedArtwork(artwork);
              setShowOwnershipLedgerModal(false);
            }}
            onAddValueEventClick={(artwork) => {
              setValueModalArtwork(artwork);
            }}
            studioArtworksAccent={parseStudioArtworksAccent(
              profile?.studio_artworks_accent
            )}
          />
        )}

        {/* CERTIFICATES */}
        {activeSection === "Certificates" && (
          <CertificatesSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            certificatesFilter={certificatesListFilter}
            onCertificatesFilterChange={setCertificatesListFilter}
            filteredCertificates={filteredCertificates}
            totalCertificateCount={certifiedArtworksForUi.length}
            onArtworkClick={(artwork) => {
              setCertificateOverviewRegistryId(null);
              setArtworkDetail(artwork);
              setSelectedArtwork(artwork);
              setShowOwnershipLedgerModal(false);
            }}
            onOpenCertificateOverview={(registryId) => {
              setArtworkDetail(null);
              setCertificateOverviewRegistryId(registryId);
            }}
            onRegisterClick={() => {
              setArtworkDetail(null);
              setSelectedArtwork(null);
              setShowOwnershipLedgerModal(false);
              setShowRegisterModal(true);
            }}
          />
        )}

        {/* OWNERSHIP */}
        {activeSection === "Ownership" && (
          <OwnershipSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={ownershipFilter}
            onFilterChange={setOwnershipFilter}
            filterCounts={ownershipFilterCounts}
            filteredArtworks={ownershipArtworksForUi.map((a: any) => {
              const o = latestOwners[String(a.id)];
              return o ? { ...a, __latest_owner: o } : a;
            })}
            totalOwnershipCount={ownershipCountIgnoringSearch}
            onArtworkClick={(artwork) => {
              setArtworkDetail(null);
              setSelectedArtwork(artwork);
              setShowOwnershipLedgerModal(true);
            }}
            onRegisterClick={() => {
              setArtworkDetail(null);
              setSelectedArtwork(null);
              setShowOwnershipLedgerModal(false);
              setShowRegisterModal(true);
            }}
            userId={user?.id}
            saleSignals={saleSignals}
          />
        )}
      </div>
    </div>

    {/* REGISTER MODAL */}
    <RegisterModal
      isOpen={showRegisterModal}
      onClose={() => setShowRegisterModal(false)}
      newArtwork={newArtwork}
      onArtworkChange={(artwork) => setNewArtwork(artwork)}
      onRegister={handleRegisterArtwork}
      registerLoading={registerLoading}
    />

    <AddValueEventModal
      artwork={valueModalArtwork}
      form={valueForm}
      onFormChange={setValueForm}
      loading={valueLoading}
      onClose={() => setValueModalArtwork(null)}
      onSubmit={async () => {
        if (!valueModalArtwork?.id) return;
        const artworkId = valueModalArtwork.id;
        const titleForLog = valueModalArtwork.title || "Artwork";

        setValueLoading(true);

        const { error } = await supabase.rpc("add_value_event", {
          p_artwork_id: artworkId,
          p_declared_value: Number(valueForm.declared_value),
          p_currency: String(valueForm.currency || "").toUpperCase(),
          p_value_type: valueForm.value_type,
          p_visibility_level: valueForm.visibility_level,
          p_note: valueForm.note,
        });

        if (error) {
          console.error(error);
          showToast("error", "Error adding value event");
        } else {
          await fetchArtworks(user.id);
          setValueModalArtwork(null);
          showToast("success", "Value event added");

          await logActivity({
            type: "value_added",
            message: `Value updated — ${titleForLog}`,
            artworkId,
            metadata: {
              value: Number(valueForm.declared_value),
              currency: valueForm.currency,
            },
          });
          if (user?.id) await fetchActivity(user.id);
        }

        setValueLoading(false);
      }}
    />

    <CertificateOverviewModal
      registryId={certificateOverviewRegistryId}
      onClose={() => setCertificateOverviewRegistryId(null)}
    />

    <ArtworkDetailModal
      artwork={artworkDetail}
      onClose={() => {
        setArtworkDetail(null);
        if (!showOwnershipLedgerModal) setSelectedArtwork(null);
      }}
      valueHistory={valueHistory}
    />

    <ModalShell
      isOpen={!!selectedArtwork && showOwnershipLedgerModal}
      onClose={() => {
        setSelectedArtwork(null);
        setShowOwnershipLedgerModal(false);
      }}
      panelClassName="liquid-glass-dark rrowm-modal-surface relative w-full max-w-4xl space-y-10 overflow-y-auto overflow-x-hidden rounded-2xl p-8 ring-1 ring-white/[0.09] shadow-[0_32px_80px_-28px_rgba(0,0,0,0.65)] max-h-[min(85vh,52rem)] sm:p-10 xl:p-12"
      overlayClassName="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-5 sm:p-8"
      closeClassName="liquid-glass-close-dark absolute right-4 top-4 z-20 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.12] hover:text-white sm:right-5 sm:top-5"
    >
      {selectedArtwork && showOwnershipLedgerModal && (
        <>
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-emerald-400/45 to-transparent"
            aria-hidden
          />
          {(() => {
            const SALE_TYPES = new Set([
              "sale",
              "auction",
              "primary_sale",
              "secondary_sale",
            ]);
            const saleEvent = [...valueHistory]
              .reverse()
              .find((e: any) => SALE_TYPES.has(String(e.value_type || "")));
            const saleResolved =
              !saleEvent ||
              saleEvent.ownership_resolved === true ||
              ownershipHistory.some(
                (ev: any) =>
                  String(ev.value_event_id || "") === String(saleEvent.id || "")
              );

            if (!saleEvent || saleResolved) return null;

            const prefillPrice =
              typeof saleEvent.declared_value === "number"
                ? saleEvent.declared_value
                : Number(saleEvent.declared_value || 0);
            const prefillCurrency = String(saleEvent.currency || "USD");
            const prefillDate = saleEvent.created_at
              ? new Date(saleEvent.created_at).toISOString().slice(0, 10)
              : "";

            return (
              <div className="relative mb-8 overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.14] via-amber-950/25 to-transparent px-6 py-5 text-amber-50 shadow-[0_24px_56px_-28px_rgba(120,53,15,0.45)] backdrop-blur-xl ring-1 ring-amber-300/15">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-200/80">
                      Sale recorded
                    </p>
                    <p className="mt-2 text-sm text-amber-50/90">
                      Complete ownership transfer to keep provenance accurate.
                    </p>
                    <p className="mt-2 text-xs text-amber-100/80">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: prefillCurrency,
                        maximumFractionDigits: 0,
                      }).format(prefillPrice)}{" "}
                      · {String(saleEvent.value_type || "").replaceAll("_", " ")} ·{" "}
                      {saleEvent.created_at
                        ? new Date(saleEvent.created_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaleTransferForm((v) => !v);
                        setSaleTransferForm((prev) => ({
                          ...prev,
                          sale_date: prev.sale_date || prefillDate,
                          sale_type:
                            String(saleEvent.value_type || "").includes("primary")
                              ? "primary"
                              : "secondary",
                        }));
                      }}
                      className="rounded-2xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-200"
                    >
                      Record transfer details
                    </button>
                  </div>
                </div>

                {showSaleTransferForm ? (
                  <form
                    className="mt-5 grid gap-4 md:grid-cols-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user?.id) return;

                      const buyerUserId =
                        saleTransferForm.buyer_mode === "user"
                          ? saleTransferForm.buyer_user_id.trim() || null
                          : null;
                      const buyerName =
                        saleTransferForm.buyer_mode === "external"
                          ? saleTransferForm.buyer_name.trim() || null
                          : null;
                      const buyerType =
                        saleTransferForm.buyer_mode === "external"
                          ? saleTransferForm.buyer_type
                          : null;
                      if (buyerUserId && !isUuid(buyerUserId)) {
                        showToast("error", "Buyer user id must be a UUID.");
                        return;
                      }
                      if (saleTransferForm.buyer_mode === "user" && !buyerUserId) {
                        showToast("error", "Buyer user id is required.");
                        return;
                      }
                      if (saleTransferForm.buyer_mode === "external" && !buyerName) {
                        showToast("error", "Buyer name is required.");
                        return;
                      }

                      const saleDateIso = saleTransferForm.sale_date
                        ? new Date(saleTransferForm.sale_date).toISOString()
                        : saleEvent.created_at || new Date().toISOString();

                      // eslint-disable-next-line no-console
                      console.log("[sale transfer] submit", {
                        artwork_id: selectedArtwork.id,
                        value_event_id: saleEvent.id,
                        to_user_id: buyerUserId,
                        to_name: buyerName,
                        to_type: buyerType,
                        sale_type: saleTransferForm.sale_type,
                        sale_date: saleDateIso,
                      });
                      showToast("success", "Saving transfer…");

                      const { error: insertErr } = await supabase
                        .from("ownership_events")
                        .insert({
                          artwork_id: selectedArtwork.id,
                          transfer_type: "sale",
                          to_user_id: buyerUserId,
                          to_name: buyerName,
                          to_type: buyerType,
                          value_event_id: saleEvent.id,
                          sale_type: saleTransferForm.sale_type,
                          sale_price: prefillPrice || null,
                          sale_currency: prefillCurrency || null,
                          sale_date: saleDateIso,
                          notes: saleTransferForm.note || null,
                          note: saleTransferForm.note || null,
                          location: saleTransferForm.owner_location || null,
                          owner_visibility: saleTransferForm.owner_visibility,
                          owner_name: saleTransferForm.owner_name || null,
                          owner_location: saleTransferForm.owner_location || null,
                          created_by: user.id,
                        });

                      if (insertErr) {
                        // eslint-disable-next-line no-console
                        console.error(
                          "[ownership_events insert]",
                          summarizeRpcError(insertErr),
                          insertErr
                        );
                        showToast(
                          "error",
                          `Could not record transfer: ${summarizeRpcError(insertErr)}`
                        );
                        return;
                      }

                      // Sale resolved by DB trigger resolve_sale_on_ownership() after this insert.
                      // Do not PATCH value_events here: a separate update can hit immutability
                      // rules on older value_events rows and return 400 while the insert succeeded.

                      if (buyerUserId) {
                        const { error: ownerUpdateErr } = await supabase
                          .from("artworks")
                          .update({
                            current_owner_id: buyerUserId,
                            test_owner_id: buyerUserId,
                          })
                          .eq("id", selectedArtwork.id);
                        if (ownerUpdateErr) {
                          showToast(
                            "error",
                            "Transfer recorded, but could not update current owner."
                          );
                          return;
                        }
                      }

                      // Refresh UI state (ledger + signals + list ordering)
                      await refreshSelectedArtworkEvents(selectedArtwork.id);
                      await fetchArtworks(user.id);
                      setShowSaleTransferForm(false);
                      showToast("success", "Ownership transfer recorded");
                    }}
                  >
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-amber-200/80">
                        Transfer details
                      </p>
                    </div>

                    <label className="block">
                      <span className="text-sm text-amber-100/70">
                        Seller (prefilled)
                      </span>
                      <input
                        value={saleTransferForm.seller_id}
                        onChange={(e) =>
                          setSaleTransferForm((p) => ({
                            ...p,
                            seller_id: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                        placeholder="Seller user id"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm text-amber-100/70">
                        Buyer
                      </span>
                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        <select
                          value={saleTransferForm.buyer_mode}
                          onChange={(e) =>
                            setSaleTransferForm((p) => ({
                              ...p,
                              buyer_mode: e.target.value as "user" | "external",
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                        >
                          <option value="external">External buyer</option>
                          <option value="user">Existing user</option>
                        </select>

                        {saleTransferForm.buyer_mode === "user" ? (
                          <input
                            value={saleTransferForm.buyer_user_id}
                            onChange={(e) =>
                              setSaleTransferForm((p) => ({
                                ...p,
                                buyer_user_id: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                            placeholder="Buyer user id (UUID)"
                          />
                        ) : (
                          <input
                            value={saleTransferForm.buyer_name}
                            onChange={(e) =>
                              setSaleTransferForm((p) => ({
                                ...p,
                                buyer_name: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                            placeholder="Buyer name"
                          />
                        )}
                      </div>

                      {saleTransferForm.buyer_mode === "external" ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <select
                            value={saleTransferForm.buyer_type}
                            onChange={(e) =>
                              setSaleTransferForm((p) => ({
                                ...p,
                                buyer_type: e.target.value as
                                  | "collector"
                                  | "gallery"
                                  | "institution"
                                  | "private"
                                  | "unknown",
                              }))
                            }
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                          >
                            <option value="collector">Collector</option>
                            <option value="gallery">Gallery</option>
                            <option value="institution">Institution</option>
                            <option value="private">Private</option>
                            <option value="unknown">Unknown</option>
                          </select>
                          <div className="text-xs text-amber-100/70 md:self-center">
                            External buyers don’t need an account.
                          </div>
                        </div>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="text-sm text-amber-100/70">
                        Sale type
                      </span>
                      <select
                        value={saleTransferForm.sale_type}
                        onChange={(e) =>
                          setSaleTransferForm((p) => ({
                            ...p,
                            sale_type: e.target.value as "primary" | "secondary",
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-sm text-amber-100/70">
                        Date of sale
                      </span>
                      <input
                        type="date"
                        value={saleTransferForm.sale_date}
                        onChange={(e) =>
                          setSaleTransferForm((p) => ({
                            ...p,
                            sale_date: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm text-amber-100/70">
                        Notes
                      </span>
                      <textarea
                        value={saleTransferForm.note}
                        onChange={(e) =>
                          setSaleTransferForm((p) => ({
                            ...p,
                            note: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                        rows={3}
                        placeholder="Optional context (invoice, venue, etc.)"
                      />
                    </label>
                    <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 md:flex-row md:items-center md:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowSaleTransferForm(false)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-2xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-200"
                      >
                        Save transfer
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            );
          })()}

          {/* Header */}
          <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
              {selectedArtwork.image_url ? (
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/15 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]">
                  <img
                    src={selectedArtwork.image_url}
                    alt={String(selectedArtwork.title || "Artwork")}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
              ) : (
                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/10">
                  <svg
                    className="h-14 w-14 text-white/15"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={0.7}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-sm text-emerald-300/75">
                  Ownership ledger
                </p>
                <h2 className="mt-3 font-serif text-3xl font-normal leading-[1.1] tracking-tight text-white md:text-[2.15rem]">
                  {selectedArtwork.registry_id ? (
                    <Link
                      href={`/artwork/${encodeURIComponent(selectedArtwork.registry_id)}`}
                      className="transition hover:text-emerald-200/90 hover:underline decoration-emerald-400/50 underline-offset-4"
                    >
                      {selectedArtwork.title}
                    </Link>
                  ) : (
                    selectedArtwork.title
                  )}
                </h2>
                {selectedArtwork.registry_id ? (
                  <p className="mt-2 inline-flex rounded-xl bg-white/[0.06] px-3 py-1.5 font-mono text-xs text-emerald-100/85 ring-1 ring-white/10">
                    {selectedArtwork.registry_id}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-8 xl:gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* Value Timeline */}
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/55 via-emerald-950/35 to-emerald-950/15 p-6 shadow-[inset_0_1px_0_0_rgba(52,211,153,0.12),0_24px_56px_-28px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-300/85">
                    Value history
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    Every declared value event for this work.
                  </p>
                </div>
              </div>

              <div className="relative min-h-0">
                <div className="pointer-events-none absolute bottom-0 left-2 top-2 w-px bg-gradient-to-b from-emerald-400/80 via-emerald-400/40 to-emerald-500/10" />
                <div
                  className="max-h-[min(52vh,34rem)] space-y-4 overflow-y-auto overscroll-y-contain pl-8 pr-1 [scrollbar-color:rgba(52,211,153,0.45)_transparent] [scrollbar-width:thin]"
                >
                  {valueHistory.length === 0 && (
                    <p className="text-emerald-200/70 text-sm">
                      No value events recorded yet.
                    </p>
                  )}

                  {valueHistory.map((event) => (
                    <div
                      key={event.id}
                      className="flex justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-3 text-white/85"
                    >
                      <div>
                        <p className="text-xs text-emerald-200/80">
                          {event.value_type.replace("_", " ")}
                        </p>
                        <p className="mt-1 text-sm text-emerald-100/90">
                          {event.note || "No additional context"}
                        </p>
                        <p className="mt-1 text-xs text-emerald-200/70">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-emerald-300">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: event.currency || "USD",
                            maximumFractionDigits: 0,
                          }).format(Number(event.declared_value))}
                        </p>
                        <p className="mt-1 text-xs text-emerald-200/70">
                          Visibility: {event.visibility_level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ownership Timeline */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm md:p-6">
                <p className="text-xs text-emerald-300/85">
                  Ownership history
                </p>
                <p className="mt-1 text-sm text-emerald-100/80">
                  Every transfer and confirmation for this work.
                </p>

                <div className="relative mt-5">
                  <div className="pointer-events-none absolute bottom-0 left-2 top-2 w-px bg-gradient-to-b from-white/35 via-white/15 to-transparent" />
                  <div className="h-[min(42vh,18rem)] space-y-5 overflow-y-auto overscroll-y-contain pl-8 pr-1 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin]">
                  {ownershipHistory.length === 0 && (
                    <p className="text-emerald-200/70 text-sm mt-4">
                      No ownership events recorded yet.
                    </p>
                  )}

                  {ownershipHistory.map((event, i) => {
                    const vStatus = normalizeVerificationStatus(
                      event.verification_status ?? "recorded"
                    );
                    const sysStatus = latestOwnershipSystemStatus(event);
                    const prevSys =
                      i > 0
                        ? latestOwnershipSystemStatus(ownershipHistory[i - 1])
                        : null;
                    const showTrustBreak =
                      prevSys != null &&
                      ownershipSystemTrustRank(sysStatus) !==
                        ownershipSystemTrustRank(prevSys);
                    const badge = ownershipStatusBadge(sysStatus, "light");
                    const isLatest = i === ownershipHistory.length - 1;
                    const ownerLabel = formatOwnershipOwnerPrimary(event, {
                      viewerUserId: user?.id,
                      artworkArtistId: selectedArtwork?.artist_id,
                      artistDisplayName:
                        profile?.display_name?.trim() ||
                        profile?.full_name?.trim() ||
                        null,
                    });
                    const subline = formatOwnershipLedgerSubtitle(event);
                    const rawNote = event.note ?? event.notes;
                    const noteStr =
                      typeof rawNote === "string" ? rawNote.trim() : "";
                    const locStr =
                      typeof event.location === "string"
                        ? event.location.trim()
                        : "";
                    const contextParts: string[] = [];
                    if (noteStr) contextParts.push(noteStr);
                    if (locStr && locStr !== noteStr) contextParts.push(locStr);
                    const contextNote =
                      contextParts.length > 0 ? contextParts.join(" · ") : null;

                    return (
                      <div key={event.id} className="relative">
                        {showTrustBreak ? (
                          <div
                            className="mb-5 border-t border-white/[0.06]"
                            aria-hidden
                          />
                        ) : null}
                        <div className="absolute -left-[14px] top-4 z-10 w-3 h-3 rounded-full border border-emerald-600/30 bg-white shadow-[0_0_0_3px_rgba(6,78,59,0.2)]" />
                        <div
                          className={`group relative rounded-2xl border px-4 py-3.5 transition-all duration-200 ease-out hover:-translate-y-0.5 opacity-0 animate-fadeIn shadow-[0_4px_20px_-12px_rgba(0,0,0,0.12)]
                            ${
                              isLatest
                                ? "border-emerald-300/60 bg-white/[0.97] ring-1 ring-emerald-500/20 hover:bg-white"
                                : "border-black/[0.08] bg-white/[0.94] hover:bg-white"
                            }`}
                          style={{ animationDelay: `${i * 45}ms` }}
                        >
                          {isLatest ? (
                            <p className="text-sm text-neutral-500 mb-2">
                              Current owner
                            </p>
                          ) : null}
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <p className="text-[15px] font-medium text-neutral-900 tracking-tight">
                              {ownerLabel}
                            </p>
                            <span className={badge.className}>{badge.label}</span>
                          </div>
                          <p className="mt-1.5 text-[13px] text-neutral-600 leading-snug">
                            {subline}
                          </p>
                          {vStatus === "claimed" && user?.id ? (() => {
                            const claimHolder =
                              event.to_user_id ??
                              (event as { to_owner_id?: string }).to_owner_id ??
                              "";
                            const claimedByYou =
                              claimHolder &&
                              String(claimHolder) === user.id;
                            const claimedByOther =
                              claimHolder &&
                              String(claimHolder) !== user.id;
                            const claimedMsg = claimedByYou
                              ? "You have claimed ownership"
                              : claimedByOther
                                ? "Ownership claimed by another collector"
                                : null;
                            return claimedMsg ? (
                              <p className="mt-1 text-[11px] text-neutral-600 leading-snug">
                                {claimedMsg}
                              </p>
                            ) : null;
                          })() : null}
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {new Date(event.created_at).toLocaleString()}
                          </p>
                          {contextNote ? (
                            <p className="mt-2 text-xs text-neutral-600 leading-relaxed border-t border-neutral-200/90 pt-2">
                              {contextNote}
                            </p>
                          ) : null}
                          <p className="mt-2 text-[11px] text-neutral-500">
                            From{" "}
                            <span className="text-neutral-800">
                              {formatOwnershipParty(event, "from")}
                            </span>
                          </p>
                          {(isLatest &&
                            vStatus === "recorded" &&
                            user?.id &&
                            isLatestOwnershipAssigned(event)) ||
                          (userIsAdmin &&
                            (vStatus === "recorded" ||
                              vStatus === "claimed") &&
                            isLatestOwnershipAssigned(event)) ? (
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-100">
                              {isLatest &&
                              vStatus === "recorded" &&
                              user?.id &&
                              isLatestOwnershipAssigned(event) ? (
                                <button
                                  type="button"
                                  disabled={ownershipUiBusyId === event.id}
                                  onClick={() =>
                                    setOwnershipActionConfirm({
                                      variant: "request_verification",
                                      eventId: String(event.id),
                                    })
                                  }
                                  className="text-[11px] font-medium text-neutral-600 hover:text-emerald-800 disabled:opacity-50"
                                >
                                  {ownershipUiBusyId === event.id
                                    ? "Submitting…"
                                    : "Request verification"}
                                </button>
                              ) : null}
                              {userIsAdmin &&
                              (vStatus === "recorded" ||
                                vStatus === "claimed") ? (
                                <button
                                  type="button"
                                  disabled={ownershipUiBusyId === event.id}
                                  onClick={() =>
                                    setOwnershipActionConfirm({
                                      variant: "admin_verify",
                                      eventId: String(event.id),
                                    })
                                  }
                                  className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-emerald-700 disabled:opacity-50"
                                >
                                  {ownershipUiBusyId === event.id
                                    ? "Verifying…"
                                    : "Verify ownership"}
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                <p className="text-xs text-emerald-200/85">
                  Integrity notes
                </p>
                <p className="mt-2 text-sm text-emerald-50/90">
                  Any anomalies or special situations with this work’s
                  ownership journey will appear here.
                </p>

                {ownershipHistory.length > 0 ? (
                  <ul
                    className={
                      ownershipHistory.length > 3
                        ? "mt-4 max-h-[min(28vh,12rem)] space-y-2 overflow-y-auto overscroll-y-contain pr-1 text-sm text-emerald-100/80 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin]"
                        : "mt-4 space-y-2 text-sm text-emerald-100/80"
                    }
                  >
                    {ownershipHistory.map((event) => {
                      const st = latestOwnershipSystemStatus(event);
                      const b = ownershipStatusBadge(st, "dark");
                      return (
                        <li key={event.id} className="leading-relaxed">
                          <span className={b.className}>{b.label}</span>
                          <span className="text-emerald-100/70">
                            {" "}
                            · {event.transfer_type.replace("_", " ")} on{" "}
                            {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-emerald-200/70">
                    No integrity data available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </ModalShell>

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

    <OwnershipLedgerActionConfirmModal
      isOpen={ownershipActionConfirm !== null}
      onClose={() => setOwnershipActionConfirm(null)}
      variant={ownershipActionConfirm?.variant ?? "admin_verify"}
      pending={
        ownershipActionConfirm !== null &&
        ownershipUiBusyId === ownershipActionConfirm.eventId
      }
      onConfirm={async () => {
        if (!ownershipActionConfirm) return;
        const { variant, eventId } = ownershipActionConfirm;
        try {
          if (variant === "admin_verify") {
            await adminVerifyOwnership(eventId);
          } else {
            await requestOwnershipVerification(eventId);
          }
        } finally {
          setOwnershipActionConfirm(null);
        }
      }}
    />
  </div>
);}

function DashboardSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="border-b border-black/[0.06] pb-4">
        <h3 className="text-sm font-semibold text-neutral-500">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DashboardStatBar({
  label,
  percent,
  hint,
  barClass = "bg-neutral-800",
}: {
  label: string;
  percent: number;
  hint: string;
  barClass?: string;
}) {
  const w = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <span className="font-serif text-xl tabular-nums text-neutral-950">
          {percent}
          <span className="text-sm font-sans text-neutral-400">%</span>
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-400">
        {hint}
      </p>
      <div className="mt-3 h-px overflow-hidden bg-neutral-200/80">
        <div
          className={`h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${barClass}`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  compact,
  tone: _tone = "emerald",
}: {
  label: string;
  value: any;
  hint?: string;
  compact?: boolean;
  tone?: "emerald" | "neutral" | "amber";
}) {
  return (
    <div className={compact ? "py-2" : "py-3"}>
      <p className="text-sm font-medium text-neutral-500">
        {label}
        {hint ? (
          <span title={hint} className="ml-1 cursor-help text-neutral-400">
            ·
          </span>
        ) : null}
      </p>
      <p
        className={`mt-2 font-serif font-normal tabular-nums tracking-tight text-neutral-950 ${
          compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}