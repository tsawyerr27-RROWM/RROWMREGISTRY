import type { PendingAcquisitionRow } from "@/lib/acquisition-ownership-loop";

export type CollectorPortfolioStatus = "held" | "pending_transfer" | "sold";

export type CollectorPortfolioRow = {
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
  ledger_latest_owner_id?: string | null;
  current_owner_id?: string | null;
  initial_value?: number | null;
  initial_currency?: string | null;
  ownership_transfer_count?: number | null;
  first_transfer_at?: string | null;
  portfolio_status: CollectorPortfolioStatus;
  pending_deal_id?: string | null;
  accept_href?: string | null;
  provenance_transfer_id?: string | null;
};

export function pendingAcquisitionToGhostRow(
  item: PendingAcquisitionRow
): CollectorPortfolioRow {
  return {
    id: item.artwork_id,
    title: item.title,
    registry_id: item.registry_id,
    image_url: item.image_url,
    artist_id: null,
    verification_status: "verified",
    latest_value: null,
    latest_currency: null,
    latest_transfer_at: null,
    created_at: null,
    portfolio_status: "pending_transfer",
    pending_deal_id: item.deal_id,
    accept_href: item.accept_href,
    provenance_transfer_id: item.provenance_transfer_id,
  };
}

export function mergeCollectorPortfolioRows(
  heldRows: CollectorPortfolioRow[],
  pending: PendingAcquisitionRow[]
): CollectorPortfolioRow[] {
  const heldIds = new Set(heldRows.map((row) => row.id));
  const ghosts = pending
    .filter((item) => !heldIds.has(item.artwork_id))
    .map(pendingAcquisitionToGhostRow);
  return [...ghosts, ...heldRows];
}
