"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { WelcomeModal } from "@/components/ui/IntroModal";
import { collectorIntroSteps } from "@/components/ui/intro-content";
import { useStudioGuardUser } from "@/components/Studio/StudioRouteGuard";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { StudioShell } from "@/components/Studio/StudioShell";
import { WorkspaceShellFooterLinks } from "@/components/Studio/WorkspaceShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  buildCollectorNavItems,
  consumePendingCollectorSection,
} from "@/lib/studio-nav";
import { fillMessage } from "@/lib/locale-messages";
import type { PendingAcquisitionRow } from "@/lib/acquisition-ownership-loop";
import {
  mergeCollectorPortfolioRows,
  pendingAcquisitionToGhostRow,
  type CollectorPortfolioRow,
} from "@/lib/collector-pending-works";
import {
  getCollectorOwnedArtworkIds,
  sortPortfolioRows,
} from "@/lib/collector-portfolio";
import { getTransferredArtworkIds } from "@/lib/ownership-resolver";
import { OWNERSHIP_EVENT_COLLECTOR_STATUS_SELECT } from "@/lib/ownership-events-schema";
import type { CollectorPortfolioFilter } from "@/lib/ownership-surface-state";
import {
  latestOwnershipSystemStatus,
  normalizeVerificationStatus,
  ownershipStatusBadge,
  type OwnershipSystemStatus,
} from "@/lib/ownership-ledger";
import { translateOwnershipStatusLabel } from "@/lib/ownership-ledger-i18n";
import { getUnresolvedSaleSignals } from "@/lib/studio-signals";
import { testModeEnabled } from "@/lib/test-mode";
import { TestDataControls } from "@/components/Admin/TestDataControls";
import { CollectorStudioActivityPreview } from "@/components/Studio/CollectorStudioActivityPreview";
import { CollectorHoldingSlab } from "@/components/Studio/CollectorHoldingSlab";
import { CollectorHoldingsGallery } from "@/components/Studio/CollectorHoldingsGallery";
import {
  StudioViewToggle,
  useStudioViewMode,
} from "@/components/Studio/StudioViewToggle";
import { CollectorWorkspaceHero } from "@/components/Studio/CollectorWorkspaceHero";
import {
  StudioRoleBand,
  studioRoleBandCopy,
} from "@/components/Studio/StudioRoleBand";
import { CollectorWorkspaceOverview } from "@/components/Studio/CollectorWorkspaceOverview";
import { StudioCatalogueMetricsPanels } from "@/components/Studio/StudioCatalogueMetricsPanels";
import {
  StudioContentSlab,
  studioOverviewStackClass,
} from "@/components/Studio/StudioContentSlab";
import { DataInsightModal } from "@/components/Insights/DataInsightModal";
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
import { formatCurrency } from "@/lib/formatCurrency";
import {
  certificateStatusMapToCollectorRecord,
  fetchCertificatePublicStatusByArtworkIds,
} from "@/lib/fetch-certificate-public-status-map";

type Row = CollectorPortfolioRow & {
  artist_id: string | null;
};

type CollectorProfile = {
  user_id: string;
  display_name: string | null;
  slug: string;
  location: string | null;
  is_public: boolean | null;
  anonymous_on_public: boolean | null;
};

type CollectionSnapshot = {
  held: number;
  verifiedOwnership: number;
  pendingVerification: number;
  pendingTransfer: number;
  ownershipClaims: number;
  certificatesAvailable: number;
};

