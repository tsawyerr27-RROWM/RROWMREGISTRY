"use client";

import { useMemo } from "react";

import type { DealRow } from "@/lib/deals";
import { dealStatusLabel } from "@/lib/deal-status";
import { counterpartyUserIdForDeal, DEAL_PARTICIPANT_FALLBACK } from "@/lib/deal-participant-labels";
import type { DealTabId } from "@/components/Studio/Deals/StudioDealsWorkspace";
import { RrowmTabs } from "@/components/ui/RrowmTabs";
import { rrowmButton, rrowmEconomicSurface, rrowmSurface } from "@/styles/rrowm-theme";

type Props = {
  userId: string;
  loading: boolean;
  loadError: string | null;
  deals: DealRow[];
  counterpartyLabels?: Record<string, string>;
  activeTab: DealTabId;
  onTabChange: (tab: DealTabId) => void;
  selectedDealId: string | null;
  onSelectDealId: (id: string) => void;
  onCreateDeal?: () => void;
};

type DealBucket = {
  incoming: DealRow[];
  outgoing: DealRow[];
  active: DealRow[];
  closed: DealRow[];
};

function isClosedStatus(status: string): boolean {
  const s = String(status || "").toLowerCase().trim();
  return s === "closed" || s === "cancelled" || s === "rejected";
}

function isActiveStatus(status: string): boolean {
  const s = String(status || "").toLowerCase().trim();
  return (
    s === "accepted" ||
    s === "proposed" ||
    s === "under_review" ||
    s === "countered"
  );
}

function dealDisplayTitle(deal: DealRow): string {
  const t = String(deal.title ?? "").trim();
  if (t) return t;
  const type = String(deal.type ?? "").trim();
  return type ? type[0]?.toUpperCase() + type.slice(1) : "Deal";
}

function dealTypeLabel(type: string): string {
  const raw = String(type ?? "").trim();
  if (!raw) return "Deal";
  return raw[0]?.toUpperCase() + raw.slice(1);
}

function dealCounterpartyLabel(
  userId: string,
  deal: DealRow,
  counterpartyLabels: Record<string, string>
): string {
  const otherId = counterpartyUserIdForDeal(userId, deal);
  if (!otherId) return DEAL_PARTICIPANT_FALLBACK;
  return counterpartyLabels[otherId] ?? DEAL_PARTICIPANT_FALLBACK;
}

function dealWhen(deal: DealRow): string {
  const raw = String(deal.updated_at ?? deal.created_at ?? "");
  const d = raw ? new Date(raw) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function DealListPanel({
  userId,
  loading,
  loadError,
  deals,
  counterpartyLabels = {},
  activeTab,
  onTabChange,
  selectedDealId,
  onSelectDealId,
  onCreateDeal,
}: Props) {
  const buckets: DealBucket = useMemo(() => {
    const incoming: DealRow[] = [];
    const outgoing: DealRow[] = [];
    const active: DealRow[] = [];
    const closed: DealRow[] = [];

    for (const d of deals) {
      const createdBy = String(d.created_by_user_id ?? "").trim();
      const status = String(d.status ?? "").trim();

      if (isClosedStatus(status)) {
        closed.push(d);
        continue;
      }
      if (isActiveStatus(status)) {
        active.push(d);
      }
      if (createdBy && createdBy !== userId) incoming.push(d);
      if (createdBy && createdBy === userId) outgoing.push(d);
    }

    return { incoming, outgoing, active, closed };
  }, [deals, userId]);

  const tabs: { id: DealTabId; label: string; count: number }[] = [
    { id: "incoming", label: "Incoming", count: buckets.incoming.length },
    { id: "outgoing", label: "Outgoing", count: buckets.outgoing.length },
    { id: "active", label: "Active", count: buckets.active.length },
    { id: "closed", label: "Closed", count: buckets.closed.length },
  ];

  const list = buckets[activeTab];

  return (
    <section
      className={`${rrowmEconomicSurface.listPanel}`}
      aria-label="Deal list"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
          Deals
        </h2>
      </div>

      <RrowmTabs
        items={tabs}
        activeId={activeTab}
        onChange={onTabChange}
        variant="tonal"
        className="mt-5"
        ariaLabel="Deal folders"
      />

      <div className="mt-6 min-h-0">
        {loading ? (
          <p className="text-[13px] text-neutral-500">Loading deals.</p>
        ) : loadError ? (
          <p className="text-[13px] leading-relaxed text-neutral-600">{loadError}</p>
        ) : list.length === 0 ? (
          <div className={`${rrowmSurface.l3} px-5 py-8 text-center`}>
            <p className="text-[13px] leading-relaxed text-neutral-500">
              No deals in this view.
            </p>
            {onCreateDeal && deals.length === 0 ? (
              <button
                type="button"
                onClick={onCreateDeal}
                className={`mt-4 ${rrowmButton.primaryEconomic}`}
              >
                New deal
              </button>
            ) : null}
          </div>
        ) : (
          <div className="max-h-[calc(100dvh-24rem)] space-y-2 overflow-y-auto pr-1">
            {list.map((deal) => {
              const selected = deal.id === selectedDealId;
              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => onSelectDealId(deal.id)}
                  className={`w-full px-4 py-3 text-left transition ${
                    selected
                      ? `${rrowmSurface.l2} ring-1 ring-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_30%,transparent)]`
                      : `${rrowmSurface.l3} hover:shadow-[0_12px_30px_rgba(40,25,10,0.08)]`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-serif text-[15px] font-normal tracking-tight text-neutral-950">
                      {dealDisplayTitle(deal)}
                    </p>
                    <p className="shrink-0 text-[11px] tabular-nums text-neutral-500">
                      {dealWhen(deal)}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-neutral-500">
                    {dealCounterpartyLabel(userId, deal, counterpartyLabels)}
                  </p>
                  <p className="mt-2 truncate text-[12px] text-neutral-600">
                    {dealTypeLabel(String(deal.type ?? ""))} ·{" "}
                    {dealStatusLabel(String(deal.status ?? ""))}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

