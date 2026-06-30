export type CreativeOwnershipFilter =
  | "owned_by_you"
  | "needs_transfer"
  | "sold_transferred"
  | "full_catalogue";

export const CREATIVE_OWNERSHIP_FILTER_DEFAULT: CreativeOwnershipFilter =
  "owned_by_you";

export function isSoldOrTransferredArtwork(args: {
  artworkId: string;
  transferredArtworkIds: ReadonlySet<string>;
  outboundPendingArtworkIds: ReadonlySet<string>;
}): boolean {
  const id = String(args.artworkId || "");
  if (!id) return false;
  return (
    args.transferredArtworkIds.has(id) ||
    args.outboundPendingArtworkIds.has(id)
  );
}

export function passesCreativeOwnershipFilter(args: {
  artworkId: string;
  filter: CreativeOwnershipFilter;
  canonicalHolderId: string | null;
  viewerUserId: string | null | undefined;
  hasSaleSignal: boolean;
  transferredArtworkIds: ReadonlySet<string>;
  outboundPendingArtworkIds: ReadonlySet<string>;
}): boolean {
  const {
    artworkId,
    filter,
    canonicalHolderId,
    viewerUserId,
    hasSaleSignal,
    transferredArtworkIds,
    outboundPendingArtworkIds,
  } = args;

  const ownedByYou =
    Boolean(viewerUserId) && canonicalHolderId === viewerUserId;
  const soldTransferred = isSoldOrTransferredArtwork({
    artworkId,
    transferredArtworkIds,
    outboundPendingArtworkIds,
  });

  switch (filter) {
    case "owned_by_you":
      return ownedByYou;
    case "needs_transfer":
      return hasSaleSignal;
    case "sold_transferred":
      return soldTransferred;
    case "full_catalogue":
      return true;
    default:
      return true;
  }
}
