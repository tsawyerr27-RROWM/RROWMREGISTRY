"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { DealRow } from "@/lib/deals";
import { buildStudioNewDealHref } from "@/lib/deal-create-nav";
import {
  bucketDeals,
  dealBelongsToInboxTab,
  pickDefaultDealId,
  resolveDealInboxTab,
  type DealInboxTabId,
} from "@/lib/deal-inbox";
import { DealListPanel } from "@/components/Studio/Deals/DealListPanel";
import { DealWorkspace } from "@/components/Studio/Deals/DealWorkspace";
import { RrowmTabs } from "@/components/ui/RrowmTabs";
import { useMaxWidth1023 } from "@/hooks/useMaxWidth1023";
import { studioV2 } from "@/styles/studio-v2";

export type { DealInboxTabId as DealTabId };

type DealMobilePane = "inbox" | "deal" | "execution";

type Props = {
  userId: string;
  initialDealId?: string | null;
};

function sortByUpdatedAtDesc(a: DealRow, b: DealRow): number {
  const aa = String(a.updated_at ?? "");
  const bb = String(b.updated_at ?? "");
  return bb.localeCompare(aa);
}

export function StudioDealsWorkspace({ userId, initialDealId = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [counterpartyLabels, setCounterpartyLabels] = useState<
    Record<string, string>
  >({});
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DealInboxTabId>("active");
  const [mobilePane, setMobilePane] = useState<DealMobilePane>("inbox");
  const isMobile = useMaxWidth1023();

  const buckets = useMemo(() => bucketDeals(deals, userId), [deals, userId]);

  const syncDealQuery = useCallback(
    (dealId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (dealId) params.set("deal", dealId);
      else params.delete("deal");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const openNewDeal = () => {
    router.push(buildStudioNewDealHref());
  };

  const refreshDeals = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/deals", { credentials: "include" });
      const payload = (await res.json().catch(() => ({}))) as {
        deals?: DealRow[];
        counterpartyLabels?: Record<string, string>;
        error?: string;
      };
      if (!res.ok) {
        setDeals([]);
        setCounterpartyLabels({});
        setLoadError(payload.error || `Could not load deals (${res.status}).`);
        return;
      }
      const rows = Array.isArray(payload.deals) ? payload.deals : [];
      const sorted = rows.slice().sort(sortByUpdatedAtDesc);
      setDeals(sorted);
      setCounterpartyLabels(
        payload.counterpartyLabels && typeof payload.counterpartyLabels === "object"
          ? payload.counterpartyLabels
          : {}
      );

      const preferred =
        pickDefaultDealId(sorted, initialDealId) ??
        pickDefaultDealId(sorted, searchParams.get("deal"));
      setSelectedDealId(preferred);
      if (preferred) {
        const deal = sorted.find((row) => row.id === preferred);
        if (deal) setActiveTab(resolveDealInboxTab(deal, userId));
      }
    } catch {
      setDeals([]);
      setLoadError("Could not load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deals.length === 0) return;

    const candidate = String(initialDealId ?? searchParams.get("deal") ?? "").trim();
    if (!candidate || !deals.some((deal) => deal.id === candidate)) return;

    setSelectedDealId(candidate);
    const deal = deals.find((row) => row.id === candidate);
    if (deal) setActiveTab(resolveDealInboxTab(deal, userId));
  }, [deals, initialDealId, searchParams, userId]);

  useEffect(() => {
    if (!selectedDealId) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedDealId]);

  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  const handleSelectDeal = (id: string) => {
    setSelectedDealId(id);
    syncDealQuery(id);
    const deal = deals.find((row) => row.id === id);
    if (deal) setActiveTab(resolveDealInboxTab(deal, userId));
    if (isMobile) setMobilePane("deal");
  };

  const handleTabChange = (tab: DealInboxTabId) => {
    setActiveTab(tab);
    const list = buckets[tab];
    if (selectedDealId && list.some((deal) => deal.id === selectedDealId)) {
      return;
    }
    const nextId = list[0]?.id ?? null;
    setSelectedDealId(nextId);
    syncDealQuery(nextId);
  };

  const showEmptyWorkspace = !loading && !loadError && deals.length === 0;
  const tabList = buckets[activeTab];
  const workspaceDeal =
    selectedDeal && dealBelongsToInboxTab(selectedDeal, userId, activeTab)
      ? selectedDeal
      : tabList[0] ?? selectedDeal;

  return (
    <div className={`${studioV2.scope} studio-deals-workspace flex min-w-0 w-full flex-col gap-4 md:gap-6`}>
      <header className="relative mb-2 flex flex-wrap items-start justify-between gap-3 md:mb-4 md:gap-4">
        <div className="relative min-w-0 v2-surface-archive-sheet pl-4 md:pl-6">
          <p className={studioV2.type.railLabel}>Execution room</p>
          <h1 className={`${studioV2.type.commandTitle} mt-2 md:mt-3`}>Deals</h1>
        </div>
        <button
          type="button"
          onClick={openNewDeal}
          className="v2-cta-primary min-h-[44px] px-5 py-3 text-xs md:!min-h-0"
        >
          New deal
        </button>
      </header>

      {showEmptyWorkspace ? (
        <section
          className={`${studioV2.surface.filingSheetMajor} flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center`}
          aria-label="Deal workspace"
        >
          <h2 className={studioV2.type.sectionTitle}>No deals on file</h2>
          <p className={`${studioV2.type.metaValue} mt-3 max-w-sm`}>
            Begin by registering a work, or start a private deal with any public
            Field participant.
          </p>
          <button
            type="button"
            onClick={openNewDeal}
            className="v2-cta-primary mt-6 !min-h-0 px-5 py-3 text-xs"
          >
            New deal
          </button>
        </section>
      ) : isMobile ? (
        <>
          <RrowmTabs
            items={[
              { id: "inbox", label: "Inbox", count: deals.length },
              { id: "deal", label: "Deal" },
              { id: "execution", label: "Execution" },
            ]}
            activeId={mobilePane}
            onChange={setMobilePane}
            className="studio-deals-mobile-tabs lg:hidden"
            ariaLabel="Deal workspace"
          />
          <div
            className={`${studioV2.surface.commandGrid} studio-deals-workspace__layout studio-deals-workspace__layout--mobile min-w-0 w-full`}
          >
            {mobilePane === "inbox" ? (
              <DealListPanel
                userId={userId}
                loading={loading}
                loadError={loadError}
                deals={deals}
                counterpartyLabels={counterpartyLabels}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                selectedDealId={workspaceDeal?.id ?? selectedDealId}
                onSelectDealId={handleSelectDeal}
                onCreateDeal={openNewDeal}
              />
            ) : (
              <DealWorkspace
                userId={userId}
                deal={workspaceDeal}
                mobilePane={mobilePane === "execution" ? "execution" : "deal"}
                onDealUpdated={() => void refreshDeals()}
              />
            )}
          </div>
        </>
      ) : (
        <div className={`${studioV2.surface.commandGrid} studio-deals-workspace__layout min-w-0 w-full`}>
          <DealListPanel
            userId={userId}
            loading={loading}
            loadError={loadError}
            deals={deals}
            counterpartyLabels={counterpartyLabels}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            selectedDealId={workspaceDeal?.id ?? selectedDealId}
            onSelectDealId={handleSelectDeal}
            onCreateDeal={openNewDeal}
          />
          <DealWorkspace
            userId={userId}
            deal={workspaceDeal}
            onDealUpdated={() => void refreshDeals()}
          />
        </div>
      )}
    </div>
  );
}
