import type { SupabaseClient } from "@supabase/supabase-js";

import {
  OWNERSHIP_EVENT_HOLDER_SELECT,
  OWNERSHIP_EVENT_TIMELINE_SELECT,
} from "@/lib/ownership-events-schema";
import {
  pickLatestOwnershipEvent,
  resolveHolderUserIdFromEvent,
  type OwnershipEventHolderRow,
} from "@/lib/ownership-canonical";

/** Canonical holder — latest ownership_events.to_user_id only (ledger authority). */
export type CanonicalOwner = {
  userId: string | null;
  ownershipEventId: string | null;
  createdAt: string | null;
};

export type OwnershipTimelineEntry = {
  id: string;
  artwork_id: string;
  created_at: string;
  transfer_type: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  from_label: string | null;
  to_label: string | null;
  notes: string | null;
  provenance_transfer_id: string | null;
  deal_id: string | null;
  value_event_id: string | null;
  sale_price: number | null;
  sale_currency: string | null;
};

export type OwnershipIntegrityIssue = {
  code: string;
  artwork_id?: string;
  user_id?: string;
  detail: string;
};

export type OwnershipIntegrityReport = {
  pass: boolean;
  issues: OwnershipIntegrityIssue[];
};

function parseDealIdFromNotes(note: string | null | undefined): string | null {
  const match = String(note ?? "").match(/deal_id=([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

function partyLabel(
  ev: Record<string, unknown>,
  side: "from" | "to"
): string | null {
  const nameKey = side === "from" ? "from_name" : "to_name";
  const uidKey = side === "from" ? "from_user_id" : "to_user_id";
  const name = String(ev[nameKey] ?? "").trim();
  if (name) return name;
  const uid = String(ev[uidKey] ?? "").trim();
  return uid ? `${uid.slice(0, 8)}…` : null;
}

function toCanonicalOwner(
  row: OwnershipEventHolderRow | null
): CanonicalOwner {
  if (!row) {
    return { userId: null, ownershipEventId: null, createdAt: null };
  }
  return {
    userId: resolveHolderUserIdFromEvent(row),
    ownershipEventId:
      row.id != null ? String(row.id) : null,
    createdAt: row.created_at != null ? String(row.created_at) : null,
  };
}

async function loadHolderRowsForArtwork(
  service: SupabaseClient,
  artworkId: string
): Promise<OwnershipEventHolderRow[]> {
  const aid = String(artworkId ?? "").trim();
  if (!aid) return [];

  const { data, error } = await service
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_HOLDER_SELECT)
    .eq("artwork_id", aid)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("[canonical-ownership-engine] load_holder_rows", {
      artwork_id: aid,
      message: error.message,
    });
    return [];
  }

  return (data ?? []) as OwnershipEventHolderRow[];
}

function groupLatestByArtwork(
  rows: OwnershipEventHolderRow[]
): Map<string, OwnershipEventHolderRow> {
  const byArt = new Map<string, OwnershipEventHolderRow[]>();
  for (const row of rows) {
    const aid = String(row.artwork_id ?? "").trim();
    if (!aid) continue;
    if (!byArt.has(aid)) byArt.set(aid, []);
    byArt.get(aid)!.push(row);
  }

  const latest = new Map<string, OwnershipEventHolderRow>();
  for (const [aid, artRows] of byArt) {
    const picked = pickLatestOwnershipEvent(artRows);
    if (picked) latest.set(aid, picked);
  }
  return latest;
}

/** Artworks where user appears as recipient on any ledger row (search narrowing only). */
async function listArtworkIdsWithRecipientHistory(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const { data, error } = await service
    .from("ownership_events")
    .select("artwork_id")
    .eq("to_user_id", uid);

  if (error) {
    console.error(
      "[canonical-ownership-engine] list_recipient_artwork_ids",
      error.message
    );
    return [];
  }

  return [
    ...new Set(
      (data ?? [])
        .map((row) => String(row.artwork_id ?? "").trim())
        .filter(Boolean)
    ),
  ];
}

/** Latest holder row per artwork — full event history, no user pre-filter. */
async function loadLatestHolderByArtworkIds(
  service: SupabaseClient,
  artworkIds: string[]
): Promise<Map<string, OwnershipEventHolderRow>> {
  const ids = [
    ...new Set(artworkIds.map((id) => String(id ?? "").trim()).filter(Boolean)),
  ];
  if (ids.length === 0) return new Map();

  const { data, error } = await service
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_HOLDER_SELECT)
    .in("artwork_id", ids)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error(
      "[canonical-ownership-engine] load_latest_holder_by_artwork_ids",
      error.message
    );
    return new Map();
  }

  return groupLatestByArtwork((data ?? []) as OwnershipEventHolderRow[]);
}

