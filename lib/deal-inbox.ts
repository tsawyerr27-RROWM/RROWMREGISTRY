import type { DealRow } from "@/lib/deals";

export type DealInboxTabId = "incoming" | "outgoing" | "active" | "closed";

export type DealInboxBuckets = Record<DealInboxTabId, DealRow[]>;

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

/** Partition deals into inbox folders (deals may appear in more than one folder). */
export function bucketDeals(deals: DealRow[], userId: string): DealInboxBuckets {
  const incoming: DealRow[] = [];
  const outgoing: DealRow[] = [];
  const active: DealRow[] = [];
  const closed: DealRow[] = [];

  for (const deal of deals) {
    const createdBy = String(deal.created_by_user_id ?? "").trim();
    const status = String(deal.status ?? "").trim();

    if (isClosedStatus(status)) {
      closed.push(deal);
      continue;
    }
    if (isActiveStatus(status)) {
      active.push(deal);
    }
    if (createdBy && createdBy !== userId) incoming.push(deal);
    if (createdBy && createdBy === userId) outgoing.push(deal);
  }

  return { incoming, outgoing, active, closed };
}

/** Preferred inbox tab when opening a deal (deep links, notifications). */
export function resolveDealInboxTab(
  deal: DealRow,
  userId: string
): DealInboxTabId {
  const status = String(deal.status ?? "").trim();
  const createdBy = String(deal.created_by_user_id ?? "").trim();

  if (isClosedStatus(status)) return "closed";
  if (createdBy && createdBy !== userId) return "incoming";
  if (createdBy && createdBy === userId) return "outgoing";
  if (isActiveStatus(status)) return "active";
  return "active";
}

export function dealBelongsToInboxTab(
  deal: DealRow,
  userId: string,
  tab: DealInboxTabId
): boolean {
  return bucketDeals([deal], userId)[tab].some((row) => row.id === deal.id);
}

export function pickDefaultDealId(
  deals: DealRow[],
  preferredId: string | null | undefined
): string | null {
  if (deals.length === 0) return null;
  const candidate = String(preferredId ?? "").trim();
  if (candidate && deals.some((deal) => deal.id === candidate)) {
    return candidate;
  }
  return deals[0]?.id ?? null;
}
