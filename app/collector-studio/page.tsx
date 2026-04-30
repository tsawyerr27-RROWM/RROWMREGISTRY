"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deferredRouterPush,
  deferredRouterReplace,
} from "@/lib/deferred-app-router";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  WorkspaceShell,
  WorkspaceShellFooterLinks,
} from "@/components/Studio/WorkspaceShell";
import { PageNav } from "@/components/ui/PageNav";
import {
  getCollectorOwnedArtworkIds,
  sortPortfolioRows,
} from "@/lib/collector-portfolio";
import {
  latestOwnershipSystemStatus,
  normalizeVerificationStatus,
  ownershipStatusBadge,
} from "@/lib/ownership-ledger";
import { getUnresolvedSaleSignals } from "@/lib/studio-signals";
import { testModeEnabled } from "@/lib/test-mode";
import { TestDataControls } from "@/components/Admin/TestDataControls";
import { getOnboardingRedirectPath } from "@/lib/onboarding";
import { CollectorStudioActivityPreview } from "@/components/Studio/CollectorStudioActivityPreview";
import { CollectorWorkspaceHero } from "@/components/Studio/CollectorWorkspaceHero";
import {
  certificateStatusMapToCollectorRecord,
  fetchCertificatePublicStatusByArtworkIds,
} from "@/lib/fetch-certificate-public-status-map";

type Row = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
  latest_value: number | null;
  latest_currency: string | null;
  latest_transfer_at: string | null;
  created_at: string | null;
};

type CollectorProfile = {
  user_id: string;
  display_name: string | null;
  slug: string;
  location: string | null;
};

type CollectionSnapshot = {
  held: number;
  verifiedOwnership: number;
  pendingVerification: number;
  pendingTransfer: number;
  ownershipClaims: number;
  certificatesAvailable: number;
};

function workHeldWord(n: number) {
  return n === 1 ? "work" : "works";
}

function recordWord(n: number) {
  return n === 1 ? "record" : "records";
}

function transferWord(n: number) {
  return n === 1 ? "transfer" : "transfers";
}

