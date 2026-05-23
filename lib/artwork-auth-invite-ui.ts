import type { ArtworkAuthenticationInviteRow } from "@/lib/artwork-authentication-invite";

/** Artwork IDs with a completed artwork authentication invitation. */
export function authenticatedArtworkAuthInviteIds(
  invites: ArtworkAuthenticationInviteRow[]
): Set<string> {
  const out = new Set<string>();
  for (const row of invites) {
    if (row.status === "authenticated" && row.artwork_id) {
      out.add(String(row.artwork_id));
    }
  }
  return out;
}

/** Latest pending invite per artwork (for “Invitation on file” in Works). */
export function pendingArtworkAuthInviteByArtworkId(
  invites: ArtworkAuthenticationInviteRow[]
): Map<string, ArtworkAuthenticationInviteRow> {
  const map = new Map<string, ArtworkAuthenticationInviteRow>();
  for (const row of invites) {
    if (row.status !== "pending" || !row.artwork_id) continue;
    const id = String(row.artwork_id);
    if (!map.has(id)) map.set(id, row);
  }
  return map;
}

/** Institution-filed work still awaiting artist attestation depth. */
export function artworkNeedsAuthenticationInvite(
  artworkId: string,
  awaitingAttestationIds: Set<string>,
  authenticatedInviteIds: Set<string>
): boolean {
  if (authenticatedInviteIds.has(artworkId)) return false;
  return awaitingAttestationIds.has(artworkId);
}
