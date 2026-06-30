import { readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const line of readFileSync(resolve(".env.local"), "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  let val = trimmed.slice(eq + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  process.env[trimmed.slice(0, eq).trim()] = val;
}

const DEAL_ID = process.env.AUDIT_DEAL_ID ?? "6b760989-e0dc-4762-b2d9-30949d35554b";
const SELLER_ID = process.env.AUDIT_SELLER_ID ?? "6dce01f2-e304-42ab-8c0c-b75b293621ed";
const BUYER_ID = process.env.AUDIT_BUYER_ID ?? "4b2044e3-c98c-4a67-b15c-ab2f5d0a73aa";

const { createSupabaseServiceClient } = await import("../lib/supabase-service-role.ts");
const { mapDealRow } = await import("../lib/deals.ts");
const { isAcquisitionDealExecutable, resolveDealExecution } = await import("../lib/deal-execution.ts");
const {
  resolveAcquisitionTransferForDeal,
  resolveOwnershipLoopForDealExecution,
  hydrateAcquisitionExecutionFromTransfer,
  toAcquisitionTransferContext,
  isPendingAcquisitionTransferRecipient,
} = await import("../lib/acquisition-ownership-loop.ts");
const { resolveAcquisitionFilingTimeline } = await import("../lib/acquisition-filing-timeline.ts");
const { isCurrentOwner } = await import("../lib/canonical-ownership-engine.ts");
const { buildDealExecutionPanelState } = await import("../lib/deal-execution.ts");

const service = createSupabaseServiceClient();

const { data: dealRow } = await service
  .from("deals")
  .select("*")
  .eq("id", DEAL_ID)
  .maybeSingle();

if (!dealRow) {
  console.log(JSON.stringify({ error: "deal not found", DEAL_ID }, null, 2));
  process.exit(1);
}

const deal = mapDealRow(dealRow);
const artworkId = String(deal.artwork_id ?? "");

let execution = await resolveDealExecution(service, {
  dealId: deal.id,
  terms: deal.terms,
});
if (execution && !("provenance_transfer_id" in execution)) execution = null;

let acquisitionExecution =
  execution && "provenance_transfer_id" in execution ? execution : null;

const transfer = await resolveAcquisitionTransferForDeal(service, {
  dealId: deal.id,
  artworkId,
  provenanceTransferId: acquisitionExecution?.provenance_transfer_id,
});

const { data: art } = await service
  .from("artworks")
  .select("id, title, registry_id, verification_status")
  .eq("id", artworkId)
  .maybeSingle();

const registryId = String(art?.registry_id ?? "").trim() || null;

if (!acquisitionExecution && transfer) {
  acquisitionExecution = hydrateAcquisitionExecutionFromTransfer({
    deal,
    execution: null,
    transfer,
    registryId,
  });
} else if (acquisitionExecution && transfer) {
  acquisitionExecution = hydrateAcquisitionExecutionFromTransfer({
    deal,
    execution: acquisitionExecution,
    transfer,
    registryId,
  });
}

const hasRecordedTransfer = Boolean(
  acquisitionExecution?.provenance_transfer_id || transfer?.id
);

async function simulateUser(userId, label) {
  const executable = isAcquisitionDealExecutable(deal);
  let canInitiate = false;
  let reason = null;

  if (executable && !hasRecordedTransfer && art?.id) {
    if (String(art.verification_status ?? "") !== "verified") {
      reason = "not verified";
    } else if (!(await isCurrentOwner(service, userId, artworkId))) {
      reason = "not current owner";
    } else {
      canInitiate = true;
    }
  } else if (!executable) {
    reason = "deal not executable (status/type)";
  } else if (hasRecordedTransfer) {
    reason = "transfer already recorded";
  }

  const hydrated = acquisitionExecution;
  const ownershipLoop =
    hydrated || transfer
      ? await resolveOwnershipLoopForDealExecution(service, {
          deal,
          artworkId,
          userId,
          registryId,
          execution: hydrated,
        })
      : null;

  const panel = buildDealExecutionPanelState({
    deal,
    userId,
    execution: hydrated,
    registryId,
    artworkTitle: art?.title ? String(art.title) : null,
    canInitiate,
    reason,
    restrictToKind: "acquisition",
    ownershipLoop,
  });

  const timeline = resolveAcquisitionFilingTimeline({ deal, execution: panel });
  const transferCtx = toAcquisitionTransferContext(transfer);

  const showSellerExecuteCta =
    timeline.currentStepId === "seller_executed" && Boolean(panel.canInitiate);
  const showBuyerCta =
    isPendingAcquisitionTransferRecipient({ userId, transfer: transferCtx }) ||
    (ownershipLoop?.role === "buyer" && ownershipLoop?.status === "awaiting_buyer");

  return {
    label,
    userId,
    dealStatus: deal.status,
    isAcquisitionDealExecutable: executable,
    hasRecordedTransfer,
    panel: {
      visible: panel.visible,
      recorded: panel.recorded,
      canInitiate: panel.canInitiate,
      reason: panel.reason,
    },
    timeline: {
      currentStepId: timeline.currentStepId,
      currentIndex: timeline.currentIndex,
    },
    transfer: transfer
      ? {
          id: transfer.id,
          status: transfer.status,
          recipient_user_id: transfer.recipient_user_id,
        }
      : null,
    ownershipLoop,
    showSellerExecuteCta,
    showBuyerCta,
    canInitiateReason: reason,
  };
}

const out = {
  dealId: deal.id,
  dealStatus: deal.status,
  dealType: deal.type,
  artworkId,
  executionRecord: acquisitionExecution,
  seller: await simulateUser(SELLER_ID, "seller"),
  buyer: await simulateUser(BUYER_ID, "buyer"),
};

console.log(JSON.stringify(out, null, 2));
