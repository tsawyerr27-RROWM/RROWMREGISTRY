export type AcquisitionLifecycleState =
  | "proposed"
  | "accepted"
  | "executed"
  | "pending_transfer"
  | "transferred"
  | "completed";

export type AcquisitionLifecycleSnapshot = {
  state: AcquisitionLifecycleState;
  updated_at: string;
  deal_id?: string | null;
  provenance_transfer_id?: string | null;
  ownership_event_id?: string | null;
};

const LIFECYCLE_KEY = "lifecycle";

export function readAcquisitionLifecycle(
  terms: Record<string, unknown> | null | undefined
): AcquisitionLifecycleSnapshot | null {
  if (!terms || typeof terms !== "object" || Array.isArray(terms)) return null;
  const lifecycle = terms[LIFECYCLE_KEY];
  if (!lifecycle || typeof lifecycle !== "object" || Array.isArray(lifecycle)) {
    return null;
  }
  const acquisition = (lifecycle as Record<string, unknown>).acquisition;
  if (!acquisition || typeof acquisition !== "object" || Array.isArray(acquisition)) {
    return null;
  }
  const row = acquisition as Record<string, unknown>;
  const state = String(row.state ?? "").trim() as AcquisitionLifecycleState;
  if (!state) return null;
  return {
    state,
    updated_at: String(row.updated_at ?? ""),
    deal_id: row.deal_id != null ? String(row.deal_id) : null,
    provenance_transfer_id:
      row.provenance_transfer_id != null ? String(row.provenance_transfer_id) : null,
    ownership_event_id:
      row.ownership_event_id != null ? String(row.ownership_event_id) : null,
  };
}

export function mergeAcquisitionLifecycleIntoTerms(
  terms: Record<string, unknown>,
  snapshot: AcquisitionLifecycleSnapshot
): Record<string, unknown> {
  const existingLifecycle =
    terms[LIFECYCLE_KEY] &&
    typeof terms[LIFECYCLE_KEY] === "object" &&
    !Array.isArray(terms[LIFECYCLE_KEY])
      ? (terms[LIFECYCLE_KEY] as Record<string, unknown>)
      : {};

  return {
    ...terms,
    [LIFECYCLE_KEY]: {
      ...existingLifecycle,
      acquisition: {
        state: snapshot.state,
        updated_at: snapshot.updated_at,
        deal_id: snapshot.deal_id ?? null,
        provenance_transfer_id: snapshot.provenance_transfer_id ?? null,
        ownership_event_id: snapshot.ownership_event_id ?? null,
      },
    },
  };
}

export function mapDealStatusToAcquisitionLifecycleState(
  dealStatus: string
): AcquisitionLifecycleState {
  const status = String(dealStatus ?? "").toLowerCase().trim();
  switch (status) {
    case "accepted":
    case "closed":
      return "accepted";
    case "proposed":
    case "under_review":
    case "countered":
      return "proposed";
    default:
      return "proposed";
  }
}

export function mapExecutionStatusToAcquisitionLifecycleState(
  executionStatus: string
): AcquisitionLifecycleState {
  const status = String(executionStatus ?? "").toLowerCase().trim();
  if (status === "completed") return "completed";
  if (status === "pending_acceptance" || status === "pending") {
    return "pending_transfer";
  }
  if (status === "recorded") return "executed";
  return "executed";
}
