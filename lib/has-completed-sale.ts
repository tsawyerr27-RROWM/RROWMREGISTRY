import type { SupabaseClient } from "@supabase/supabase-js";

import { isSaleLikeValueType } from "@/lib/deal-acquisition-value";

export type SaleCompletionProbe = {
  value_type?: string | null;
  source?: string | null;
  metadata?: unknown;
};

/** True when a value_events row records a completed sale on the chronology. */
export function isSaleCompletionValueEvent(row: SaleCompletionProbe): boolean {
  const valueType = String(row.value_type ?? "")
    .toLowerCase()
    .trim();
  const source = String(row.source ?? "")
    .toLowerCase()
    .trim();

  if (source === "deal_execution" || source === "market_sale") {
    return true;
  }

  if (
    valueType === "sale_value" ||
    valueType === "auction_sale" ||
    valueType === "gallery_resale" ||
    valueType === "market_sale"
  ) {
    return true;
  }

  if (isSaleLikeValueType(valueType)) {
    return true;
  }

  const meta = row.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const acquisition = (meta as Record<string, unknown>).acquisition;
    if (acquisition === true || acquisition === "true") {
      return true;
    }
  }

  return false;
}

function markCompleted(
  map: Record<string, boolean>,
  artworkId: string | null | undefined
) {
  const id = String(artworkId ?? "").trim();
  if (id) map[id] = true;
}

/** Batch probe: sale_value, closed acquisition deals, sold marketplace listings. */
export async function fetchCompletedSaleByArtworkIds(
  client: SupabaseClient,
  artworkIds: string[]
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  const ids = artworkIds.map((id) => String(id ?? "").trim()).filter(Boolean);
  for (const id of ids) result[id] = false;
  if (ids.length === 0) return result;

  const [valueRes, dealRes, listingRes] = await Promise.all([
    client
      .from("value_events")
      .select("artwork_id, value_type, source, metadata")
      .in("artwork_id", ids),
    client
      .from("deals")
      .select("artwork_id")
      .in("artwork_id", ids)
      .eq("type", "acquisition")
      .eq("status", "closed"),
    client
      .from("market_listings")
      .select("artwork_id")
      .in("artwork_id", ids)
      .eq("status", "sold"),
  ]);

  for (const row of valueRes.data ?? []) {
    if (isSaleCompletionValueEvent(row)) {
      markCompleted(result, row.artwork_id);
    }
  }

  for (const row of dealRes.data ?? []) {
    markCompleted(result, row.artwork_id);
  }

  for (const row of listingRes.data ?? []) {
    markCompleted(result, row.artwork_id);
  }

  return result;
}

export async function hasCompletedSale(
  client: SupabaseClient,
  artworkId: string
): Promise<boolean> {
  const id = String(artworkId ?? "").trim();
  if (!id) return false;
  const map = await fetchCompletedSaleByArtworkIds(client, [id]);
  return Boolean(map[id]);
}
