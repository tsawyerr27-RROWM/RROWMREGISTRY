import type { SupabaseClient } from "@supabase/supabase-js";

import { OWNERSHIP_EVENT_HOLDER_SELECT } from "@/lib/ownership-events-schema";

export type ProvenanceAcceptPostState = {
  transfer_status: string | null;
  transfer_from_user_id: string | null;
  ownership_event_id: string | null;
  ownership_event_to_user_id: string | null;
  artwork_current_owner_id: string | null;
  owner_cache_matches_buyer: boolean;
};

/** Service-role verification after accept_provenance_transfer RPC succeeds. */
export async function loadProvenanceAcceptPostState(
  service: SupabaseClient,
  args: {
    artworkId: string;
    buyerUserId: string;
    ownershipEventId: string;
    provenanceTransferId?: string | null;
  }
): Promise<ProvenanceAcceptPostState> {
  const artworkId = String(args.artworkId ?? "").trim();
  const buyerUserId = String(args.buyerUserId ?? "").trim();
  const ownershipEventId = String(args.ownershipEventId ?? "").trim();
  const transferId = String(args.provenanceTransferId ?? "").trim();

  let transfer_status: string | null = null;
  let transfer_from_user_id: string | null = null;

  if (transferId) {
    const { data: tr } = await service
      .from("provenance_transfers")
      .select("status, from_user_id")
      .eq("id", transferId)
      .maybeSingle();
    transfer_status = tr?.status != null ? String(tr.status) : null;
    transfer_from_user_id =
      tr?.from_user_id != null ? String(tr.from_user_id) : null;
  }

  let ownership_event_to_user_id: string | null = null;
  if (ownershipEventId) {
    const { data: oe } = await service
      .from("ownership_events")
      .select(OWNERSHIP_EVENT_HOLDER_SELECT)
      .eq("id", ownershipEventId)
      .maybeSingle();
    ownership_event_to_user_id =
      oe?.to_user_id != null ? String(oe.to_user_id) : null;
  }

  let artwork_current_owner_id: string | null = null;
  if (artworkId) {
    const { data: art } = await service
      .from("artworks")
      .select("current_owner_id")
      .eq("id", artworkId)
      .maybeSingle();
    artwork_current_owner_id =
      art?.current_owner_id != null ? String(art.current_owner_id) : null;
  }

  return {
    transfer_status,
    transfer_from_user_id,
    ownership_event_id: ownershipEventId || null,
    ownership_event_to_user_id,
    artwork_current_owner_id,
    owner_cache_matches_buyer:
      Boolean(buyerUserId) &&
      artwork_current_owner_id === buyerUserId &&
      ownership_event_to_user_id === buyerUserId,
  };
}

export function logProvenanceAccept(
  step: string,
  payload: Record<string, unknown>
): void {
  console.error("[provenance accept]", step, payload);
}
