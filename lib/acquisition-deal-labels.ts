import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import { readAcquisitionLifecycle } from "@/lib/acquisition-lifecycle";
import { dealStatusLabel } from "@/lib/deal-status";

type AcquisitionPanel = Pick<
  DealExecutionPanelState,
  "recorded" | "ownership_loop" | "execution"
> | null;

function isAcquisitionDeal(deal: DealRow): boolean {
  return String(deal.type ?? "").toLowerCase().trim() === "acquisition";
}

/** Human-readable acquisition deal status (avoids generic "Executed" / "Closed"). */
export function acquisitionDealStatusLabel(
  deal: DealRow,
  panel: AcquisitionPanel = null
): string {
  if (!isAcquisitionDeal(deal)) {
    return dealStatusLabel(String(deal.status ?? ""));
  }

  const loop = panel?.ownership_loop;
  if (loop?.status === "completed") {
    return "Completed";
  }

  const lifecycle = readAcquisitionLifecycle(
    deal.terms as Record<string, unknown> | null | undefined
  );
  if (lifecycle?.state === "completed") {
    return "Completed";
  }
  if (
    lifecycle?.state === "pending_transfer" ||
    loop?.status === "awaiting_buyer" ||
    loop?.status === "awaiting_seller"
  ) {
    return "Awaiting ownership confirmation";
  }
  if (panel?.recorded || lifecycle?.state === "executed") {
    return "Transfer filed";
  }

  const status = String(deal.status ?? "").toLowerCase().trim();
  if (status === "accepted") {
    return "Terms accepted";
  }
  if (status === "closed") {
    return "Awaiting ownership confirmation";
  }

  return dealStatusLabel(status);
}

/** Ribbon line for acquisition filing hero / deal header. */
export function acquisitionFilingPhaseLabel(
  panel: AcquisitionPanel
): string | null {
  const loop = panel?.ownership_loop;
  if (loop?.status === "completed") {
    return "Ownership recorded";
  }
  if (loop?.status === "awaiting_buyer" || loop?.status === "awaiting_seller") {
    return "Awaiting ownership confirmation";
  }
  if (panel?.recorded) {
    return "Transfer filed";
  }
  return null;
}