/** Latest ledger holder for one artwork (ownership_events only). */
export async function getCanonicalOwner(
  service: SupabaseClient,
  artworkId: string
): Promise<CanonicalOwner> {
  const rows = await loadHolderRowsForArtwork(service, artworkId);
  return toCanonicalOwner(pickLatestOwnershipEvent(rows));
}

/** Batch canonical holders — ledger authority only. */
export async function getCanonicalOwners(
  service: SupabaseClient,
  artworkIds: string[]
): Promise<Record<string, CanonicalOwner>> {
  const ids = [
    ...new Set(artworkIds.map((id) => String(id ?? "").trim()).filter(Boolean)),
  ];
  const out: Record<string, CanonicalOwner> = {};
  for (const id of ids) {
    out[id] = { userId: null, ownershipEventId: null, createdAt: null };
  }
  if (ids.length === 0) return out;

  const { data, error } = await service
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_HOLDER_SELECT)
    .in("artwork_id", ids)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("[canonical-ownership-engine] get_canonical_owners", error.message);
    return out;
  }

  const latestByArt = groupLatestByArtwork((data ?? []) as OwnershipEventHolderRow[]);
  for (const id of ids) {
    out[id] = toCanonicalOwner(latestByArt.get(id) ?? null);
  }
  return out;
}

export async function isCurrentOwner(
  service: SupabaseClient,
  userId: string,
  artworkId: string
): Promise<boolean> {
  const uid = String(userId ?? "").trim();
  if (!uid) return false;
  const owner = await getCanonicalOwner(service, artworkId);
  return owner.userId === uid;
}

/**
 * Artwork ids where userId is the latest ownership_events holder.
 * Never uses artworks.current_owner_id or read-model cache.
 */
export async function getOwnedArtworkIds(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const candidateIds = await listArtworkIdsWithRecipientHistory(service, uid);
  if (candidateIds.length === 0) return [];

  const latestByArt = await loadLatestHolderByArtworkIds(service, candidateIds);
  const owned: string[] = [];
  for (const [aid, row] of latestByArt) {
    if (resolveHolderUserIdFromEvent(row) === uid) owned.push(aid);
  }
  return owned;
}

/** Artworks the user held previously but no longer holds (latest holder ≠ user). */
export async function getTransferredArtworkIds(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const candidateIds = await listArtworkIdsWithRecipientHistory(service, uid);
  if (candidateIds.length === 0) return [];

  const latestByArt = await loadLatestHolderByArtworkIds(service, candidateIds);
  const transferred: string[] = [];
  for (const aid of candidateIds) {
    const holder = resolveHolderUserIdFromEvent(latestByArt.get(aid) ?? null);
    if (holder !== uid) transferred.push(aid);
  }
  return transferred;
}

