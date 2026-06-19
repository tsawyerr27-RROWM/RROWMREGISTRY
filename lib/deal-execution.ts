import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getDealExecutionRecord,
  mapDealExecutionRecord,
} from "@/lib/deal-execution-records";
import { otherDealParticipant } from "@/lib/deal-permissions";
import type { DealRow } from "@/lib/deals";
import {
  findProvenanceEvidenceByDealId,
  type ExhibitionProvenanceMetadata,
} from "@/lib/provenance-evidence-events";
import {
  findActiveRepresentationPair,
  findRepresentationRelationshipByDealId,
} from "@/lib/representation-relationships";
import {
  findRightsLicenseByDealId,
} from "@/lib/rights-licenses";
import { registryLedgerHref } from "@/lib/registry-nav";
import { studioRightsHref } from "@/lib/rights-ledger";

export type DealExecutionKind =
  | "acquisition"
  | "exhibition"
  | "representation"
  | "licensing";

export type DealAcquisitionExecutionStatus =
  | "pending_acceptance"
  | "completed"
  | "cancelled"
  | "expired";

export type AcquisitionExecutionRecord = {
  type?: "acquisition";
  provenance_transfer_id: string;
  registry_id: string | null;
  recorded_at: string;
  recorded_by_user_id: string;
  status: DealAcquisitionExecutionStatus;
  recipient_user_id: string | null;
};

export type ExhibitionExecutionRecord = {
  type: "exhibition";
  provenance_event_id: string;
  registry_id: string | null;
  recorded_at: string;
  recorded_by_user_id: string;
  status: "recorded";
};

export type RepresentationExecutionRecord = {
  type: "representation";
  relationship_id: string;
  recorded_at: string;
  recorded_by_user_id: string;
  status: "recorded";
};

export type LicensingExecutionRecord = {
  type: "licensing";
  rights_license_id: string;
  registry_id: string | null;
  recorded_at: string;
  recorded_by_user_id: string;
  status: "recorded";
};

export type DealExecutionRecord =
  | AcquisitionExecutionRecord
  | ExhibitionExecutionRecord
  | RepresentationExecutionRecord
  | LicensingExecutionRecord;

export type DealExecutionPanelState = {
  visible: boolean;
  recorded: boolean;
  canInitiate: boolean;
  execution_kind: DealExecutionKind | null;
  execution: DealExecutionRecord | null;
  registry_id: string | null;
  artwork_title: string | null;
  ledger_href: string | null;
  rights_ledger_href: string | null;
  reason: string | null;
};

const EXECUTABLE_STATUSES = new Set(["accepted", "closed"]);

export function dealExecutionKind(deal: DealRow): DealExecutionKind | null {
  const type = String(deal.type ?? "").toLowerCase().trim();
  if (type === "acquisition") return "acquisition";
  if (type === "exhibition") return "exhibition";
  if (type === "representation") return "representation";
  if (type === "licensing") return "licensing";
  return null;
}

export function isAcquisitionDealExecutable(deal: DealRow): boolean {
  const type = String(deal.type ?? "").toLowerCase().trim();
  const status = String(deal.status ?? "").toLowerCase().trim();
  return (
    type === "acquisition" &&
    EXECUTABLE_STATUSES.has(status) &&
    Boolean(String(deal.artwork_id ?? "").trim())
  );
}

export function isExhibitionDealExecutable(deal: DealRow): boolean {
  const type = String(deal.type ?? "").toLowerCase().trim();
  const status = String(deal.status ?? "").toLowerCase().trim();
  return (
    type === "exhibition" &&
    EXECUTABLE_STATUSES.has(status) &&
    Boolean(String(deal.artwork_id ?? "").trim())
  );
}

export function isRepresentationDealExecutable(deal: DealRow): boolean {
  const type = String(deal.type ?? "").toLowerCase().trim();
  const status = String(deal.status ?? "").toLowerCase().trim();
  return type === "representation" && EXECUTABLE_STATUSES.has(status);
}

