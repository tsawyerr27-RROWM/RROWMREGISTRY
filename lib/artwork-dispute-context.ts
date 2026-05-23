import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { hasActiveDispute } from "@/lib/disputes";

export type ArtworkDisputeFormContext = {
  latestOwnershipEventId: string | null;
  ownershipDisputed: boolean;
  artistDisputed: boolean;
  relationshipDisputed: boolean;
  invForRegistry: { id: string } | null;
};

export function isRecordUnderReview(ctx: ArtworkDisputeFormContext): boolean {
  return (
    ctx.ownershipDisputed ||
    ctx.artistDisputed ||
    ctx.relationshipDisputed
  );
}

/**
 * Shared targets for governance forms and “under review” state for an artwork.
 */
export async function getArtworkDisputeFormContext(
  supabase: SupabaseClient,
  args: { artworkId: string; artistId: string | null }
): Promise<ArtworkDisputeFormContext> {
  const svc = createSupabaseServiceClient();
  const { artworkId, artistId } = args;

  const { data: latestOwnEv } = await svc
    .from("ownership_events")
    .select("id")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestOwnershipEventId = latestOwnEv?.id
    ? String(latestOwnEv.id)
    : null;

  const ownershipDisputed = latestOwnershipEventId
    ? await hasActiveDispute(svc, "ownership", latestOwnershipEventId)
    : false;

  const artistDisputed = artistId
    ? await hasActiveDispute(svc, "artist", artistId)
    : false;

  let invForRegistry: { id: string } | null = null;
  if (artistId) {
    const { data: arGal } = await supabase
      .from("artists")
      .select("gallery_id")
      .eq("id", artistId)
      .maybeSingle();
    const gid = arGal?.gallery_id?.trim() || "";
    if (gid) {
      const { data: inv } = await svc
        .from("gallery_artist_invites")
        .select("id")
        .eq("accepted_user_id", artistId)
        .eq("gallery_id", gid)
        .maybeSingle();
      invForRegistry = inv?.id ? { id: String(inv.id) } : null;
    }
  }

  const relationshipDisputed = invForRegistry?.id
    ? await hasActiveDispute(svc, "gallery_relationship", invForRegistry.id)
    : false;

  return {
    latestOwnershipEventId,
    ownershipDisputed,
    artistDisputed,
    relationshipDisputed,
    invForRegistry,
  };
}