export default function CollectorStudioPage() {
  const { t } = useLocalePreferences();
  const { track } = useTelemetry();
  const sb = useSupabaseBrowserLazy();
  const guardUser = useStudioGuardUser();
  const userId = guardUser?.userId ?? null;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [pendingAcquisitions, setPendingAcquisitions] = useState<
    PendingAcquisitionRow[]
  >([]);
  const [artistNames, setArtistNames] = useState<Record<string, string>>({});
  const [certByArtwork, setCertByArtwork] = useState<
    Record<string, { has_certificate: boolean; revoked: boolean }>
  >({});
  const [sortMode, setSortMode] = useState<"activity" | "value">("activity");
  const [worksView, setWorksView] = useStudioViewMode("collector.worksView");
  const handleWorksViewChange = useCallback(
    (mode: "ledger" | "gallery") => {
      setWorksView(mode);
      track({
        eventName: "view_mode_changed",
        surface: "studio",
        actorRole: "collector",
        metadata: { section: "collector", mode },
      });
    },
    [setWorksView, track]
  );
  const [portfolioFilter, setPortfolioFilter] =
    useState<CollectorPortfolioFilter>("current");
  const [transferredRows, setTransferredRows] = useState<Row[]>([]);
  const [latestOwnershipByArt, setLatestOwnershipByArt] = useState<
    Record<string, { status: OwnershipSystemStatus; className: string }>
  >({});
  const [studioAttention, setStudioAttention] = useState<{
    claimed: { registryId: string; title: string }[];
    unresolvedSales: { registryId: string; title: string }[];
    unverifiedOwnership: { registryId: string; title: string }[];
  }>({ claimed: [], unresolvedSales: [], unverifiedOwnership: [] });
  const [priorityValueEventIds, setPriorityValueEventIds] = useState<string[]>(
    []
  );
  const [priorityOwnershipEventIds, setPriorityOwnershipEventIds] = useState<
    string[]
  >([]);
  const [signalMaps, setSignalMaps] = useState<{
    pendingSale: Set<string>;
    unverified: Set<string>;
  }>({ pendingSale: new Set(), unverified: new Set() });
  const [collectorProfile, setCollectorProfile] =
    useState<CollectorProfile | null>(null);
  const [collectionSnapshot, setCollectionSnapshot] =
    useState<CollectionSnapshot | null>(null);
  const [activeSection, setActiveSection] = useState<
    "workspace" | "works" | "attention"
  >("workspace");
  const [isTransitioningSection, setIsTransitioningSection] = useState(false);
  const [catalogueMetrics, setCatalogueMetrics] =
    useState<StudioCatalogueMetrics | null>(null);
  const [insightOpen, setInsightOpen] = useState<null | "value" | "health">(
    null
  );
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

  useEffect(() => {
    const pending = consumePendingCollectorSection();
    if (pending) setActiveSection(pending);
  }, []);

  const selectSection = useCallback((id: string) => {
    if (
      id !== "workspace" &&
      id !== "works" &&
      id !== "attention"
    ) {
      return;
    }
    if (id === activeSection) return;
    setIsTransitioningSection(true);
    window.setTimeout(() => {
      setActiveSection(id);
      setIsTransitioningSection(false);
    }, 180);
  }, [activeSection]);

  useEffect(() => {
    const uid = guardUser?.userId;
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void (async () => {
      try {
      const pendingRes = await fetch("/api/collector/pending-acquisitions", {
        credentials: "include",
      });
      const pendingPayload = (await pendingRes.json().catch(() => ({}))) as {
        pending_acquisitions?: PendingAcquisitionRow[];
      };
      const pendingList = Array.isArray(pendingPayload.pending_acquisitions)
        ? pendingPayload.pending_acquisitions
        : [];

      if (!cancelled) {
        setPendingAcquisitions(pendingList);
      }

      const { data: cp } = await sb()
        .from("collector_profiles")
        .select(
          "user_id, display_name, slug, location, is_public, anonymous_on_public"
        )
        .eq("user_id", uid)
        .maybeSingle();
      if (!cancelled && cp) setCollectorProfile(cp);

      const pendingCount = pendingList.length;

      const ownedIds = await getCollectorOwnedArtworkIds(sb(), uid);

      let heldRows: Row[] = [];

      if (ownedIds.length > 0) {
        const { data: artRows, error } = await sb()
          .from("artwork_read_model")
          .select(
            "id, title, registry_id, image_url, artist_id, verification_status, latest_value, latest_currency, latest_transfer_at, created_at, initial_value, initial_currency, ownership_transfer_count, first_transfer_at"
          )
          .in("id", ownedIds);

        if (error) {
          throw error;
        }

        heldRows = (artRows || []).map((row) => ({
          ...(row as Row),
          portfolio_status: "held" as const,
        }));
      }

      const mergedRows = mergeCollectorPortfolioRows(heldRows, pendingList) as Row[];

      let soldRows: Row[] = [];
      const transferredIds = await getTransferredArtworkIds(sb(), uid);
      if (transferredIds.length > 0) {
        const { data: soldArt } = await sb()
          .from("artwork_read_model")
          .select(
            "id, title, registry_id, image_url, artist_id, verification_status, latest_value, latest_currency, latest_transfer_at, created_at, initial_value, initial_currency, ownership_transfer_count, first_transfer_at"
          )
          .in("id", transferredIds);
        soldRows = (soldArt || []).map((row) => ({
          ...(row as Row),
          portfolio_status: "sold" as const,
        }));
      }

      if (!cancelled) {
        setTransferredRows(soldRows);
      }

      if (mergedRows.length === 0 && soldRows.length === 0) {
        if (!cancelled) {
          setRows([]);
          setStudioAttention({
            claimed: [],
            unresolvedSales: [],
            unverifiedOwnership: [],
          });
          setCollectionSnapshot({
            held: 0,
            verifiedOwnership: 0,
            pendingVerification: 0,
            pendingTransfer: pendingCount,
            ownershipClaims: 0,
            certificatesAvailable: 0,
          });
          setPriorityValueEventIds([]);
          setPriorityOwnershipEventIds([]);
          setSignalMaps({ pendingSale: new Set(), unverified: new Set() });
        }
        return;
      }


      const list = heldRows;
      const portfolioRows = mergedRows;
      const artistIds = [
        ...new Set(list.map((r) => r.artist_id).filter(Boolean)),
      ] as string[];
      const nameMap: Record<string, string> = {};
      if (artistIds.length) {
        const { data: artists } = await sb()
          .from("artists")
          .select("id, display_name, full_name")
          .in("id", artistIds);
        for (const a of artists || []) {
          nameMap[String(a.id)] =
            a.display_name?.trim() || a.full_name?.trim() || t("collector.fallback.artist");
        }
      }
      setArtistNames(nameMap);

      const certStatusMap = await fetchCertificatePublicStatusByArtworkIds(
        sb(),
        ownedIds
      );
      const certMap = certificateStatusMapToCollectorRecord(certStatusMap);
      setCertByArtwork(certMap);

      const { data: ownEv } = await sb()
        .from("ownership_events")
        .select(OWNERSHIP_EVENT_COLLECTOR_STATUS_SELECT)
        .in("artwork_id", ownedIds)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      const latestMap: Record<
        string,
        { status: OwnershipSystemStatus; className: string }
      > = {};
      const seenFirst = new Set<string>();
      const latestNorm = new Map<
        string,
        ReturnType<typeof normalizeVerificationStatus>
      >();
      const claimedArtworkIds = new Set<string>();
      const priorityOe: string[] = [];

      for (const o of ownEv || []) {
        const aid = String(o.artwork_id || "");
        if (!aid) continue;
        if (String(o.verification_status || "").toLowerCase() === "claimed") {
          priorityOe.push(String(o.id));
          claimedArtworkIds.add(aid);
        }
        if (!seenFirst.has(aid)) {
          seenFirst.add(aid);
          const st = normalizeVerificationStatus(o.verification_status);
          latestNorm.set(aid, st);
          latestMap[aid] = {
            status: latestOwnershipSystemStatus(o as Record<string, unknown>),
            className: ownershipStatusBadge(
              latestOwnershipSystemStatus(o as Record<string, unknown>),
              "light"
            ).className,
          };
        }
      }
      setLatestOwnershipByArt(latestMap);

      const regById: Record<string, string> = {};
      const titleById: Record<string, string> = {};
      for (const r of portfolioRows) {
        titleById[r.id] = (r.title || "").trim() || t("collector.fallback.untitled");
        if (r.registry_id) regById[r.id] = r.registry_id;
      }
      const toLink = (aid: string) => {
        const reg = regById[aid];
        if (!reg) return null;
        return { registryId: reg, title: titleById[aid] || t("collector.fallback.work") };
      };

      const claimedLinks = [...claimedArtworkIds]
        .map(toLink)
        .filter(Boolean) as { registryId: string; title: string }[];

      const unverifiedIds = ownedIds.filter(
        (aid) => latestNorm.get(aid) !== "verified"
      );
      const unverifiedLinks = unverifiedIds
        .map(toLink)
        .filter(Boolean) as { registryId: string; title: string }[];

      const { artworkIds: unresolvedArtIds, valueEventIds } =
        await getUnresolvedSaleSignals(sb(), ownedIds);
      const unresolvedLinks = unresolvedArtIds
        .map(toLink)
        .filter(Boolean) as { registryId: string; title: string }[];

      const verifiedOwnership = ownedIds.filter(
        (aid) => latestNorm.get(aid) === "verified"
      ).length;

      let certificatesAvailable = 0;
      for (const aid of ownedIds) {
        const cert = certMap[aid];
        const row = list.find((x) => x.id === aid);
        const artVerified =
          String(row?.verification_status || "").toLowerCase() === "verified";
        if (cert?.has_certificate && !cert.revoked && artVerified) {
          certificatesAvailable += 1;
        }
      }

      setStudioAttention({
        claimed: claimedLinks,
        unresolvedSales: unresolvedLinks,
        unverifiedOwnership: unverifiedLinks,
      });
      setPriorityValueEventIds([...valueEventIds]);
      setPriorityOwnershipEventIds(priorityOe);
      setSignalMaps({
        pendingSale: new Set(unresolvedArtIds),
        unverified: new Set(unverifiedIds),
      });

      setCollectionSnapshot({
        held: portfolioRows.length,
        verifiedOwnership,
        pendingVerification: unverifiedLinks.length,
        pendingTransfer: unresolvedLinks.length + pendingCount,
        ownershipClaims: claimedLinks.length,
        certificatesAvailable,
      });

      try {
        const metrics = await fetchStudioCatalogueMetrics(sb(), {
          role: "collector",
          userId: uid,
          artworks: list,
        });
        if (!cancelled) setCatalogueMetrics(metrics);
      } catch {
        if (!cancelled) setCatalogueMetrics(null);
      }

      if (!cancelled) {
        setRows(heldRows);
      }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(t("studio.toast.connectionInterrupted"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guardUser?.userId, sb, t]);

  const sorted = useMemo(() => {
    if (portfolioFilter === "pending") {
      return pendingAcquisitions.map((item) =>
        pendingAcquisitionToGhostRow(item)
      ) as Row[];
    }
    if (portfolioFilter === "sold") {
      return sortPortfolioRows(transferredRows, sortMode);
    }
    return sortPortfolioRows(rows, sortMode);
  }, [portfolioFilter, pendingAcquisitions, transferredRows, rows, sortMode]);

  const portfolioForActivity = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        registry_id: r.registry_id,
        title: r.title,
      })),
    [rows]
  );

  const displayName =
    collectorProfile?.display_name?.trim() ||
    collectorProfile?.slug ||
    t("collector.fallback.collector");
  const locationLine = collectorProfile?.location?.trim() || null;

  const publicCollectionHref = useMemo(() => {
    const s = collectorProfile?.slug?.trim();
    if (!s) return null;
    return `/collector-studio/${encodeURIComponent(s)}`;
  }, [collectorProfile?.slug]);

  const heroPreviewArtworks = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        image_url: r.image_url,
        title: r.title,
        registry_id: r.registry_id,
      })),
    [rows]
  );

  const intelligenceItems = useMemo(() => {
    const items: { key: string; text: string; href: string }[] = [];
    for (const x of studioAttention.unverifiedOwnership) {
      items.push({
        key: `uv-${x.registryId}`,
        text: fillMessage(t("collector.attention.verificationPending"), {
          title: x.title,
        }),
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    for (const x of studioAttention.unresolvedSales) {
      items.push({
        key: `sale-${x.registryId}`,
        text: fillMessage(t("collector.attention.transferResolve"), {
          title: x.title,
        }),
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    for (const x of studioAttention.claimed) {
      items.push({
        key: `claim-${x.registryId}`,
        text: fillMessage(t("collector.attention.claimInProgress"), {
          title: x.title,
        }),
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    return items;
  }, [studioAttention, t]);

  const collectorNavItems = useMemo(
    () =>
      buildCollectorNavItems(t, {
        attentionItemCount: intelligenceItems.length,
      }),
    [intelligenceItems.length, t]
  );

  const openInsight = useCallback(
    async (kind: "value" | "health") => {
      if (!userId || rows.length === 0) return;
      setInsightOpen(kind);
      setInsightLoading(true);
      setInsightData([]);
      setInsightLines([]);
      setInsightBreakdown([]);
      setInsightDataNotes([]);

      const artworkIds = rows.map((row) => row.id).filter(Boolean);
      try {
        const insights = await getDashboardInsights({
          supabase: sb(),
          userId,
          artworkIds,
        });

        if (kind === "health") {
          const h = insights.health;
          const healthBreakdown = buildHealthInsightBreakdown({
            health: h,
            role: "collector",
            t,
          });
          setInsightKind("bar");
          setInsightTitle(t("studio.insight.title.health"));
          setInsightSubtitle(
            translateRoleInsight("collector", { health: h }, t)
          );
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
            role: "collector",
            userId,
            artworks: rows,
          }));
        if (!catalogueMetrics) setCatalogueMetrics(metrics);

        const { series, currencies } = insights.valueTrend;
        const valueBreakdown = buildValueInsightBreakdown({
          role: "collector",
          metrics,
          latestValues: insights.valueTrend.latestValues,
          t,
          formatCurrency,
        });
        setInsightKind("line");
        setInsightTitle(t("studio.insight.title.valueCollector"));
        setInsightSubtitle(
          translateRoleInsight("collector", { valueTrend: insights.valueTrend }, t)
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
    },
    [catalogueMetrics, rows, sb, t, userId]
  );

  if (loading) {
    return (
      <div className="ds-page-environment relative min-h-screen pt-28 text-neutral-900">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
          aria-hidden
        />
        <p className="text-center text-sm text-neutral-500">{t("collector.shell.loading")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ds-page-environment flex min-h-screen flex-col items-center justify-center px-6 pt-28 text-center text-neutral-900">
        <p className="max-w-md text-sm text-neutral-600">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="v2-cta-secondary mt-6 min-h-[44px] px-6 py-2.5 text-xs"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  const snap = collectionSnapshot;

  const footerExtra = (
    <>
      {publicCollectionHref ? (
        <Link
          href={publicCollectionHref}
          className="mt-4 block text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
        >
          {t("collector.shell.publicCollection")} →
        </Link>
      ) : null}
      <p className="mt-6 text-xs leading-relaxed text-neutral-400">
        {t("collector.shell.publicListingsNote")}
      </p>
    </>
  );

  return (
    <>
    <WelcomeModal role="collector" steps={collectorIntroSteps} />
    <StudioShell
      role="collector"
      userId={userId}
      atmosphereClassName="ds-page-environment"
      navItems={collectorNavItems}
      activeId={activeSection}
      onSelect={selectSection}
      isTransitioning={isTransitioningSection}
      footerExtra={footerExtra}
      sidebarActivity={
        <CollectorStudioActivityPreview
          userId={userId}
          portfolio={portfolioForActivity}
          priorityValueEventIds={priorityValueEventIds}
          priorityOwnershipEventIds={priorityOwnershipEventIds}
          limit={8}
        />
      }
      activityHeading={t("studio.shell.recentNotes")}
    >
      {activeSection === "workspace" ? (
        <>
          {testModeEnabled() ? (
            <div className="mt-6 rounded-xl border border-neutral-900/[0.06] bg-white/35 px-4 py-6 sm:px-6">
              <TestDataControls />
            </div>
          ) : null}

          <div className={`max-w-6xl pb-8 ${testModeEnabled() ? "mt-8" : "mt-6"} ${studioOverviewStackClass}`}>
            <StudioRoleBand
              role="collector"
              {...studioRoleBandCopy("collector", t)}
              metrics={[
                {
                  label: t("collector.hero.ownershipOnRecord"),
                  value: snap?.held ?? rows.length,
                },
                {
                  label: t("collector.hero.verifiedOwnership"),
                  value: snap?.verifiedOwnership,
                },
                {
                  label: t("collector.hero.continuity"),
                  value: intelligenceItems.length,
                },
              ]}
            />
            <CollectorWorkspaceHero
              displayName={displayName}
              location={locationLine}
              publicPageHref={publicCollectionHref}
              previewArtworks={heroPreviewArtworks}
              metrics={{
                holdings: snap?.held ?? rows.length,
                verified: snap?.verifiedOwnership ?? 0,
                transfers: snap?.pendingTransfer ?? 0,
                certificates: snap?.certificatesAvailable ?? 0,
              }}
              snapshot={{
                attentionCount: intelligenceItems.length,
                profilePublic: Boolean(collectorProfile?.is_public),
                anonymousOnPublic: Boolean(collectorProfile?.anonymous_on_public),
              }}
              onGoToSection={(section) => selectSection(section)}
            />
            <CollectorWorkspaceOverview
              snapshot={
                snap
                  ? {
                      ...snap,
                      attentionCount: intelligenceItems.length,
                    }
                  : null
              }
            />

            {pendingAcquisitions.length > 0 ? (
              <StudioContentSlab
                title="Pending acquisitions"
                subtitle="Confirm receipt to complete ownership on the registry ledger."
              >
                <ul className="grid gap-3 sm:grid-cols-2">
                  {pendingAcquisitions.slice(0, 4).map((item) => (
                    <li
                      key={item.provenance_transfer_id}
                      className="flex gap-3 rounded-xl border border-amber-200/40 bg-amber-50/40 p-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200/80">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-full w-full object-cover opacity-80"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-neutral-900">
                          {(item.title || "").trim() || t("collector.fallback.untitled")}
                        </p>
                        <p className="text-[12px] text-neutral-500">
                          Pending transfer · {item.registry_id || "–"}
                        </p>
                        {item.accept_href ? (
                          <Link
                            href={item.accept_href}
                            className="mt-2 inline-flex rounded-lg bg-neutral-950 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-neutral-800"
                          >
                            Confirm receipt
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </StudioContentSlab>
            ) : null}

            {rows.length > 0 ? (
              <>
                <StudioContentSlab
                  title={t("studio.overview.recordHealth")}
                  subtitle={t("collector.overview.recordHealthSubtitle")}
                >
                  <button
                    type="button"
                    onClick={() => void openInsight("health")}
                    className="grid w-full gap-4 text-left sm:grid-cols-3"
                  >
                    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/70 px-5 py-4">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {t("collector.hero.verifiedOwnership")}
                      </p>
                      <p className="mt-2 font-serif text-2xl tabular-nums text-neutral-950">
                        {snap && snap.held > 0
                          ? `${Math.round((snap.verifiedOwnership / snap.held) * 100)}%`
                          : "–"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/70 px-5 py-4">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {t("collector.hero.continuity")}
                      </p>
                      <p className="mt-2 font-serif text-2xl tabular-nums text-neutral-950">
                        {intelligenceItems.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/70 px-5 py-4">
                      <p className="text-[13px] font-medium text-neutral-700">
                        {t("studio.insight.bar.certified")}
                      </p>
                      <p className="mt-2 font-serif text-2xl tabular-nums text-neutral-950">
                        {snap?.certificatesAvailable ?? 0}
                      </p>
                    </div>
                  </button>
                </StudioContentSlab>

                <StudioCatalogueMetricsPanels
                  role="collector"
                  metrics={catalogueMetrics}
                  onOpenValueInsight={() => void openInsight("value")}
                />
              </>
            ) : null}
          </div>
        </>
      ) : null}

      {activeSection === "works" ? (
        <section className="studio-reveal max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[var(--v2-border)] pb-5">
            <div>
              <p className="v2-type-mono text-[10px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("collector.archive.rail")}
              </p>
              <h2 className="v2-type-display mt-2 text-[1.5rem] leading-none text-[var(--v2-ink)] md:text-[1.75rem]">
                {t("collector.archive.holdingsTitle")}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="collector-portfolio-filter">
                Filter works
              </label>
              <select
                id="collector-portfolio-filter"
                value={portfolioFilter}
                onChange={(e) =>
                  setPortfolioFilter(e.target.value as CollectorPortfolioFilter)
                }
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800"
              >
                <option value="current">
                  Current ({rows.length})
                </option>
                <option value="pending">
                  Pending ({pendingAcquisitions.length})
                </option>
                <option value="sold">
                  Sold / transferred ({transferredRows.length})
                </option>
              </select>
              <StudioViewToggle
                mode={worksView}
                onChange={handleWorksViewChange}
                label={t("collector.works.viewLabel")}
                ledgerLabel={t("collector.works.viewLedger")}
                galleryLabel={t("collector.works.viewGallery")}
              />
            </div>
            {sorted.length > 0 ? (
              <p className="text-xs text-neutral-400">
                <span className="text-neutral-500">{t("collector.works.order")}</span>{" "}
                <button
                  type="button"
                  onClick={() => setSortMode("activity")}
                  className={
                    sortMode === "activity"
                      ? "text-neutral-900 underline decoration-neutral-900/25 underline-offset-4"
                      : "underline decoration-transparent underline-offset-4 hover:text-neutral-700"
                  }
                >
                  {t("collector.works.sortRecency")}
                </button>
                <span className="mx-2 text-neutral-300" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setSortMode("value")}
                  className={
                    sortMode === "value"
                      ? "text-neutral-900 underline decoration-neutral-900/25 underline-offset-4"
                      : "underline decoration-transparent underline-offset-4 hover:text-neutral-700"
                  }
                >
                  {t("collector.works.sortValue")}
                </button>
              </p>
            ) : null}
          </div>

          {pendingAcquisitions.length > 0 ? (
            <div className="mt-8 space-y-3">
              <h3 className="text-[13px] font-medium uppercase tracking-[0.12em] text-amber-900/70">
                Pending acquisitions
              </h3>
              <ul className="space-y-3">
                {pendingAcquisitions.map((item) => {
                  const title =
                    (item.title || "").trim() || t("collector.fallback.untitled");
                  const reg = item.registry_id?.trim() || "–";
                  return (
                    <li
                      key={item.provenance_transfer_id}
                      className="relative overflow-hidden rounded-xl border border-[var(--v2-border-strong)] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)]"
                    >
                      <span
                        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[var(--v2-amber-exception)] opacity-80"
                        aria-hidden
                      />
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--v2-paper-sunk,#efe9df)]">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt=""
                              className="h-full w-full object-cover opacity-75"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-lg text-neutral-950">{title}</p>
                          <p className="mt-1 font-mono text-[12px] text-neutral-500">{reg}</p>
                          <p className="mt-2 text-[13px] text-neutral-600">
                            Pending transfer: confirm receipt to complete ownership.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.accept_href ? (
                              <Link
                                href={item.accept_href}
                                className="rounded-xl bg-neutral-950 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800"
                              >
                                Confirm receipt
                              </Link>
                            ) : null}
                            {item.deal_id ? (
                              <Link
                                href={`/studio/deals?deal=${encodeURIComponent(item.deal_id)}`}
                                className="rounded-xl border border-neutral-900/10 bg-white px-4 py-2 text-[13px] font-medium text-neutral-800 transition hover:bg-neutral-50"
                              >
                                Open deal
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {sorted.length === 0 && pendingAcquisitions.length === 0 ? (
            <div className="studio-reveal mt-10 max-w-xl border border-[var(--v2-border)] bg-white/80 px-5 py-6 sm:px-6 sm:py-7">
              <p className="v2-type-display text-[1.25rem] leading-snug text-[var(--v2-ink)]">
                {t("collector.works.emptyTitle")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--v2-ink-muted)]">
                {t("collector.works.emptyBody")}
              </p>
            </div>
          ) : worksView === "gallery" ? (
            <CollectorHoldingsGallery
              items={sorted.map((r) => {
                const isPending = r.portfolio_status === "pending_transfer";
                return {
                  id: r.id,
                  href: isPending
                    ? r.accept_href ||
                      (r.registry_id
                        ? `/registry/${encodeURIComponent(r.registry_id)}/ledger`
                        : "#")
                    : r.registry_id
                      ? `/collector-studio/artwork/${encodeURIComponent(r.registry_id)}`
                      : "#",
                  title: (r.title || "").trim() || t("collector.fallback.untitled"),
                  artist:
                    r.artist_id && artistNames[r.artist_id]
                      ? artistNames[r.artist_id]
                      : t("collector.fallback.artist"),
                  registryId: r.registry_id?.trim() || "–",
                  imageUrl: r.image_url,
                  verificationStatus: r.verification_status,
                  isPending,
                };
              })}
            />
          ) : (
            <ul className="studio-reveal-stagger mt-8 space-y-3 sm:space-y-4">
              {sorted.map((r, index) => {
                const reg = r.registry_id?.trim() || "–";
                const title = (r.title || "").trim() || t("collector.fallback.untitled");
                const artist =
                  r.artist_id && artistNames[r.artist_id]
                    ? artistNames[r.artist_id]
                    : t("collector.fallback.artist");
                const isPending = r.portfolio_status === "pending_transfer";
                const ownEntry = isPending
                  ? {
                      status: "claimed" as OwnershipSystemStatus,
                      className: "text-[var(--v2-amber-exception)]",
                    }
                  : (latestOwnershipByArt[r.id] ?? null);
                const ownLabel = isPending
                  ? t("collector.works.transferPending")
                  : ownEntry
                    ? translateOwnershipStatusLabel(ownEntry.status, t)
                    : null;
                const href = isPending
                  ? r.accept_href || (r.registry_id ? `/registry/${encodeURIComponent(r.registry_id)}/ledger` : "#")
                  : r.registry_id
                    ? `/collector-studio/artwork/${encodeURIComponent(r.registry_id)}`
                    : "#";
                const cert = certByArtwork[r.id];
                return (
                  <div key={r.id} style={{ "--reveal-index": index } as CSSProperties}>
                    <CollectorHoldingSlab
                      href={href}
                      title={title}
                      artist={artist}
                      registryId={reg}
                      imageUrl={r.image_url}
                      verificationStatus={r.verification_status}
                      hasCertificate={Boolean(cert?.has_certificate)}
                      certificateRevoked={Boolean(cert?.revoked)}
                      ownershipLabel={ownLabel}
                      ownershipClassName={ownEntry?.className}
                      transferCount={r.ownership_transfer_count}
                      isPending={isPending}
                      transferPending={!isPending && signalMaps.pendingSale.has(r.id)}
                      verificationOutstanding={!isPending && signalMaps.unverified.has(r.id)}
                    />
                  </div>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {activeSection === "attention" ? (
        <section>
          <h2 className="font-serif text-xl font-normal text-neutral-900">
            {t("collector.attention.title")}
          </h2>
          {intelligenceItems.length === 0 ? (
            <p className="mt-8 text-sm leading-relaxed text-neutral-500">
              {t("collector.attention.empty")}
            </p>
          ) : (
            <ul className="mt-10 space-y-6">
              {intelligenceItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-[15px] leading-snug text-neutral-800 underline decoration-neutral-900/15 underline-offset-[6px] transition hover:decoration-neutral-900/40"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </StudioShell>

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
    </>
  );
}
