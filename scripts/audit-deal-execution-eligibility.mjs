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

const DEAL_ID = process.env.AUDIT_DEAL_ID ?? "d233ab16-c387-40e8-bd01-3165722c7f1a";
const SELLER_ID = process.env.AUDIT_SELLER_ID ?? "6dce01f2-e304-42ab-8c0c-b75b293621ed";
const BUYER_ID = process.env.AUDIT_BUYER_ID ?? "4b2044e3-c98c-4a67-b15c-ab2f5d0a73aa";

const { createSupabaseServiceClient } = await import("../lib/supabase-service-role.ts");
const { mapDealRow } = await import("../lib/deals.ts");
const {
  acquisitionRecipientUserId,
  isAcquisitionDealExecutable,
  resolveDealExecution,
  resolveUserEmail,
  buildDealExecutionPanelState,
} = await import("../lib/deal-execution.ts");
const {
  resolveAcquisitionTransferForDeal,
  resolveOwnershipLoopForDealExecution,
  hydrateAcquisitionExecutionFromTransfer,
  toAcquisitionTransferContext,
  isPendingAcquisitionTransferRecipient,
} = await import("../lib/acquisition-ownership-loop.ts");
const { resolveAcquisitionFilingTimeline } = await import("../lib/acquisition-filing-timeline.ts");
const { isCurrentOwner, getCanonicalOwner } = await import("../lib/canonical-ownership-engine.ts");

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
  .select("id, title, registry_id, verification_status, current_owner_id")
  .eq("id", artworkId)
  .maybeSingle();

const registryId = String(art?.registry_id ?? "").trim() || null;
const canonicalOwner = await getCanonicalOwner(service, artworkId);

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

async function resolveForUser(userId, label) {
  let canInitiate = false;
  let reason = null;
  let reasonCode = null;
  let branch = null;

  if (!artworkId) {
    branch = "unknown_no_artwork";
    reason = "No linked artwork on this deal.";
    reasonCode = "unknown";
  } else if (!art?.id) {
    branch = "unknown_artwork_not_found";
    reason = "Linked artwork could not be found.";
    reasonCode = "unknown";
  } else if (!isAcquisitionDealExecutable(deal)) {
    branch = "deal_not_executable";
  } else if (hasRecordedTransfer) {
    branch = "transfer_exists";
  } else if (String(art.verification_status ?? "") !== "verified") {
    branch = "artwork_unverified";
    reason =
      "This artwork must be verified before stewardship transfer can be executed.";
    reasonCode = "artwork_unverified";
  } else if (!(await isCurrentOwner(service, userId, artworkId))) {
    branch = "not_current_owner";
    reason =
      "Only the recorded custodian for this work may initiate the transfer.";
    reasonCode = "not_current_owner";
  } else {
    const recipientUserId = acquisitionRecipientUserId(deal, userId);
    if (!recipientUserId) {
      branch = "unknown_no_recipient";
      reason = "Could not resolve the acquiring participant.";
      reasonCode = "unknown";
    } else {
      const recipientEmail = await resolveUserEmail(service, recipientUserId);
      if (!recipientEmail) {
        branch = "missing_recipient_email";
        reason = "The acquiring participant must have a contact email on file.";
        reasonCode = "missing_recipient_email";
      } else {
        branch = "eligible";
        canInitiate = true;
      }
    }
  }

  const ownershipLoop =
    acquisitionExecution || transfer
      ? await resolveOwnershipLoopForDealExecution(service, {
          deal,
          artworkId,
          userId,
          registryId,
          execution: acquisitionExecution,
        })
      : null;

  const panel = buildDealExecutionPanelState({
    deal,
    userId,
    execution: acquisitionExecution,
    registryId,
    artworkTitle: art?.title ? String(art.title) : null,
    canInitiate,
    reason,
    reasonCode,
    restrictToKind: "acquisition",
    ownershipLoop,
  });

  const timeline = resolveAcquisitionFilingTimeline({ deal, execution: panel });
  const transferCtx = toAcquisitionTransferContext(transfer);
  const recipientUserId = acquisitionRecipientUserId(deal, userId);
  const recipientEmail = recipientUserId
    ? await resolveUserEmail(service, recipientUserId)
    : null;

  return {
    label,
    userId,
    branch,
    values: {
      canInitiate: panel.canInitiate,
      reason: panel.reason,
      reason_code: panel.reason_code ?? reasonCode,
      currentOwnerId: canonicalOwner.userId,
      artworks_current_owner_id: art?.current_owner_id ?? null,
      execution: panel.execution,
      ownership_loop: panel.ownership_loop,
      visible: panel.visible,
      recorded: panel.recorded,
    },
    recipientUserId,
    recipientEmail,
    timeline: timeline.currentStepId,
    showSellerExecuteCta:
      timeline.currentStepId === "seller_executed" && Boolean(panel.canInitiate),
    showBuyerCta:
      isPendingAcquisitionTransferRecipient({ userId, transfer: transferCtx }) ||
      (ownershipLoop?.role === "buyer" && ownershipLoop?.status === "awaiting_buyer"),
    showTransferBlockedPanel:
      timeline.currentStepId === "seller_executed" &&
      !panel.canInitiate &&
      Boolean(panel.reason),
  };
}

const out = {
  dealId: deal.id,
  dealStatus: deal.status,
  participant_a: deal.participant_a_user_id,
  participant_b: deal.participant_b_user_id,
  artworkId,
  verification_status: art?.verification_status ?? null,
  hasRecordedTransfer,
  executionRecord: acquisitionExecution,
  transfer: transfer
    ? { id: transfer.id, status: transfer.status, deal_id: transfer.deal_id }
    : null,
  seller: await resolveForUser(SELLER_ID, "seller"),
  buyer: await resolveForUser(BUYER_ID, "buyer"),
};

console.log(JSON.stringify(out, null, 2));