/** Ordered ownership ledger chronology for an artwork. */
export async function getOwnershipTimeline(
  service: SupabaseClient,
  artworkId: string
): Promise<OwnershipTimelineEntry[]> {
  const aid = String(artworkId ?? "").trim();
  if (!aid) return [];

  const { data: rows, error } = await service
    .from("ownership_events")
    .select(OWNERSHIP_EVENT_TIMELINE_SELECT)
    .eq("artwork_id", aid)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error || !rows?.length) return [];

  return rows.map((row) => {
    const ev = row as Record<string, unknown>;
    const notes = ev.notes != null ? String(ev.notes) : null;
    return {
      id: String(ev.id ?? ""),
      artwork_id: aid,
      created_at: String(ev.created_at ?? ""),
      transfer_type: ev.transfer_type != null ? String(ev.transfer_type) : null,
      from_user_id:
        ev.from_user_id != null ? String(ev.from_user_id) : null,
      to_user_id: ev.to_user_id != null ? String(ev.to_user_id) : null,
      from_label: partyLabel(ev, "from"),
      to_label: partyLabel(ev, "to"),
      notes,
      provenance_transfer_id:
        ev.provenance_transfer_id != null
          ? String(ev.provenance_transfer_id)
          : null,
      deal_id: parseDealIdFromNotes(notes),
      value_event_id:
        ev.value_event_id != null ? String(ev.value_event_id) : null,
      sale_price:
        ev.sale_price != null && !Number.isNaN(Number(ev.sale_price))
          ? Number(ev.sale_price)
          : null,
      sale_currency:
        ev.sale_currency != null ? String(ev.sale_currency) : null,
    };
  });
}

/** Per-artwork integrity: cache vs ledger, read-model vs ledger, orphan transfers. */
export async function validateOwnershipIntegrity(
  service: SupabaseClient,
  artworkId: string
): Promise<OwnershipIntegrityReport> {
  const aid = String(artworkId ?? "").trim();
  const issues: OwnershipIntegrityIssue[] = [];
  if (!aid) {
    return {
      pass: false,
      issues: [{ code: "invalid_artwork_id", detail: "artwork id required" }],
    };
  }

  const owner = await getCanonicalOwner(service, aid);

  const { data: art } = await service
    .from("artworks")
    .select("current_owner_id")
    .eq("id", aid)
    .maybeSingle();

  const cached = String(art?.current_owner_id ?? "").trim() || null;
  if (cached !== owner.userId) {
    issues.push({
      code: "cache_vs_ledger",
      artwork_id: aid,
      detail: `artworks.current_owner_id=${cached ?? "null"} ledger holder=${owner.userId ?? "null"}`,
    });
  }

  const { data: rm, error: rmError } = await service
    .from("artwork_read_model")
    .select("ledger_latest_owner_id")
    .eq("id", aid)
    .maybeSingle();

  if (!rmError && rm) {
    const rmHolder =
      String(rm.ledger_latest_owner_id ?? "").trim() || null;
    if (rmHolder !== owner.userId) {
      issues.push({
        code: "read_model_vs_ledger",
        artwork_id: aid,
        detail: `artwork_read_model.ledger_latest_owner_id=${rmHolder ?? "null"} ledger holder=${owner.userId ?? "null"}`,
      });
    }
  }

  const timeline = await getOwnershipTimeline(service, aid);
  const timelineLatest = timeline.at(-1)?.to_user_id ?? null;
  if (owner.userId && timelineLatest && owner.userId !== timelineLatest) {
    issues.push({
      code: "chronology_vs_ledger",
      artwork_id: aid,
      detail: `resolver holder ${owner.userId} ≠ timeline latest ${timelineLatest}`,
    });
  }

  const { data: completedTransfers } = await service
    .from("provenance_transfers")
    .select("id, ownership_event_id, status")
    .eq("artwork_id", aid)
    .eq("status", "completed");

  for (const tr of completedTransfers ?? []) {
    const oeId = String((tr as { ownership_event_id?: string }).ownership_event_id ?? "").trim();
    if (!oeId) {
      issues.push({
        code: "completed_transfer_without_ownership_event",
        artwork_id: aid,
        detail: `provenance_transfer ${String((tr as { id?: string }).id ?? "")} completed without ownership_event_id`,
      });
    }
  }

  return { pass: issues.length === 0, issues };
}