export default function CollectorStudioPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [artistNames, setArtistNames] = useState<Record<string, string>>({});
  const [certByArtwork, setCertByArtwork] = useState<
    Record<string, { has_certificate: boolean; revoked: boolean }>
  >({});
  const [sortMode, setSortMode] = useState<"activity" | "value">("activity");
  const [latestOwnershipByArt, setLatestOwnershipByArt] = useState<
    Record<string, { label: string; className: string }>
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

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    deferredRouterPush(router, "/login");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        deferredRouterReplace(
          router,
          "/login?next=" + encodeURIComponent("/collector-studio")
        );
        return;
      }
      const uid = sessionData.session.user.id;
      setUserId(uid);

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
      if (actor.role !== "collector") {
        deferredRouterReplace(
          router,
          actor.role === "gallery"
            ? "/institutional-studio-dashboard"
            : "/studio"
        );
        return;
      }

      const { data: cp } = await supabase
        .from("collector_profiles")
        .select("user_id, display_name, slug, location")
        .eq("user_id", uid)
        .maybeSingle();
      if (!cancelled && cp) setCollectorProfile(cp);

      const ownedIds = await getCollectorOwnedArtworkIds(supabase, uid);
      if (ownedIds.length === 0) {
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
            pendingTransfer: 0,
            ownershipClaims: 0,
            certificatesAvailable: 0,
          });
          setPriorityValueEventIds([]);
          setPriorityOwnershipEventIds([]);
          setSignalMaps({ pendingSale: new Set(), unverified: new Set() });
          setLoading(false);
        }
        return;
      }

      const { data: artRows, error } = await supabase
        .from("artwork_read_model")
        .select(
          "id, title, registry_id, image_url, artist_id, verification_status, latest_value, latest_currency, latest_transfer_at, created_at"
        )
        .in("id", ownedIds);

      if (error) {
        console.error(error);
        if (!cancelled) setLoading(false);
        return;
      }

      const list = (artRows || []) as Row[];
      const artistIds = [
        ...new Set(list.map((r) => r.artist_id).filter(Boolean)),
      ] as string[];
      const nameMap: Record<string, string> = {};
      if (artistIds.length) {
        const { data: artists } = await supabase
          .from("artists")
          .select("id, display_name, full_name")
          .in("id", artistIds);
        for (const a of artists || []) {
          nameMap[String(a.id)] =
            a.display_name?.trim() || a.full_name?.trim() || "Artist";
        }
      }
      setArtistNames(nameMap);

      const certStatusMap = await fetchCertificatePublicStatusByArtworkIds(
        supabase,
        ownedIds
      );
      const certMap = certificateStatusMapToCollectorRecord(certStatusMap);
      setCertByArtwork(certMap);

      const { data: ownEv } = await supabase
        .from("ownership_events")
        .select(
          "artwork_id, verification_status, created_at, id, to_user_id, to_owner_id, to_name"
        )
        .in("artwork_id", ownedIds)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

      const latestMap: Record<string, { label: string; className: string }> =
        {};
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
          latestMap[aid] = ownershipStatusBadge(
            latestOwnershipSystemStatus(o as Record<string, unknown>),
            "light"
          );
        }
      }
      setLatestOwnershipByArt(latestMap);

      const regById: Record<string, string> = {};
      const titleById: Record<string, string> = {};
      for (const r of list) {
        titleById[r.id] = (r.title || "").trim() || "Untitled";
        if (r.registry_id) regById[r.id] = r.registry_id;
      }
      const toLink = (aid: string) => {
        const reg = regById[aid];
        if (!reg) return null;
        return { registryId: reg, title: titleById[aid] || "Work" };
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
        await getUnresolvedSaleSignals(supabase, ownedIds);
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
        held: list.length,
        verifiedOwnership,
        pendingVerification: unverifiedLinks.length,
        pendingTransfer: unresolvedLinks.length,
        ownershipClaims: claimedLinks.length,
        certificatesAvailable,
      });

      if (!cancelled) {
        setRows(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const sorted = useMemo(
    () => sortPortfolioRows(rows, sortMode),
    [rows, sortMode]
  );

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
    "Collector";
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
        text: `Ownership verification pending — ${x.title}`,
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    for (const x of studioAttention.unresolvedSales) {
      items.push({
        key: `sale-${x.registryId}`,
        text: `Transfer to resolve — ${x.title}`,
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    for (const x of studioAttention.claimed) {
      items.push({
        key: `claim-${x.registryId}`,
        text: `Ownership claim in progress — ${x.title}`,
        href: `/collector-studio/artwork/${encodeURIComponent(x.registryId)}`,
      });
    }
    return items;
  }, [studioAttention]);

  const collectorNavItems = useMemo(
    () => [
      { id: "workspace", label: "Workspace" },
      { id: "works", label: "Works" },
      {
        id: "attention",
        label: "Attention",
        showDot: intelligenceItems.length > 0,
      },
    ],
    [intelligenceItems.length]
  );

  if (loading || !userId) {
    return (
      <div className="ds-page-environment relative min-h-screen pt-28 text-neutral-900">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent"
          aria-hidden
        />
        <p className="text-center text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  const snap = collectionSnapshot;

  const footerExtra = (
    <>
      {publicCollectionHref ? (
        <Link
          href={publicCollectionHref}
          className="mt-4 block text-sm font-medium text-neutral-500 transition hover:text-neutral-800"
        >
          Public collection →
        </Link>
      ) : null}
      <p className="mt-6 text-xs leading-relaxed text-neutral-400">
        Public listings only list works where ownership is verified.
      </p>
    </>
  );

  return (
    <WorkspaceShell
      atmosphereClassName="ds-page-environment"
      navItems={collectorNavItems}
      activeId={activeSection}
      onSelect={selectSection}
      isLightChrome
      isTransitioning={isTransitioningSection}
      sidebarFooter={
        <WorkspaceShellFooterLinks isLight extra={footerExtra} />
      }
      sidebarActivity={
        <CollectorStudioActivityPreview
          userId={userId}
          portfolio={portfolioForActivity}
          priorityValueEventIds={priorityValueEventIds}
          priorityOwnershipEventIds={priorityOwnershipEventIds}
          limit={8}
        />
      }
      activityHeading="Recent notes"
      onSignOut={handleSignOut}
    >
      {activeSection === "workspace" ? (
        <>
          <PageNav
            crumbs={[
              { label: "Registry", href: "/registry" },
              { label: "Collection" },
            ]}
          />

          {testModeEnabled() ? (
            <div className="mt-6 rounded-xl border border-neutral-900/[0.06] bg-white/35 px-4 py-6 sm:px-6">
              <TestDataControls />
            </div>
          ) : null}

          <div className={testModeEnabled() ? "mt-8" : "mt-6"}>
            <CollectorWorkspaceHero
              displayName={displayName}
              location={locationLine}
              publicPageHref={publicCollectionHref}
              previewArtworks={heroPreviewArtworks}
            />
          </div>

          <section className="mt-12 border-t border-neutral-900/10 pt-14">
            <h2 className="sr-only">Collection overview</h2>
            {snap && snap.held === 0 ? (
              <p className="text-[17px] leading-[1.65] text-neutral-600">
                No works held yet. When you claim or receive ownership, they will
                appear here.
              </p>
            ) : snap ? (
              <div className="space-y-3 text-[17px] leading-[1.65] text-neutral-700">
                <p>
                  <span className="tabular-nums text-neutral-900">{snap.held}</span>{" "}
                  {workHeldWord(snap.held)} held.
                </p>
                {snap.verifiedOwnership > 0 ? (
                  <p>
                    <span className="tabular-nums text-neutral-900">
                      {snap.verifiedOwnership}
                    </span>{" "}
                    verified ownership {recordWord(snap.verifiedOwnership)}.
                  </p>
                ) : null}
                {snap.pendingTransfer > 0 ? (
                  <p>
                    <span className="tabular-nums text-neutral-900">
                      {snap.pendingTransfer}
                    </span>{" "}
                    pending {transferWord(snap.pendingTransfer)}.
                  </p>
                ) : null}
                {snap.pendingVerification > 0 && snap.verifiedOwnership < snap.held ? (
                  <p className="text-neutral-600">
                    <span className="tabular-nums text-neutral-900">
                      {snap.pendingVerification}
                    </span>{" "}
                    ownership {recordWord(snap.pendingVerification)} not yet verified.
                  </p>
                ) : null}
                {snap.ownershipClaims > 0 ? (
                  <p className="text-neutral-600">
                    <span className="tabular-nums text-neutral-900">
                      {snap.ownershipClaims}
                    </span>{" "}
                    open ownership{" "}
                    {snap.ownershipClaims === 1 ? "claim" : "claims"}.
                  </p>
                ) : null}
                {snap.certificatesAvailable > 0 ? (
                  <p className="text-neutral-600">
                    <span className="tabular-nums text-neutral-900">
                      {snap.certificatesAvailable}
                    </span>{" "}
                    {snap.certificatesAvailable === 1 ? "work" : "works"} with a
                    certificate on record.
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {activeSection === "works" ? (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
            <h2 className="font-serif text-xl font-normal text-neutral-900">
              Works
            </h2>
            {sorted.length > 0 ? (
              <p className="text-xs text-neutral-400">
                <span className="text-neutral-500">Order:</span>{" "}
                <button
                  type="button"
                  onClick={() => setSortMode("activity")}
                  className={
                    sortMode === "activity"
                      ? "text-neutral-900 underline decoration-neutral-900/25 underline-offset-4"
                      : "underline decoration-transparent underline-offset-4 hover:text-neutral-700"
                  }
                >
                  Recency
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
                  Declared value
                </button>
              </p>
            ) : null}
          </div>

          {sorted.length === 0 ? (
            <p className="mt-10 text-sm leading-relaxed text-neutral-500">
              Claim ownership from the{" "}
              <Link
                href="/registry"
                className="text-neutral-800 underline decoration-neutral-300 underline-offset-[5px] hover:decoration-neutral-500"
              >
                registry
              </Link>{" "}
              to build this list.
            </p>
          ) : (
            <ul className="mt-12 space-y-0 divide-y divide-neutral-900/10">
              {sorted.map((r) => {
                const reg = r.registry_id?.trim() || "—";
                const title = (r.title || "").trim() || "Untitled";
                const artist =
                  r.artist_id && artistNames[r.artist_id]
                    ? artistNames[r.artist_id]
                    : "Artist";
                const own =
                  latestOwnershipByArt[r.id] ??
                  ownershipStatusBadge("unassigned", "light");
                const href = r.registry_id
                  ? `/collector-studio/artwork/${encodeURIComponent(r.registry_id)}`
                  : "#";
                const flagSale = signalMaps.pendingSale.has(r.id);
                const flagUnver = signalMaps.unverified.has(r.id);
                return (
                  <li key={r.id}>
                    <Link
                      href={href}
                      className="block py-7 outline-none transition first:pt-0 hover:[&_.work-title]:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-900/10"
                    >
                      <p className="work-title font-serif text-lg font-normal leading-snug text-neutral-950">
                        {title}
                      </p>
                      <p className="mt-2 text-sm text-neutral-500">{artist}</p>
                      <p className="mt-3 font-mono text-xs tracking-tight text-neutral-400">
                        {reg}
                      </p>
                      <p className={`mt-3 text-sm ${own.className}`}>
                        {own.label}
                        {flagSale ? (
                          <span className="block pt-1 text-xs font-normal text-amber-900/80">
                            Transfer pending
                          </span>
                        ) : null}
                        {flagUnver ? (
                          <span className="block pt-1 text-xs font-normal text-neutral-500">
                            Verification outstanding
                          </span>
                        ) : null}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {activeSection === "attention" ? (
        <section>
          <h2 className="font-serif text-xl font-normal text-neutral-900">
            Requiring attention
          </h2>
          {intelligenceItems.length === 0 ? (
            <p className="mt-8 text-sm leading-relaxed text-neutral-500">
              Nothing calls for action right now.
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
    </WorkspaceShell>
  );
}
