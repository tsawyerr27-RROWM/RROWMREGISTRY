import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealRow } from "@/lib/deals";
import { otherDealParticipant } from "@/lib/deal-permissions";

export type RightsLicenseStatus = "active" | "expired" | "revoked";

export type RightsUsageType =
  | "editorial"
  | "commercial"
  | "merchandising"
  | "publishing"
  | "digital"
  | "custom";

export type RightsExclusivity = "exclusive" | "nonexclusive";

export type RightsLicenseRow = {
  id: string;
  created_at: string;
  updated_at: string;
  deal_id: string | null;
  artwork_id: string;
  licensor_user_id: string;
  licensee_user_id: string;
  status: RightsLicenseStatus;
  usage_type: RightsUsageType;
  territory: string;
  exclusivity: RightsExclusivity;
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
};

export type LicensingParticipants = {
  licensorUserId: string;
  licenseeUserId: string;
  artworkId: string;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const USAGE_TYPES: RightsUsageType[] = [
  "editorial",
  "commercial",
  "merchandising",
  "publishing",
  "digital",
  "custom",
];

export function usageTypeLabel(value: RightsUsageType): string {
  switch (value) {
    case "editorial":
      return "Editorial";
    case "commercial":
      return "Commercial";
    case "merchandising":
      return "Merchandising";
    case "publishing":
      return "Publishing";
    case "digital":
      return "Digital";
    default:
      return "Custom";
  }
}

export function normalizeRightsUsageType(
  raw: string | null | undefined
): RightsUsageType {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
  if (USAGE_TYPES.includes(v as RightsUsageType)) {
    return v as RightsUsageType;
  }
  if (v.includes("editorial")) return "editorial";
  if (v.includes("commercial")) return "commercial";
  if (v.includes("merchandis")) return "merchandising";
  if (v.includes("publish")) return "publishing";
  if (v.includes("digital")) return "digital";
  return "custom";
}

export function normalizeRightsExclusivity(
  raw: string | null | undefined
): RightsExclusivity {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
  if (v === "exclusive") return "exclusive";
  return "nonexclusive";
}

export function exclusivityLabel(value: RightsExclusivity): string {
  return value === "exclusive" ? "Exclusive" : "Non-exclusive";
}

export function inferUsageTypeFromScope(scope: string): RightsUsageType {
  return normalizeRightsUsageType(scope);
}

export function prefillLicensingFromDealTerms(
  terms: Record<string, unknown> | null | undefined
): {
  usage_type: RightsUsageType;
  territory: string;
  exclusivity: RightsExclusivity;
  ends_at: string;
  notes: string;
} {
  const t =
    terms && typeof terms === "object" && !Array.isArray(terms) ? terms : {};

  const usageScope = String(t.usage_scope ?? t.usageScope ?? "").trim();
  const territory = String(t.territory ?? "").trim();
  const notes = String(t.notes ?? "").trim();
  const duration = String(t.duration ?? "").trim();

  return {
    usage_type: usageScope
      ? inferUsageTypeFromScope(usageScope)
      : "custom",
    territory,
    exclusivity: normalizeRightsExclusivity(String(t.exclusivity ?? "")),
    ends_at: "",
    notes: [notes, duration ? `Duration: ${duration}` : ""]
      .filter(Boolean)
      .join("\n"),
  };
}

export function mapRightsLicenseRow(
  row: Record<string, unknown>
): RightsLicenseRow | null {
  if (!row.id) return null;

  return {
    id: String(row.id),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    deal_id: row.deal_id != null ? String(row.deal_id) : null,
    artwork_id: String(row.artwork_id ?? ""),
    licensor_user_id: String(row.licensor_user_id ?? ""),
    licensee_user_id: String(row.licensee_user_id ?? ""),
    status: String(row.status ?? "active") as RightsLicenseStatus,
    usage_type: normalizeRightsUsageType(String(row.usage_type ?? "")),
    territory: String(row.territory ?? ""),
    exclusivity: normalizeRightsExclusivity(String(row.exclusivity ?? "")),
    starts_at: String(row.starts_at ?? ""),
    ends_at: row.ends_at != null ? String(row.ends_at) : null,
    notes: row.notes != null ? String(row.notes) : null,
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

export async function resolveLicensingParticipants(
  service: SupabaseClient,
  deal: DealRow
): Promise<
  | { ok: true; participants: LicensingParticipants }
  | { ok: false; reason: string }
> {
  const artworkId = String(deal.artwork_id ?? "").trim();
  if (!artworkId) {
    return {
      ok: false,
      reason: "A linked artwork is required to activate this license.",
    };
  }

  const participantA = String(deal.participant_a_user_id ?? "").trim();
  const participantB = String(deal.participant_b_user_id ?? "").trim();
  const participants = [participantA, participantB].filter(Boolean);
  if (participants.length < 2) {
    return { ok: false, reason: "Deal participants are incomplete." };
  }

  const { data: art } = await service
    .from("artworks")
    .select("artist_id, current_owner_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.artist_id && !art?.current_owner_id) {
    return { ok: false, reason: "Linked artwork could not be resolved." };
  }

  const ownerId = String(art.current_owner_id ?? "").trim();
  const artistId = String(art.artist_id ?? "").trim();

  let licensorUserId: string | null = null;
  if (ownerId && participants.includes(ownerId)) {
    licensorUserId = ownerId;
  } else if (artistId && participants.includes(artistId)) {
    licensorUserId = artistId;
  } else {
    for (const uid of participants) {
      const { data: artist } = await service
        .from("artists")
        .select("id")
        .eq("id", uid)
        .maybeSingle();
      if (artist?.id) {
        licensorUserId = uid;
        break;
      }
    }
  }

  if (!licensorUserId) {
    licensorUserId = participantA;
  }

  const licenseeUserId = participants.find((uid) => uid !== licensorUserId) ?? null;
  if (!licenseeUserId || licenseeUserId === licensorUserId) {
    return {
      ok: false,
      reason: "Could not resolve licensor and licensee participants.",
    };
  }

  return {
    ok: true,
    participants: {
      licensorUserId,
      licenseeUserId,
      artworkId,
    },
  };
}

export async function findRightsLicenseByDealId(
  service: SupabaseClient,
  dealId: string
): Promise<RightsLicenseRow | null> {
  const clean = String(dealId ?? "").trim();
  if (!clean) return null;

  const { data, error } = await service
    .from("rights_licenses")
    .select(
      "id, created_at, updated_at, deal_id, artwork_id, licensor_user_id, licensee_user_id, status, usage_type, territory, exclusivity, starts_at, ends_at, notes, metadata"
    )
    .eq("deal_id", clean)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return mapRightsLicenseRow(data as Record<string, unknown>);
}

export type CreateRightsLicenseInput = {
  dealId: string;
  artworkId: string;
  licensorUserId: string;
  licenseeUserId: string;
  usageType: RightsUsageType;
  territory: string;
  exclusivity: RightsExclusivity;
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
};

export function validateLicensingExecutionInput(
  raw: unknown
): { ok: true; value: Omit<CreateRightsLicenseInput, "dealId" | "artworkId" | "licensorUserId" | "licenseeUserId"> } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const o = raw as Record<string, unknown>;
  const usageType = normalizeRightsUsageType(
    String(o.usage_type ?? o.usageType ?? "")
  );
  const territory = String(o.territory ?? "").trim();
  const startsAt = String(o.starts_at ?? o.startsAt ?? "").trim();
  const endsAtRaw =
    o.ends_at != null
      ? String(o.ends_at).trim()
      : o.endsAt != null
        ? String(o.endsAt).trim()
        : "";
  const notesRaw = o.notes != null ? String(o.notes).trim() : "";

  if (!territory) {
    return { ok: false, error: "Territory is required." };
  }
  if (!startsAt) {
    return { ok: false, error: "Start date is required." };
  }
  if (!ISO_DATE_RE.test(startsAt)) {
    return { ok: false, error: "Start date must be YYYY-MM-DD." };
  }
  if (endsAtRaw && !ISO_DATE_RE.test(endsAtRaw)) {
    return { ok: false, error: "End date must be YYYY-MM-DD." };
  }
  if (endsAtRaw && endsAtRaw < startsAt) {
    return { ok: false, error: "End date cannot be before start date." };
  }

  return {
    ok: true,
    value: {
      usageType,
      territory: territory.slice(0, 300),
      exclusivity: normalizeRightsExclusivity(String(o.exclusivity ?? "")),
      startsAt,
      endsAt: endsAtRaw || null,
      notes: notesRaw ? notesRaw.slice(0, 2000) : null,
    },
  };
}

export async function insertRightsLicense(
  service: SupabaseClient,
  input: CreateRightsLicenseInput
): Promise<{ id: string } | null> {
  const now = new Date().toISOString();
  const { data, error } = await service
    .from("rights_licenses")
    .insert({
      deal_id: input.dealId,
      artwork_id: input.artworkId,
      licensor_user_id: input.licensorUserId,
      licensee_user_id: input.licenseeUserId,
      status: "active",
      usage_type: input.usageType,
      territory: input.territory,
      exclusivity: input.exclusivity,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      notes: input.notes,
      metadata: {},
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return { id: String(data.id) };
}

export function licensingCounterpartyUserId(
  deal: DealRow,
  actorUserId: string
): string | null {
  return otherDealParticipant({
    userId: actorUserId,
    participantAUserId: String(deal.participant_a_user_id ?? ""),
    participantBUserId: String(deal.participant_b_user_id ?? ""),
  });
}