export function isLicensingDealExecutable(deal: DealRow): boolean {
  const type = String(deal.type ?? "").toLowerCase().trim();
  const status = String(deal.status ?? "").toLowerCase().trim();
  return (
    type === "licensing" &&
    EXECUTABLE_STATUSES.has(status) &&
    Boolean(String(deal.artwork_id ?? "").trim())
  );
}

export function isDealExecutionVisible(deal: DealRow): boolean {
  return (
    isAcquisitionDealExecutable(deal) ||
    isExhibitionDealExecutable(deal) ||
    isRepresentationDealExecutable(deal) ||
    isLicensingDealExecutable(deal)
  );
}

function parseAcquisitionExecution(
  raw: Record<string, unknown>
): AcquisitionExecutionRecord | null {
  const transferId = String(raw.provenance_transfer_id ?? "").trim();
  if (!transferId) return null;

  const statusRaw = String(raw.status ?? "pending_acceptance").toLowerCase().trim();
  const status: DealAcquisitionExecutionStatus =
    statusRaw === "completed" ||
    statusRaw === "cancelled" ||
    statusRaw === "expired"
      ? statusRaw
      : "pending_acceptance";

  return {
    type: "acquisition",
    provenance_transfer_id: transferId,
    registry_id: raw.registry_id != null ? String(raw.registry_id) : null,
    recorded_at: String(raw.recorded_at ?? ""),
    recorded_by_user_id: String(raw.recorded_by_user_id ?? ""),
    status,
    recipient_user_id:
      raw.recipient_user_id != null ? String(raw.recipient_user_id) : null,
  };
}

function parseRepresentationExecution(
  raw: Record<string, unknown>
): RepresentationExecutionRecord | null {
  const relationshipId = String(raw.relationship_id ?? "").trim();
  if (!relationshipId) return null;
  if (String(raw.status ?? "recorded").toLowerCase().trim() !== "recorded") {
    return null;
  }

  return {
    type: "representation",
    relationship_id: relationshipId,
    recorded_at: String(raw.recorded_at ?? ""),
    recorded_by_user_id: String(raw.recorded_by_user_id ?? ""),
    status: "recorded",
  };
}

function parseExhibitionExecution(
  raw: Record<string, unknown>
): ExhibitionExecutionRecord | null {
  const eventId = String(raw.provenance_event_id ?? "").trim();
  if (!eventId) return null;
  if (String(raw.status ?? "recorded").toLowerCase().trim() !== "recorded") {
    return null;
  }

  return {
    type: "exhibition",
    provenance_event_id: eventId,
    registry_id: raw.registry_id != null ? String(raw.registry_id) : null,
    recorded_at: String(raw.recorded_at ?? ""),
    recorded_by_user_id: String(raw.recorded_by_user_id ?? ""),
    status: "recorded",
  };
}

function parseLicensingExecution(
  raw: Record<string, unknown>
): LicensingExecutionRecord | null {
  const licenseId = String(raw.rights_license_id ?? "").trim();
  if (!licenseId) return null;
  if (String(raw.status ?? "recorded").toLowerCase().trim() !== "recorded") {
    return null;
  }

  return {
    type: "licensing",
    rights_license_id: licenseId,
    registry_id: raw.registry_id != null ? String(raw.registry_id) : null,
    recorded_at: String(raw.recorded_at ?? ""),
    recorded_by_user_id: String(raw.recorded_by_user_id ?? ""),
    status: "recorded",
  };
}

export function parseDealExecution(
  terms: Record<string, unknown> | null | undefined
): DealExecutionRecord | null {
  const raw = terms?.execution;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const type = String(o.type ?? "").toLowerCase().trim();

  if (type === "representation") {
    return parseRepresentationExecution(o);
  }

  if (type === "exhibition") {
    return parseExhibitionExecution(o);
  }

  if (type === "licensing") {
    return parseLicensingExecution(o);
  }

  if (o.relationship_id) {
    return parseRepresentationExecution(o);
  }

  if (o.provenance_event_id) {
    return parseExhibitionExecution(o);
  }

  if (o.rights_license_id) {
    return parseLicensingExecution(o);
  }

  return parseAcquisitionExecution(o);
}

