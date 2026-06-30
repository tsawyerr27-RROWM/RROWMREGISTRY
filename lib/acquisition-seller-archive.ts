import type { SupabaseClient } from "@supabase/supabase-js";

export type AcquisitionSellerArchiveStatus =
  | "none"
  | "pending_outbound"
  | "transferred";

const PENDING_OUTBOUND_STATUSES = new Set(["pending_acceptance", "initiated"]);

/** Artwork ids with an outbound provenance transfer awaiting buyer acceptance. */
export async function listOutboundPendingAcquisitionArtworkIds(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const { data, error } = await service
    .from("provenance_transfers")
    .select("artwork_id, status")
    .eq("from_user_id", uid)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data?.length) return [];

  const ids = new Set<string>();
  for (const row of data) {
    const status = String((row as { status?: string }).status ?? "")
      .toLowerCase()
      .trim();
    if (!PENDING_OUTBOUND_STATUSES.has(status)) continue;
    const aid = String((row as { artwork_id?: string }).artwork_id ?? "").trim();
    if (aid) ids.add(aid);
  }
  return [...ids];
}

export function resolveAcquisitionSellerArchiveStatus(args: {
  artworkId: string;
  pendingOutboundArtworkIds: ReadonlySet<string>;
  transferredArtworkIds: ReadonlySet<string>;
}): AcquisitionSellerArchiveStatus {
  const id = String(args.artworkId ?? "").trim();
  if (!id) return "none";
  if (args.transferredArtworkIds.has(id)) return "transferred";
  if (args.pendingOutboundArtworkIds.has(id)) return "pending_outbound";
  return "none";
}
