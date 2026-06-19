export const DEAL_TYPES = [
  "sale",
  "loan",
  "consignment",
  "exhibition",
  "other",
  "commission",
  "acquisition",
  "representation",
  "licensing",
  "collaboration",
] as const;

export type DealType = (typeof DEAL_TYPES)[number];

export const DEAL_STATUSES = [
  "draft",
  "proposed",
  "under_review",
  "countered",
  "accepted",
  "rejected",
  "cancelled",
  "closed",
] as const;

export type DealStatus = (typeof DEAL_STATUSES)[number];

const STATUS_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  draft: ["proposed", "cancelled"],
  proposed: ["under_review", "accepted", "rejected", "countered", "cancelled"],
  under_review: ["accepted", "rejected", "countered", "cancelled"],
  countered: ["accepted", "rejected", "countered", "cancelled"],
  accepted: ["closed", "cancelled"],
  rejected: [],
  cancelled: [],
  closed: [],
};

export const NEGOTIABLE_DEAL_STATUSES = [
  "proposed",
  "under_review",
  "countered",
] as const satisfies readonly DealStatus[];

export type NegotiableDealStatus = (typeof NEGOTIABLE_DEAL_STATUSES)[number];

export function isDealType(value: unknown): value is DealType {
  return typeof value === "string" && (DEAL_TYPES as readonly string[]).includes(value);
}

export function isDealStatus(value: unknown): value is DealStatus {
  return (
    typeof value === "string" && (DEAL_STATUSES as readonly string[]).includes(value)
  );
}

export function isNegotiableDealStatus(value: unknown): value is NegotiableDealStatus {
  return (
    typeof value === "string" &&
    (NEGOTIABLE_DEAL_STATUSES as readonly string[]).includes(value)
  );
}

export function canTransitionDealStatus(from: DealStatus, to: DealStatus): boolean {
  return from === to || STATUS_TRANSITIONS[from].includes(to);
}

export function dealStatusLabel(status: string): string {
  const s = String(status ?? "").toLowerCase().trim();
  switch (s) {
    case "draft":
      return "Draft";
    case "proposed":
      return "Proposal issued";
    case "under_review":
      return "Under review";
    case "countered":
      return "Counterproposal issued";
    case "accepted":
      return "Terms accepted";
    case "rejected":
      return "Declined";
    case "closed":
      return "Executed";
    case "cancelled":
      return "Cancelled";
    default:
      if (!s) return "Unknown";
      return s[0]?.toUpperCase() + s.slice(1);
  }
}