/** Resolve execution from canonical table, then legacy deal.terms.execution. */
export async function resolveDealExecution(
  service: SupabaseClient,
  args: {
    dealId: string;
    terms: Record<string, unknown> | null | undefined;
  }
): Promise<DealExecutionRecord | null> {
  const row = await getDealExecutionRecord(service, args.dealId);
  if (row) {
    const mapped = mapDealExecutionRecord(row);
    if (mapped) return mapped;
  }
  return parseDealExecution(args.terms);
}

export function buildDealExecutionNote(dealId: string, dealTitle: string | null): string {
  const title = String(dealTitle ?? "").trim() || "Acquisition deal";
  return `deal_execution; deal_id=${dealId}; context=${title.replace(/\n/g, " ").slice(0, 500)}`;
}

export function dealExecutionNoteMarker(dealId: string): string {
  return `deal_id=${dealId}`;
}

export function mergeAcquisitionExecutionIntoTerms(
  terms: Record<string, unknown>,
  execution: AcquisitionExecutionRecord
): Record<string, unknown> {
  return {
    ...terms,
    execution: {
      type: "acquisition",
      provenance_transfer_id: execution.provenance_transfer_id,
      registry_id: execution.registry_id,
      recorded_at: execution.recorded_at,
      recorded_by_user_id: execution.recorded_by_user_id,
      status: execution.status,
      recipient_user_id: execution.recipient_user_id,
    },
  };
}

/** @deprecated Use mergeAcquisitionExecutionIntoTerms */
export function mergeExecutionIntoTerms(
  terms: Record<string, unknown>,
  execution: AcquisitionExecutionRecord
): Record<string, unknown> {
  return mergeAcquisitionExecutionIntoTerms(terms, execution);
}

export function mergeExhibitionExecutionIntoTerms(
  terms: Record<string, unknown>,
  execution: ExhibitionExecutionRecord
): Record<string, unknown> {
  return {
    ...terms,
    execution: {
      type: "exhibition",
      provenance_event_id: execution.provenance_event_id,
      registry_id: execution.registry_id,
      recorded_at: execution.recorded_at,
      recorded_by_user_id: execution.recorded_by_user_id,
      status: execution.status,
    },
  };
}

export function mergeRepresentationExecutionIntoTerms(
  terms: Record<string, unknown>,
  execution: RepresentationExecutionRecord
): Record<string, unknown> {
  return {
    ...terms,
    execution: {
      type: "representation",
      relationship_id: execution.relationship_id,
      recorded_at: execution.recorded_at,
      recorded_by_user_id: execution.recorded_by_user_id,
      status: execution.status,
    },
  };
}

export function mergeLicensingExecutionIntoTerms(
  terms: Record<string, unknown>,
  execution: LicensingExecutionRecord
): Record<string, unknown> {
  return {
    ...terms,
    execution: {
      type: "licensing",
      rights_license_id: execution.rights_license_id,
      registry_id: execution.registry_id,
      recorded_at: execution.recorded_at,
      recorded_by_user_id: execution.recorded_by_user_id,
      status: execution.status,
    },
  };
}

export function acquisitionRecipientUserId(
  deal: DealRow,
  initiatorUserId: string
): string | null {
  const uid = String(initiatorUserId ?? "").trim();
  if (!uid) return null;

  const participantA = String(deal.participant_a_user_id ?? "").trim();
  const participantB = String(deal.participant_b_user_id ?? "").trim();
  return otherDealParticipant({
    userId: uid,
    participantAUserId: participantA,
    participantBUserId: participantB,
  });
}

