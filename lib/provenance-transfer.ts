/**
 * Formal provenance continuation — registry positioning (not legal adjudication).
 */

export const PROVENANCE_TRANSFER_STATUSES = [
  "initiated",
  "pending_acceptance",
  "completed",
  "cancelled",
  "expired",
] as const;

export type ProvenanceTransferStatus =
  (typeof PROVENANCE_TRANSFER_STATUSES)[number];

export const PROVENANCE_TRANSFER_TYPES = [
  "private_transfer",
  "sale",
  "gift",
  "inheritance",
] as const;

export type ProvenanceTransferType =
  (typeof PROVENANCE_TRANSFER_TYPES)[number];

export function isProvenanceTransferType(
  v: string
): v is ProvenanceTransferType {
  return (PROVENANCE_TRANSFER_TYPES as readonly string[]).includes(v);
}

/** Short labels used inside chronology milestones (e.g. after “Chronology continued · …”). */
export function provenanceTransferTypeLabel(t: ProvenanceTransferType): string {
  switch (t) {
    case "private_transfer":
      return "Private transfer";
    case "sale":
      return "Sale";
    case "gift":
      return "Gift";
    case "inheritance":
      return "Inheritance";
    default:
      return "Continuation";
  }
}

/**
 * Participant-facing wording for continuation invitations and forms —
 * custodial / historical framing, not marketplace or title transfer.
 */
export function chronologyContinuationKindLabel(
  t: ProvenanceTransferType
): string {
  switch (t) {
    case "private_transfer":
      return "Private custodial transition";
    case "sale":
      return "Sale (chronology context)";
    case "gift":
      return "Gift";
    case "inheritance":
      return "Inheritance";
    default:
      return "Recorded transition";
  }
}

/** Short label for ledger / timeline (participant-declared category). */
export function provenanceContinuationCategoryLine(
  transferType: ProvenanceTransferType
): string {
  return `Chronology continued · ${provenanceTransferTypeLabel(transferType)}`;
}

export function buildProvenanceContinuationNotes(input: {
  transferId: string;
  transferType: ProvenanceTransferType;
  participantNote?: string | null;
}): string {
  const base = `provenance_continuation; transfer_id=${input.transferId}; category=${input.transferType}`;
  const n = String(input.participantNote || "").trim();
  if (!n) return base;
  return `${base}; context=${n.replace(/\n/g, " ").slice(0, 2000)}`;
}

export const PROVENANCE_REGISTRY_DISCLAIMER =
  "Registry records reflect participant-submitted and institution-linked provenance information.";

/** Public preview of a continuation invite (GET /api/provenance-transfer/preview). */
export type ProvenanceContinuationPreview = {
  valid: boolean;
  expired: boolean;
  completed: boolean;
  cancelled: boolean;
  artworkTitle: string;
  registryId: string;
  holderLabel: string;
  transferTypeLabel: string;
  maskedRecipientEmail: string;
  disclaimer: string;
};
