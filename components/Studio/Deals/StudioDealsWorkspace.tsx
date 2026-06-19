"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { DealRow } from "@/lib/deals";
import { buildStudioNewDealHref } from "@/lib/deal-create-nav";
import { DealListPanel } from "@/components/Studio/Deals/DealListPanel";
import { DealWorkspace } from "@/components/Studio/Deals/DealWorkspace";
import { rrowmButton, rrowmSurface, rrowmZoneClass } from "@/styles/rrowm-theme";
import { workspace } from "@/styles/workspace-design";

export type DealTabId = "incoming" | "outgoing" | "active" | "closed";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [counterpartyLabels, setCounterpartyLabels] = useState<
    Record<string, string>
  >({});
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DealTabId>("active");

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
      setDeals(rows.slice().sort(sortByUpdatedAtDesc));
      setCounterpartyLabels(
        payload.counterpartyLabels && typeof payload.counterpartyLabels === "object"
          ? payload.counterpartyLabels
          : {}
      );
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

  const selectedDeal = useMemo(
    () => deals.find((d) => d.id === selectedDealId) ?? null,
    [deals, selectedDealId]
  );

  useEffect(() => {
    if (deals.length === 0) return;

    const candidate = String(initialDealId ?? "").trim();
    if (candidate && deals.some((d) => d.id === candidate)) {
      setSelectedDealId(candidate);
      return;
    }

    setSelectedDealId((prev) => {
      if (prev && deals.some((d) => d.id === prev)) return prev;
      return deals[0]?.id ?? null;
    });
  }, [deals, initialDealId]);

  const showEmptyWorkspace = !loading && !loadError && deals.length === 0;

  return (
    <div className={`${rrowmZoneClass.economic} min-h-0`}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className={workspace.type.sectionTitle}>Deals</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
            A private workspace for proposals, terms, and recorded correspondence.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewDeal}
          className={rrowmButton.primaryEconomic}
        >
          New deal
        </button>
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr] lg:gap-8 xl:grid-cols-[24rem_1fr]">
        <DealListPanel
          userId={userId}
          loading={loading}
          loadError={loadError}
          deals={deals}
          counterpartyLabels={counterpartyLabels}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedDealId={selectedDealId}
          onSelectDealId={setSelectedDealId}
          onCreateDeal={openNewDeal}
        />

        {showEmptyWorkspace ? (
          <section
            className={`${workspace.panel.shell} flex min-h-[22rem] flex-col items-center justify-center px-8 py-16 text-center`}
            aria-label="Deal workspace"
          >
            <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              No deals yet
            </h2>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-neutral-500">
              Begin by registering a work, or start a private deal with any public
              Field participant.
            </p>
            <button
              type="button"
              onClick={openNewDeal}
              className="mt-6 inline-flex items-center rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-900"
            >
              New deal
            </button>
          </section>
        ) : (
          <DealWorkspace
            userId={userId}
            deal={selectedDeal}
            onDealUpdated={() => void refreshDeals()}
          />
        )}
      </div>
    </div>
  );
}