export async function resolveUserEmail(
  service: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await service.auth.admin.getUserById(userId);
    if (error || !data.user?.email) return null;
    return String(data.user.email).trim().toLowerCase();
  } catch {
    return null;
  }
}

export async function findDealExecutionTransfer(
  service: SupabaseClient,
  args: { artworkId: string; dealId: string }
): Promise<{
  id: string;
  status: string;
  registry_id: string | null;
} | null> {
  const marker = dealExecutionNoteMarker(args.dealId);
  const { data, error } = await service
    .from("provenance_transfers")
    .select("id, status, artwork_id, note")
    .eq("artwork_id", args.artworkId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) return null;

  const row = data.find((r) => {
    const note = String((r as { note?: string }).note ?? "");
    return note.includes(marker);
  });

  if (!row?.id) return null;

  const { data: art } = await service
    .from("artworks")
    .select("registry_id")
    .eq("id", args.artworkId)
    .maybeSingle();

  return {
    id: String(row.id),
    status: String((row as { status?: string }).status ?? ""),
    registry_id: art?.registry_id ? String(art.registry_id) : null,
  };
}

export async function findDealRepresentationExecution(
  service: SupabaseClient,
  args: { dealId: string; artistUserId: string; galleryId: string; userId: string }
): Promise<RepresentationExecutionRecord | null> {
  const byDeal = await findRepresentationRelationshipByDealId(service, args.dealId);
  if (byDeal?.id) {
    return {
      type: "representation",
      relationship_id: byDeal.id,
      recorded_at: byDeal.created_at || new Date().toISOString(),
      recorded_by_user_id: args.userId,
      status: "recorded",
    };
  }

  const active = await findActiveRepresentationPair(service, {
    artistUserId: args.artistUserId,
    galleryId: args.galleryId,
  });
  if (!active?.id) return null;

  return {
    type: "representation",
    relationship_id: active.id,
    recorded_at: active.created_at || new Date().toISOString(),
    recorded_by_user_id: args.userId,
    status: "recorded",
  };
}

export async function findDealExhibitionExecution(
  service: SupabaseClient,
  args: { artworkId: string; dealId: string; userId: string }
): Promise<ExhibitionExecutionRecord | null> {
  const event = await findProvenanceEvidenceByDealId(service, {
    artworkId: args.artworkId,
    dealId: args.dealId,
    category: "exhibition",
  });
  if (!event) return null;

  const { data: art } = await service
    .from("artworks")
    .select("registry_id")
    .eq("id", args.artworkId)
    .maybeSingle();

  return {
    type: "exhibition",
    provenance_event_id: event.id,
    registry_id: art?.registry_id ? String(art.registry_id) : null,
    recorded_at: event.occurred_at || new Date().toISOString(),
    recorded_by_user_id: args.userId,
    status: "recorded",
  };
}

export async function findDealLicensingExecution(
  service: SupabaseClient,
  args: { dealId: string; userId: string }
): Promise<LicensingExecutionRecord | null> {
  const license = await findRightsLicenseByDealId(service, args.dealId);
  if (!license?.id) return null;

  const { data: art } = await service
    .from("artworks")
    .select("registry_id")
    .eq("id", license.artwork_id)
    .maybeSingle();

  return {
    type: "licensing",
    rights_license_id: license.id,
    registry_id: art?.registry_id ? String(art.registry_id) : null,
    recorded_at: license.created_at || new Date().toISOString(),
    recorded_by_user_id: args.userId,
    status: "recorded",
  };
}

export function mapProvenanceStatusToExecution(
  status: string
): DealAcquisitionExecutionStatus {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "completed") return "completed";
  if (s === "cancelled") return "cancelled";
  if (s === "expired") return "expired";
  return "pending_acceptance";
}

