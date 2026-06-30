import { resolveAcquisitionFilingTimeline } from "@/lib/acquisition-filing-timeline";
import { readAcquisitionLifecycle } from "@/lib/acquisition-lifecycle";
import {
  buildOwnershipAcceptHref,
  isPendingAcquisitionTransferRecipient,
  type AcquisitionTransferContext,
} from "@/lib/acquisition-ownership-loop";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";
import { registryLedgerHref } from "@/lib/registry-nav";
import { buildArtworkVerificationHref } from "@/lib/studio-nav/creative-nav";

export type AcquisitionHeaderAction =
  | { kind: "file_transfer" }
  | { kind: "confirm_receipt"; href: string; label: string }
  | { kind: "verify_artwork"; href: string }
  | { kind: "ownership_recorded" }
  | { kind: "none" };

export type AcquisitionFilingUiState = {
  timeline: ReturnType<typeof resolveAcquisitionFilingTimeline>;
  lifecycleComplete: boolean;
  allComplete: boolean;
  executionUnavailable: boolean;
  showSellerExecuteCta: boolean;
  showBuyerCta: boolean;
  showTransferBlockedPanel: boolean;
  showVerifyArtworkCta: boolean;
  buyerAcceptHref: string | null;
  verifyArtworkHref: string;
  ledgerHref: string | null;
  headerAction: AcquisitionHeaderAction;
};

export function resolveAcquisitionHeaderAction(args: {
  executionUnavailable: boolean;
  showSellerExecuteCta: boolean;
  showBuyerCta: boolean;
  showVerifyArtworkCta: boolean;
  allComplete: boolean;
  buyerAcceptHref: string | null;
  verifyArtworkHref: string;
  buyerActionLabel?: string | null;
}): AcquisitionHeaderAction {
  if (args.allComplete) {
    return { kind: "ownership_recorded" };
  }
  if (!args.executionUnavailable && args.showSellerExecuteCta) {
    return { kind: "file_transfer" };
  }
  if (!args.executionUnavailable && args.showBuyerCta && args.buyerAcceptHref) {
    return {
      kind: "confirm_receipt",
      href: args.buyerAcceptHref,
      label: String(args.buyerActionLabel ?? "").trim() || "Confirm receipt",
    };
  }
  if (!args.executionUnavailable && args.showVerifyArtworkCta) {
    return { kind: "verify_artwork", href: args.verifyArtworkHref };
  }
  return { kind: "none" };
}

export function resolveAcquisitionFilingUiState(args: {
  deal: DealRow;
  userId: string;
  executionState: DealExecutionPanelState | null;
  loadingExecution: boolean;
  registryId?: string | null;
}): AcquisitionFilingUiState {
  const artworkId = String(args.deal.artwork_id ?? "").trim();
  const registryId =
    String(args.registryId ?? args.executionState?.registry_id ?? "").trim() ||
    null;

  const timeline = resolveAcquisitionFilingTimeline({
    deal: args.deal,
    execution: args.executionState,
  });

  const lifecycle = readAcquisitionLifecycle(
    args.deal.terms as Record<string, unknown> | null | undefined
  );
  const lifecycleComplete = lifecycle?.state === "completed";
  const allComplete = timeline.currentStepId === "ownership_recorded";

  const executionUnavailable =
    !args.loadingExecution && args.executionState === null && !lifecycleComplete;

  const loop = args.executionState?.ownership_loop;
  const transfer = (args.executionState?.acquisition_transfer ??
    null) as AcquisitionTransferContext | null;

  const buyerAcceptHref =
    loop?.action_href?.trim() ||
    buildOwnershipAcceptHref(transfer?.invite_token ?? null) ||
    null;

  const showBuyerCta =
    isPendingAcquisitionTransferRecipient({ userId: args.userId, transfer }) ||
    (loop?.role === "buyer" && loop?.status === "awaiting_buyer");

  const showSellerExecuteCta =
    timeline.currentStepId === "seller_executed" &&
    Boolean(args.executionState?.canInitiate);

  const showTransferBlockedPanel =
    !executionUnavailable &&
    !showSellerExecuteCta &&
    !showBuyerCta &&
    timeline.currentStepId === "seller_executed" &&
    Boolean(args.executionState?.reason);

  const isArtworkUnverifiedBlock =
    args.executionState?.reason_code === "artwork_unverified" ||
    Boolean(args.executionState?.reason?.toLowerCase().includes("verified"));

  const showVerifyArtworkCta =
    showTransferBlockedPanel &&
    isArtworkUnverifiedBlock &&
    args.executionState?.can_resolve_verification === true;

  const verifyArtworkHref = buildArtworkVerificationHref(artworkId);
  const ledgerHref = registryId ? registryLedgerHref(registryId) : null;

  const headerAction = resolveAcquisitionHeaderAction({
    executionUnavailable,
    showSellerExecuteCta,
    showBuyerCta,
    showVerifyArtworkCta,
    allComplete,
    buyerAcceptHref,
    verifyArtworkHref,
    buyerActionLabel: loop?.action_label ?? null,
  });

  return {
    timeline,
    lifecycleComplete,
    allComplete,
    executionUnavailable,
    showSellerExecuteCta,
    showBuyerCta,
    showTransferBlockedPanel,
    showVerifyArtworkCta,
    buyerAcceptHref,
    verifyArtworkHref,
    ledgerHref,
    headerAction,
  };
}
