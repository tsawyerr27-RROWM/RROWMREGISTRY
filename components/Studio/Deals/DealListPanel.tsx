"use client";

import { useMemo } from "react";

import type { DealRow } from "@/lib/deals";
import { dealStatusLabel } from "@/lib/deal-status";
import {
  counterpartyUserIdForDeal,
  DEAL_PARTICIPANT_FALLBACK,
} from "@/lib/deal-participant-labels";
import type { DealInboxTabId } from "@/lib/deal-inbox";
import { bucketDeals } from "@/lib/deal-inbox";
import { RrowmTabs } from "@/components/ui/RrowmTabs";
import { studioV2 } from "@/styles/studio-v2";
import { semanticStampClass } from "@/lib/registry-semantic-signals";

type Props = {
  userId: string;
  loading: boolean;
  loadError: string | null;
  deals: DealRow[];
  counterpartyLabels?: Record<string, string>;
  activeTab: DealInboxTabId;
  onTabChange: (tab: DealInboxTabId) => void;
  selectedDealId: string | null;
  onSelectDealId: (id: string) => void;
  onCreateDeal?: () => void;
};

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
  const buckets = useMemo(() => bucketDeals(deals, userId), [deals, userId]);

  const tabs: { id: DealInboxTabId; label: string; count: number }[] = [
    { id: "incoming", label: "Incoming", count: buckets.incoming.length },
    { id: "outgoing", label: "Outgoing", count: buckets.outgoing.length },
    { id: "active", label: "Active", count: buckets.active.length },
    { id: "closed", label: "Closed", count: buckets.closed.length },
  ];

  const list = buckets[activeTab];

  return (
    <aside className={`${studioV2.surface.inboxRail} min-w-0`} aria-label="Deal inbox">
      <div className="border-b border-[var(--v2-border)] px-3 py-3">
        <p className={`${studioV2.type.railLabel} text-[9px] tracking-[0.22em]`}>Inbox</p>
        <RrowmTabs
          items={tabs}
          activeId={activeTab}
          onChange={onTabChange}
          variant="tonal"
          ariaLabel="Deal folders"
        />
        {onCreateDeal ? (
          <button
            type="button"
            onClick={onCreateDeal}
            className="v2-cta-secondary mt-2.5 w-full min-h-[44px] py-2 text-[9px] md:min-h-0 md:!min-h-0"
          >
            New deal
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className={studioV2.type.metaValue}>Loading deals.</p>
        ) : loadError ? (
          <p className={studioV2.type.metaValue}>{loadError}</p>
        ) : list.length === 0 ? (
          <div className={`${studioV2.surface.filingSheet} px-3 py-5 text-center`}>
            <p className={studioV2.type.metaValue}>
              No deals filed in this folder yet.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--v2-ink-muted)]">
              Acquisition and representation filings appear here when initiated.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {list.map((deal) => {
              const selected = deal.id === selectedDealId;
              const isAcquisition =
                String(deal.type ?? "").toLowerCase() === "acquisition";
              return (
                <li key={deal.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDealId(deal.id)}
                    aria-current={selected ? "true" : undefined}
                    className={`studio-deal-inbox-item ${
                      selected
                        ? "studio-deal-inbox-item--active"
                        : "studio-deal-inbox-item--idle"
                    }`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="v2-type-display min-w-0 truncate text-left text-[13px] leading-snug text-[var(--v2-ink)]">
                        {dealDisplayTitle(deal)}
                      </p>
                      <p className={`${studioV2.type.inboxItem} shrink-0 tabular-nums`}>
                        {dealWhen(deal)}
                      </p>
                    </div>
                    <p className={`${studioV2.type.metaValue} mt-1 text-left text-[11px] leading-snug`}>
                      {dealCounterpartyLabel(userId, deal, counterpartyLabels)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {isAcquisition ? (
                        <span className={semanticStampClass("sale")}>
                          Acquisition
                        </span>
                      ) : null}
                      <span className={studioV2.type.inboxItem}>
                        {dealTypeLabel(String(deal.type ?? ""))} ·{" "}
                        {dealStatusLabel(String(deal.status ?? ""))}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