function executionIsRecorded(
  kind: DealExecutionKind | null,
  execution: DealExecutionRecord | null
): boolean {
  if (!execution || !kind) return false;
  if (kind === "acquisition") {
    return Boolean(
      (execution as AcquisitionExecutionRecord).provenance_transfer_id
    );
  }
  if (kind === "exhibition") {
    return Boolean(
      (execution as ExhibitionExecutionRecord).provenance_event_id
    );
  }
  if (kind === "licensing") {
    return Boolean((execution as LicensingExecutionRecord).rights_license_id);
  }
  return Boolean(
    (execution as RepresentationExecutionRecord).relationship_id
  );
}

export function buildDealExecutionPanelState(args: {
  deal: DealRow;
  userId: string;
  execution: DealExecutionRecord | null;
  registryId: string | null;
  artworkTitle: string | null;
  canInitiate: boolean;
  reason: string | null;
  restrictToKind?: DealExecutionKind;
}): DealExecutionPanelState {
  const executionKind = dealExecutionKind(args.deal);
  const kind = args.restrictToKind ?? executionKind;
  const visible =
    isDealExecutionVisible(args.deal) &&
    (!args.restrictToKind || executionKind === args.restrictToKind);
  const recorded = executionIsRecorded(
    args.restrictToKind ?? executionKind,
    args.execution
  );
  const registryId =
    args.execution && "registry_id" in args.execution
      ? args.execution.registry_id ?? args.registryId ?? null
      : args.registryId ?? null;

  const rightsLicenseId =
    args.execution && "rights_license_id" in args.execution
      ? String(args.execution.rights_license_id ?? "").trim() || null
      : null;

  return {
    visible,
    recorded,
    canInitiate: visible && !recorded && args.canInitiate,
    execution_kind: visible ? (args.restrictToKind ?? executionKind) : null,
    execution: args.execution,
    registry_id: registryId,
    artwork_title: args.artworkTitle,
    ledger_href:
      kind === "licensing"
        ? registryId
          ? `${registryLedgerHref(registryId)}#rights-ledger`
          : null
        : registryId
          ? registryLedgerHref(registryId)
          : null,
    rights_ledger_href:
      kind === "licensing" ? studioRightsHref(rightsLicenseId) : null,
    reason: args.reason,
  };
}

export type ExhibitionExecutionInput = {
  venue: string;
  city?: string | null;
  start_date: string;
  end_date?: string | null;
  note?: string | null;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateExhibitionExecutionInput(
  raw: unknown
): { ok: true; value: ExhibitionExecutionInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const o = raw as Record<string, unknown>;
  const venue = String(o.venue ?? "").trim();
  const startDate = String(o.start_date ?? o.startDate ?? "").trim();
  const cityRaw = o.city != null ? String(o.city).trim() : "";
  const endDateRaw =
    o.end_date != null
      ? String(o.end_date).trim()
      : o.endDate != null
        ? String(o.endDate).trim()
        : "";
  const noteRaw = o.note != null ? String(o.note).trim() : "";

  if (!venue) {
    return { ok: false, error: "Venue is required." };
  }
  if (!startDate) {
    return { ok: false, error: "Start date is required." };
  }
  if (!ISO_DATE_RE.test(startDate)) {
    return { ok: false, error: "Start date must be YYYY-MM-DD." };
  }
  if (endDateRaw && !ISO_DATE_RE.test(endDateRaw)) {
    return { ok: false, error: "End date must be YYYY-MM-DD." };
  }
  if (endDateRaw && endDateRaw < startDate) {
    return { ok: false, error: "End date cannot be before start date." };
  }

  return {
    ok: true,
    value: {
      venue: venue.slice(0, 300),
      city: cityRaw ? cityRaw.slice(0, 200) : null,
      start_date: startDate,
      end_date: endDateRaw || null,
      note: noteRaw ? noteRaw.slice(0, 2000) : null,
    },
  };
}

export function exhibitionInputToMetadata(
  dealId: string,
  input: ExhibitionExecutionInput
): ExhibitionProvenanceMetadata {
  return {
    category: "exhibition",
    venue: input.venue,
    city: input.city ?? null,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    note: input.note ?? null,
    deal_id: dealId,
  };
}
