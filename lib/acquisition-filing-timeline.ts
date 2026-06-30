import { readAcquisitionLifecycle } from "@/lib/acquisition-lifecycle";
import type { DealExecutionPanelState } from "@/lib/deal-execution";
import type { DealRow } from "@/lib/deals";

export const ACQUISITION_FILING_STEPS = [
  {
    id: "terms_agreed",
    label: "Terms agreed",
    description: "Both parties accepted the acquisition terms.",
  },
  {
    id: "seller_executed",
    label: "Transfer filed",
    description: "The seller filed the stewardship transfer on the registry.",
  },
  {
    id: "buyer_acceptance",
    label: "Buyer ownership acceptance required",
    description: "The buyer confirms receipt to complete ownership on the ledger.",
  },
  {
    id: "ownership_recorded",
    label: "Ownership recorded",
    description: "Stewardship is confirmed on the registry chronology.",
  },
] as const;

export type AcquisitionFilingStepId =
  (typeof ACQUISITION_FILING_STEPS)[number]["id"];

export type AcquisitionFilingTimeline = {
  currentStepId: AcquisitionFilingStepId;
  currentIndex: number;
  completedStepIds: AcquisitionFilingStepId[];
};

const TERMS_AGREED_STATUSES = new Set(["accepted", "closed"]);

export function resolveAcquisitionFilingTimeline(args: {
  deal: DealRow;
  execution: Pick<
    DealExecutionPanelState,
    "recorded" | "ownership_loop" | "execution" | "canInitiate"
  > | null;
}): AcquisitionFilingTimeline {
  const status = String(args.deal.status ?? "").toLowerCase().trim();
  const termsAgreed =
    TERMS_AGREED_STATUSES.has(status) ||
    Boolean(args.execution?.canInitiate);
  const recorded = Boolean(args.execution?.recorded);
  const loop = args.execution?.ownership_loop;
  const lifecycle = readAcquisitionLifecycle(
    args.deal.terms as Record<string, unknown> | null | undefined
  );

  // Completed when loop, or embedded lifecycle, confirms ledger acceptance.
  const ownershipRecorded =
    loop?.status === "completed" || lifecycle?.state === "completed";

  if (ownershipRecorded) {
    return {
      currentStepId: "ownership_recorded",
      currentIndex: 3,
      completedStepIds: ACQUISITION_FILING_STEPS.map((step) => step.id),
    };
  }

  let currentIndex = 0;
  if (recorded) {
    currentIndex = 2;
  } else if (termsAgreed) {
    currentIndex = 1;
  }

  const currentStepId = ACQUISITION_FILING_STEPS[currentIndex].id;
  const completedStepIds = ACQUISITION_FILING_STEPS.slice(0, currentIndex).map(
    (step) => step.id
  );

  return { currentStepId, currentIndex, completedStepIds };
}
