import type { SupabaseClient } from "@supabase/supabase-js";

export const STUDIO_CERT_ACK_PREFIX = "rrowm:studio:cert_ack:";

export function studioCertAckKey(registryId: string) {
  return `${STUDIO_CERT_ACK_PREFIX}${registryId}`;
}

export function isSaleLikeValueType(valueType: string | null | undefined) {
  const v = String(valueType || "")
    .toLowerCase()
    .trim()
    .replaceAll("_", " ");
  return (
    v === "sale" ||
    v === "auction" ||
    v === "primary sale" ||
    v === "secondary sale"
  );
}

/** Artworks with a sale-like value row that still needs an ownership transfer. */
export async function getUnresolvedSaleSignals(
  supabase: SupabaseClient,
  artworkIds: string[]
): Promise<{
  artworkIds: string[];
  valueEventIds: Set<string>;
}> {
  if (artworkIds.length === 0) {
    return { artworkIds: [], valueEventIds: new Set() };
  }

  const withResolved = await supabase
    .from("value_events")
    .select("id, artwork_id, value_type, created_at, ownership_resolved")
    .in("artwork_id", artworkIds)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    artwork_id: string;
    value_type: string | null;
    created_at: string | null;
    ownership_resolved?: boolean | null;
  };

  let valueRows: Row[] | null = null;

  if (withResolved.error) {
    const fallback = await supabase
      .from("value_events")
      .select("id, artwork_id, value_type, created_at")
      .in("artwork_id", artworkIds)
      .order("created_at", { ascending: false });
    if (fallback.error) return { artworkIds: [], valueEventIds: new Set() };
    valueRows = (fallback.data || []) as Row[];
  } else {
    valueRows = (withResolved.data || []) as Row[];
  }

  const sales = (valueRows || []).filter((r) =>
    isSaleLikeValueType(String(r.value_type || ""))
  );
  if (sales.length === 0) return { artworkIds: [], valueEventIds: new Set() };

  const saleIds = sales.map((s) => s.id);
  const ownershipLinkFetch = await supabase
    .from("ownership_events")
    .select("value_event_id")
    .in("value_event_id", saleIds);
  const linked = new Set(
    (ownershipLinkFetch.data || [])
      .map((r: { value_event_id?: string | null }) => r.value_event_id || "")
      .filter(Boolean)
  );

  const mapArt = new Set<string>();
  const mapVe = new Set<string>();

  for (const row of sales) {
    const artworkId = String(row.artwork_id || "");
    if (!artworkId) continue;
    const explicitResolved = row.ownership_resolved === true;
    const hasLinkedOwnership = linked.has(String(row.id || ""));
    const unresolved = !explicitResolved && !hasLinkedOwnership;
    if (!unresolved) continue;
    mapArt.add(artworkId);
    mapVe.add(String(row.id));
  }

  return {
    artworkIds: [...mapArt],
    valueEventIds: mapVe,
  };
}
