import type { SupabaseClient } from "@supabase/supabase-js";

export type ProvenanceEventKind = "evidence";

export type ProvenanceEvidenceCategory = "exhibition";

export type ExhibitionProvenanceMetadata = {
  category: ProvenanceEvidenceCategory;
  venue: string;
  city: string | null;
  start_date: string;
  end_date: string | null;
  note: string | null;
  deal_id: string;
};

export type ProvenanceEvidenceEventRow = {
  id: string;
  artwork_id: string;
  kind: ProvenanceEventKind;
  metadata: ExhibitionProvenanceMetadata;
  recorded_by_user_id: string | null;
  occurred_at: string;
  created_at: string;
};

export function buildExhibitionProvenanceMetadata(args: {
  dealId: string;
  venue: string;
  city?: string | null;
  startDate: string;
  endDate?: string | null;
  note?: string | null;
}): ExhibitionProvenanceMetadata {
  return {
    category: "exhibition",
    venue: args.venue,
    city: args.city ?? null,
    start_date: args.startDate,
    end_date: args.endDate ?? null,
    note: args.note ?? null,
    deal_id: args.dealId,
  };
}

export function parseExhibitionProvenanceMetadata(
  raw: unknown
): ExhibitionProvenanceMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (String(o.category ?? "").toLowerCase().trim() !== "exhibition") return null;
  const venue = String(o.venue ?? "").trim();
  const startDate = String(o.start_date ?? "").trim();
  const dealId = String(o.deal_id ?? "").trim();
  if (!venue || !startDate || !dealId) return null;
  return {
    category: "exhibition",
    venue,
    city: o.city != null ? String(o.city).trim() || null : null,
    start_date: startDate,
    end_date: o.end_date != null ? String(o.end_date).trim() || null : null,
    note: o.note != null ? String(o.note).trim() || null : null,
    deal_id: dealId,
  };
}

export function exhibitionProvenanceDisplayTitle(metadata: ExhibitionProvenanceMetadata): string {
  return `Exhibition · ${metadata.venue}`;
}

export function exhibitionProvenanceParticipantLabel(
  metadata: ExhibitionProvenanceMetadata
): string {
  const parts: string[] = [];
  if (metadata.city) parts.push(metadata.city);
  if (metadata.start_date) {
    parts.push(
      metadata.end_date && metadata.end_date !== metadata.start_date
        ? `${metadata.start_date} – ${metadata.end_date}`
        : metadata.start_date
    );
  }
  return parts.length > 0 ? parts.join(" · ") : metadata.venue;
}

export async function insertProvenanceEvidenceEvent(
  service: SupabaseClient,
  args: {
    artworkId: string;
    recordedByUserId: string;
    occurredAt: string;
    metadata: ExhibitionProvenanceMetadata;
  }
): Promise<{ id: string } | null> {
  const { data, error } = await service
    .from("provenance_events")
    .insert({
      artwork_id: args.artworkId,
      kind: "evidence",
      metadata: args.metadata,
      recorded_by_user_id: args.recordedByUserId,
      occurred_at: args.occurredAt,
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return { id: String(data.id) };
}

export async function findProvenanceEvidenceByDealId(
  service: SupabaseClient,
  args: {
    artworkId: string;
    dealId: string;
    category: ProvenanceEvidenceCategory;
  }
): Promise<{ id: string; occurred_at: string; metadata: ExhibitionProvenanceMetadata } | null> {
  const { data, error } = await service
    .from("provenance_events")
    .select("id, occurred_at, metadata, artwork_id, kind")
    .eq("artwork_id", args.artworkId)
    .eq("kind", "evidence")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data?.length) return null;

  const row = data.find((r) => {
    const meta = parseExhibitionProvenanceMetadata((r as { metadata?: unknown }).metadata);
    return meta?.deal_id === args.dealId && meta.category === args.category;
  });

  if (!row?.id) return null;
  const metadata = parseExhibitionProvenanceMetadata(
    (row as { metadata?: unknown }).metadata
  );
  if (!metadata) return null;

  return {
    id: String(row.id),
    occurred_at: String((row as { occurred_at?: string }).occurred_at ?? ""),
    metadata,
  };
}
