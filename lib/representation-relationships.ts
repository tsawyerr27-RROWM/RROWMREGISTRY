import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealRow } from "@/lib/deals";

export type RepresentationRelationshipStatus = "active" | "ended";

export type RepresentationExclusivity = "exclusive" | "nonexclusive" | "unspecified";

export type RepresentationRelationshipRow = {
  id: string;
  created_at: string;
  updated_at: string;
  artist_user_id: string;
  gallery_id: string;
  deal_id: string | null;
  status: RepresentationRelationshipStatus;
  exclusivity: RepresentationExclusivity;
  territory: string | null;
  starts_at: string;
  ends_at: string | null;
  notes: string | null;
};

export type RepresentationParticipants = {
  artistUserId: string;
  galleryId: string;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeRepresentationExclusivity(
  raw: string | null | undefined
): RepresentationExclusivity {
  const v = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
  if (v === "exclusive") return "exclusive";
  if (v === "non_exclusive" || v === "nonexclusive") return "nonexclusive";
  return "unspecified";
}

export function exclusivityLabel(value: RepresentationExclusivity): string {
  switch (value) {
    case "exclusive":
      return "Exclusive";
    case "nonexclusive":
      return "Non-exclusive";
    default:
      return "Unspecified";
  }
}

export function prefillRepresentationFromDealTerms(
  terms: Record<string, unknown> | null | undefined
): {
  exclusivity: RepresentationExclusivity;
  territory: string;
  ends_at: string;
  notes: string;
} {
  const t =
    terms && typeof terms === "object" && !Array.isArray(terms) ? terms : {};

  return {
    exclusivity: normalizeRepresentationExclusivity(
      String(t.exclusivity ?? "")
    ),
    territory: String(t.territory ?? "").trim(),
    ends_at: "",
    notes: String(t.notes ?? "").trim(),
  };
}

export async function resolveRepresentationParticipants(
  service: SupabaseClient,
  deal: DealRow
): Promise<
  | { ok: true; participants: RepresentationParticipants }
  | { ok: false; reason: string }
> {
  const participantA = String(deal.participant_a_user_id ?? "").trim();
  const participantB = String(deal.participant_b_user_id ?? "").trim();
  if (!participantA || !participantB) {
    return { ok: false, reason: "Deal participants are incomplete." };
  }

  const participants = [participantA, participantB];
  let galleryId = String(deal.gallery_id ?? "").trim() || null;

  const { data: memberships } = await service
    .from("gallery_users")
    .select("user_id, gallery_id")
    .in("user_id", participants);

  const membershipRows = (memberships ?? []) as Array<{
    user_id: string;
    gallery_id: string;
  }>;

  let galleryUserId: string | null = null;

  if (galleryId) {
    galleryUserId =
      membershipRows.find(
        (m) => m.gallery_id === galleryId && participants.includes(m.user_id)
      )?.user_id ?? null;
    if (!galleryUserId) {
      const anyMember = membershipRows.find((m) => m.gallery_id === galleryId);
      galleryUserId = anyMember?.user_id ?? null;
    }
  } else if (membershipRows.length > 0) {
    galleryId = String(membershipRows[0].gallery_id ?? "").trim() || null;
    galleryUserId = String(membershipRows[0].user_id ?? "").trim() || null;
  }

  if (!galleryId) {
    return {
      ok: false,
      reason: "Could not resolve the organisation for this representation deal.",
    };
  }

  const artistCandidates = participants.filter((uid) => uid !== galleryUserId);

  let artistUserId: string | null = null;
  for (const uid of artistCandidates) {
    const { data: artist } = await service
      .from("artists")
      .select("id")
      .eq("id", uid)
      .maybeSingle();
    if (artist?.id) {
      artistUserId = uid;
      break;
    }
  }

  if (!artistUserId) {
    artistUserId = artistCandidates[0] ?? null;
  }

  if (!artistUserId) {
    return { ok: false, reason: "Could not resolve the artist participant." };
  }

  if (artistUserId === galleryUserId) {
    return {
      ok: false,
      reason: "Artist and organisation must be distinct participants.",
    };
  }

  return {
    ok: true,
    participants: { artistUserId, galleryId },
  };
}

export async function findRepresentationRelationshipByDealId(
  service: SupabaseClient,
  dealId: string
): Promise<RepresentationRelationshipRow | null> {
  const { data, error } = await service
    .from("representation_relationships")
    .select(
      "id, created_at, updated_at, artist_user_id, gallery_id, deal_id, status, exclusivity, territory, starts_at, ends_at, notes"
    )
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return mapRepresentationRelationshipRow(data as Record<string, unknown>);
}

export async function findActiveRepresentationPair(
  service: SupabaseClient,
  args: { artistUserId: string; galleryId: string }
): Promise<RepresentationRelationshipRow | null> {
  const { data, error } = await service
    .from("representation_relationships")
    .select(
      "id, created_at, updated_at, artist_user_id, gallery_id, deal_id, status, exclusivity, territory, starts_at, ends_at, notes"
    )
    .eq("artist_user_id", args.artistUserId)
    .eq("gallery_id", args.galleryId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data?.id) return null;
  return mapRepresentationRelationshipRow(data as Record<string, unknown>);
}

export function mapRepresentationRelationshipRow(
  row: Record<string, unknown>
): RepresentationRelationshipRow {
  return {
    id: String(row.id ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    artist_user_id: String(row.artist_user_id ?? ""),
    gallery_id: String(row.gallery_id ?? ""),
    deal_id: row.deal_id != null ? String(row.deal_id) : null,
    status: String(row.status ?? "active") as RepresentationRelationshipStatus,
    exclusivity: normalizeRepresentationExclusivity(String(row.exclusivity ?? "")),
    territory: row.territory != null ? String(row.territory) : null,
    starts_at: String(row.starts_at ?? ""),
    ends_at: row.ends_at != null ? String(row.ends_at) : null,
    notes: row.notes != null ? String(row.notes) : null,
  };
}

export type CreateRepresentationRelationshipInput = {
  artistUserId: string;
  galleryId: string;
  dealId: string;
  exclusivity: RepresentationExclusivity;
  territory: string | null;
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
};

export function validateRepresentationExecutionInput(
  raw: unknown
): { ok: true; value: Omit<CreateRepresentationRelationshipInput, "artistUserId" | "galleryId" | "dealId"> } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const o = raw as Record<string, unknown>;
  const startsAt = String(o.starts_at ?? o.startsAt ?? "").trim();
  const endsAtRaw =
    o.ends_at != null
      ? String(o.ends_at).trim()
      : o.endsAt != null
        ? String(o.endsAt).trim()
        : "";
  const territoryRaw = o.territory != null ? String(o.territory).trim() : "";
  const notesRaw = o.notes != null ? String(o.notes).trim() : "";

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
      exclusivity: normalizeRepresentationExclusivity(String(o.exclusivity ?? "")),
      territory: territoryRaw ? territoryRaw.slice(0, 300) : null,
      startsAt,
      endsAt: endsAtRaw || null,
      notes: notesRaw ? notesRaw.slice(0, 2000) : null,
    },
  };
}

export async function insertRepresentationRelationship(
  service: SupabaseClient,
  input: CreateRepresentationRelationshipInput
): Promise<{ id: string } | null> {
  const now = new Date().toISOString();
  const { data, error } = await service
    .from("representation_relationships")
    .insert({
      artist_user_id: input.artistUserId,
      gallery_id: input.galleryId,
      deal_id: input.dealId,
      status: "active",
      exclusivity: input.exclusivity,
      territory: input.territory,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      notes: input.notes,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return { id: String(data.id) };
}

export async function loadGalleryDisplayName(
  service: SupabaseClient,
  galleryId: string
): Promise<string | null> {
  const { data } = await service
    .from("galleries")
    .select("name")
    .eq("id", galleryId)
    .maybeSingle();
  const name = String(data?.name ?? "").trim();
  return name || null;
}
