export type AcquisitionDealCounterparty = {
  userId: string;
  label: string;
} | null;

/** Resolve the auth user id to address for an acquisition deal on a registry record. */
export function resolveAcquisitionDealCounterparty(args: {
  artistUserId: string | null;
  artistName: string;
  currentOwnerUserId: string | null;
  currentOwnerDisplayName: string | null;
}): AcquisitionDealCounterparty {
  const stewardId = String(args.currentOwnerUserId ?? "").trim() || null;
  const artistId = String(args.artistUserId ?? "").trim() || null;
  const userId = stewardId || artistId;
  if (!userId) return null;

  const stewardLabel = String(args.currentOwnerDisplayName ?? "").trim();
  const label =
    stewardId && stewardLabel ? stewardLabel : args.artistName.trim() || "Counterparty";

  return { userId, label };
}

/** Show acquisition CTA when viewer can propose to steward or artist, but is neither. */
export function shouldShowAcquisitionDealCta(args: {
  sessionUserId: string | null;
  counterpartyUserId: string | null;
  currentOwnerUserId: string | null;
  pendingAcquisitionOnArtwork?: boolean;
}): boolean {
  const session = String(args.sessionUserId ?? "").trim();
  const counterparty = String(args.counterpartyUserId ?? "").trim();
  const owner = String(args.currentOwnerUserId ?? "").trim();

  if (!session || !counterparty) return false;
  if (session === counterparty) return false;
  if (owner && session === owner) return false;
  if (args.pendingAcquisitionOnArtwork) return false;
  return true;
}

export function acquisitionDealWorkLabel(args: {
  title: string | null | undefined;
  registryId: string | null | undefined;
}): string {
  const title = String(args.title ?? "").trim();
  if (title) return title;
  const registryId = String(args.registryId ?? "").trim();
  if (registryId) return registryId;
  return "Work on file";
}
