import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AcquisitionExecutionRecord,
  DealAcquisitionExecutionStatus,
  DealExecutionRecord,
  ExhibitionExecutionRecord,
  LicensingExecutionRecord,
  RepresentationExecutionRecord,
} from "@/lib/deal-execution";

export type DealExecutionRecordKind =
  | "transfer"
  | "evidence"
  | "relationship"
  | "rights_activation";

export type DealExecutionRecordStatus =
  | "pending"
  | "recorded"
  | "completed"
  | "cancelled"
  | "expired";

export type DealExecutionRecordRow = {
  id: string;
  created_at: string;
  updated_at: string;
  deal_id: string;
  kind: DealExecutionRecordKind;
  status: DealExecutionRecordStatus;
  metadata: Record<string, unknown>;
};

function normalizeMetadata(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function mapDealExecutionRecordRow(
  row: Record<string, unknown>
): DealExecutionRecordRow | null {
  const dealId = String(row.deal_id ?? "").trim();
  const kind = String(row.kind ?? "").trim() as DealExecutionRecordKind;
  const status = String(row.status ?? "").trim() as DealExecutionRecordStatus;

  if (!dealId || !row.id) return null;
  if (
    kind !== "transfer" &&
    kind !== "evidence" &&
    kind !== "relationship" &&
    kind !== "rights_activation"
  ) {
    return null;
  }

  return {
    id: String(row.id),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    deal_id: dealId,
    kind,
    status,
    metadata: normalizeMetadata(row.metadata),
  };
}

export function acquisitionStatusToRecordStatus(
  status: DealAcquisitionExecutionStatus
): DealExecutionRecordStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "pending";
  }
}

export function recordStatusToAcquisitionStatus(
  status: DealExecutionRecordStatus
): DealAcquisitionExecutionStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "pending_acceptance";
  }
}

export function executionToRecordKind(
  execution: DealExecutionRecord
): DealExecutionRecordKind {
  if ("rights_license_id" in execution) return "rights_activation";
  if ("provenance_event_id" in execution) return "evidence";
  if ("relationship_id" in execution) return "relationship";
  return "transfer";
}

export function executionToRecordStatus(
  execution: DealExecutionRecord
): DealExecutionRecordStatus {
  if (
    "provenance_event_id" in execution ||
    "relationship_id" in execution ||
    "rights_license_id" in execution
  ) {
    return "recorded";
  }
  return acquisitionStatusToRecordStatus(
    (execution as AcquisitionExecutionRecord).status
  );
}

export function executionToRecordMetadata(
  execution: DealExecutionRecord
): Record<string, unknown> {
  if ("provenance_event_id" in execution) {
    const e = execution as ExhibitionExecutionRecord;
    return {
      type: "exhibition",
      provenance_event_id: e.provenance_event_id,
      registry_id: e.registry_id,
      recorded_at: e.recorded_at,
      recorded_by_user_id: e.recorded_by_user_id,
      status: e.status,
    };
  }

  if ("relationship_id" in execution) {
    const e = execution as RepresentationExecutionRecord;
    return {
      type: "representation",
      relationship_id: e.relationship_id,
      recorded_at: e.recorded_at,
      recorded_by_user_id: e.recorded_by_user_id,
      status: e.status,
    };
  }

  if ("rights_license_id" in execution) {
    const e = execution as LicensingExecutionRecord;
    return {
      type: "licensing",
      rights_license_id: e.rights_license_id,
      registry_id: e.registry_id,
      recorded_at: e.recorded_at,
      recorded_by_user_id: e.recorded_by_user_id,
      status: e.status,
    };
  }

  const e = execution as AcquisitionExecutionRecord;
  return {
    type: "acquisition",
    provenance_transfer_id: e.provenance_transfer_id,
    registry_id: e.registry_id,
    recorded_at: e.recorded_at,
    recorded_by_user_id: e.recorded_by_user_id,
    status: e.status,
    recipient_user_id: e.recipient_user_id,
  };
}

/** Map a canonical table row to the legacy in-app execution shape. */
export function mapDealExecutionRecord(
  row: DealExecutionRecordRow
): DealExecutionRecord | null {
  const meta = row.metadata;

  if (row.kind === "transfer") {
    const transferId = String(meta.provenance_transfer_id ?? "").trim();
    if (!transferId) return null;

    return {
      type: "acquisition",
      provenance_transfer_id: transferId,
      registry_id: meta.registry_id != null ? String(meta.registry_id) : null,
      recorded_at: String(meta.recorded_at ?? row.created_at),
      recorded_by_user_id: String(meta.recorded_by_user_id ?? ""),
      status: recordStatusToAcquisitionStatus(row.status),
      recipient_user_id:
        meta.recipient_user_id != null ? String(meta.recipient_user_id) : null,
    };
  }

  if (row.kind === "evidence") {
    const eventId = String(meta.provenance_event_id ?? "").trim();
    if (!eventId) return null;

    return {
      type: "exhibition",
      provenance_event_id: eventId,
      registry_id: meta.registry_id != null ? String(meta.registry_id) : null,
      recorded_at: String(meta.recorded_at ?? row.created_at),
      recorded_by_user_id: String(meta.recorded_by_user_id ?? ""),
      status: "recorded",
    };
  }

  if (row.kind === "rights_activation") {
    const licenseId = String(meta.rights_license_id ?? "").trim();
    if (!licenseId) return null;

    return {
      type: "licensing",
      rights_license_id: licenseId,
      registry_id: meta.registry_id != null ? String(meta.registry_id) : null,
      recorded_at: String(meta.recorded_at ?? row.created_at),
      recorded_by_user_id: String(meta.recorded_by_user_id ?? ""),
      status: "recorded",
    };
  }

  const relationshipId = String(meta.relationship_id ?? "").trim();
  if (!relationshipId) return null;

  return {
    type: "representation",
    relationship_id: relationshipId,
    recorded_at: String(meta.recorded_at ?? row.created_at),
    recorded_by_user_id: String(meta.recorded_by_user_id ?? ""),
    status: "recorded",
  };
}

export async function getDealExecutionRecord(
  service: SupabaseClient,
  dealId: string
): Promise<DealExecutionRecordRow | null> {
  const clean = String(dealId ?? "").trim();
  if (!clean) return null;

  const { data, error } = await service
    .from("deal_execution_records")
    .select("id, created_at, updated_at, deal_id, kind, status, metadata")
    .eq("deal_id", clean)
    .maybeSingle();

  if (error || !data) return null;
  return mapDealExecutionRecordRow(data as Record<string, unknown>);
}

export async function upsertDealExecutionRecord(
  service: SupabaseClient,
  args: {
    dealId: string;
    execution: DealExecutionRecord;
  }
): Promise<DealExecutionRecordRow | null> {
  const dealId = String(args.dealId ?? "").trim();
  if (!dealId) return null;

  const now = new Date().toISOString();
  const payload = {
    deal_id: dealId,
    kind: executionToRecordKind(args.execution),
    status: executionToRecordStatus(args.execution),
    metadata: executionToRecordMetadata(args.execution),
    updated_at: now,
  };

  const { data, error } = await service
    .from("deal_execution_records")
    .upsert(payload, { onConflict: "deal_id" })
    .select("id, created_at, updated_at, deal_id, kind, status, metadata")
    .single();

  if (error || !data) {
    console.error("[deal_execution_records] upsert failed", {
      error,
      payload,
    });
    throw new Error(error?.message || "Failed to write deal execution record");
  }
  return mapDealExecutionRecordRow(data as Record<string, unknown>);
}
