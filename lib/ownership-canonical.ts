import type { SupabaseClient } from "@supabase/supabase-js";

import { getCanonicalOwner } from "@/lib/canonical-ownership-engine";

/**
 * Canonical ownership model (PR-BETA.5c.1)
 *
 * SOURCE OF TRUTH: `ownership_events` — latest row by (created_at desc, id desc).
 * Effective holder: `to_user_id` (canonical production column).
 *
 * CACHE (denormalized, must mirror ledger):
 * - `artworks.current_owner_id` — updated by `trg_ownership_events_sync_current_owner` on INSERT
 * - `artwork_read_model.ledger_latest_owner_id` — view projection of latest ledger holder
 *
 * WORKFLOW / INTENT ONLY (must NOT imply ownership):
 * - `provenance_transfers` (pending until accept → ownership_events)
 * - `ownership_claims` (pending until artist approval → ownership_events)
 * - `deal_execution_records` (deal filing state; acquisition completes via provenance accept)
 */

export type OwnershipEventHolderRow = {
  artwork_id?: string | null;
  to_user_id?: string | null;
  to_owner_id?: string | null;
  to_owner?: string | null;
  owner_id?: string | null;
  created_at?: string | null;
  id?: string | number | null;
};

export function resolveHolderUserIdFromEvent(
  row: OwnershipEventHolderRow | null | undefined
): string | null {
  if (!row) return null;
  const value = row.to_user_id;
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export function pickLatestOwnershipEvent<T extends OwnershipEventHolderRow>(
  rows: T[]
): T | null {
  if (rows.length === 0) return null;

  let latest = rows[0];
  for (const row of rows.slice(1)) {
    const nextTime = new Date(String(row.created_at ?? 0)).getTime();
    const prevTime = new Date(String(latest.created_at ?? 0)).getTime();
    if (
      nextTime > prevTime ||
      (nextTime === prevTime && String(row.id ?? "") > String(latest.id ?? ""))
    ) {
      latest = row;
    }
  }
  return latest;
}

export function resolveCanonicalHolderForArtwork(
  artworkId: string,
  rows: OwnershipEventHolderRow[]
): string | null {
  const aid = String(artworkId ?? "").trim();
  if (!aid) return null;
  const scoped = rows.filter((row) => String(row.artwork_id ?? "") === aid);
  return resolveHolderUserIdFromEvent(pickLatestOwnershipEvent(scoped));
}

export function resolveCachedOwnerId(
  artwork: Record<string, unknown>
): string | null {
  /** Cache columns — diagnostics only; never authoritative (PR-BETA.7). */
  for (const key of ["ledger_latest_owner_id", "current_owner_id"] as const) {
    const value = artwork[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export async function fetchCanonicalHolderForArtwork(
  supabase: SupabaseClient,
  artworkId: string
): Promise<string | null> {
  const owner = await getCanonicalOwner(supabase, artworkId);
  return owner.userId;
}

export function ownershipCacheMatchesLedger(args: {
  cachedOwnerId: string | null;
  ledgerHolderId: string | null;
}): boolean {
  const cached = args.cachedOwnerId?.trim() || null;
  const ledger = args.ledgerHolderId?.trim() || null;
  return cached === ledger;
}
