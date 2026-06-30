export type ValueChronologyPhase = "price_discovery" | "market_evidence";

/** @deprecated Use price_discovery / market_evidence */
export type LegacyValueChronologyPhase = "primary" | "secondary";

export type ArtworkStewardshipRole =
  | "artist_and_steward"
  | "artist_only"
  | "steward_only"
  | "viewer";

/** Manual value types permitted during price discovery (pre-sale). */
export const PRICE_DISCOVERY_MANUAL_VALUE_TYPES = [
  "initial_valuation",
  "valuation",
  "exhibition_value",
  "listing_value",
  "appraisal",
  // Legacy aliases still accepted in filings
  "initial",
  "internal_estimate",
] as const;

/** @deprecated Use PRICE_DISCOVERY_MANUAL_VALUE_TYPES */
export const PRIMARY_MARKET_MANUAL_VALUE_TYPES = PRICE_DISCOVERY_MANUAL_VALUE_TYPES;

export type PriceDiscoveryManualValueType =
  (typeof PRICE_DISCOVERY_MANUAL_VALUE_TYPES)[number];

export function resolveValueChronologyPhase(args: {
  hasCompletedSale?: boolean;
}): ValueChronologyPhase {
  return args.hasCompletedSale ? "market_evidence" : "price_discovery";
}

export function isPriceDiscoveryPhase(args: {
  hasCompletedSale?: boolean;
}): boolean {
  return !args.hasCompletedSale;
}

export function isPriceDiscoveryManualValueType(
  valueType: string | null | undefined
): boolean {
  const normalized = String(valueType ?? "")
    .trim()
    .toLowerCase();
  return (PRICE_DISCOVERY_MANUAL_VALUE_TYPES as readonly string[]).includes(
    normalized
  );
}

/** @deprecated Use isPriceDiscoveryManualValueType */
export const isPrimaryMarketManualValueType = isPriceDiscoveryManualValueType;

export function canRecordValueEvent(args: {
  userId: string | null | undefined;
  artworkId: string | null | undefined;
  artistId?: string | null;
  hasCompletedSale?: boolean;
  isAdmin?: boolean;
}): boolean {
  if (args.isAdmin) return true;

  const userId = String(args.userId ?? "").trim();
  const artworkId = String(args.artworkId ?? "").trim();
  const artistId = String(args.artistId ?? "").trim();
  if (!userId || !artworkId || !artistId) return false;

  if (userId !== artistId) return false;

  return isPriceDiscoveryPhase({ hasCompletedSale: args.hasCompletedSale });
}

export function resolveArtworkStewardshipRole(args: {
  userId: string | null | undefined;
  artistId?: string | null;
  canonicalOwnerUserId?: string | null;
}): ArtworkStewardshipRole {
  const userId = String(args.userId ?? "").trim();
  const artistId = String(args.artistId ?? "").trim();
  const stewardId = String(args.canonicalOwnerUserId ?? "").trim() || artistId;

  const isArtist = Boolean(artistId) && artistId === userId;
  const isSteward = Boolean(stewardId) && stewardId === userId;

  if (isArtist && isSteward) return "artist_and_steward";
  if (isArtist) return "artist_only";
  if (isSteward) return "steward_only";
  return "viewer";
}

export const VALUATION_MARKET_DRIVEN_MESSAGE =
  "Value chronology is now market-driven. Future value events are recorded automatically through verified sales and transfers.";

export const VALUATION_ARTIST_PRIMARY_ONLY_MESSAGE =
  "Only the artist may record manual value events while the work remains in the price discovery phase.";

/** @deprecated Use resolveValuationDisabledReason instead */
export const VALUATION_STEWARD_ONLY_MESSAGE = VALUATION_MARKET_DRIVEN_MESSAGE;

export type ValuationDisabledReason = "market_driven" | "artist_primary_only";

export function resolveValuationDisabledReason(args: {
  userId?: string | null;
  artistId?: string | null;
  hasCompletedSale?: boolean;
}): ValuationDisabledReason {
  if (args.hasCompletedSale) {
    return "market_driven";
  }

  const userId = String(args.userId ?? "").trim();
  const artistId = String(args.artistId ?? "").trim();
  if (artistId && userId && userId !== artistId) {
    return "artist_primary_only";
  }

  return "market_driven";
}

export function resolveValuationDisabledMessage(args: {
  userId?: string | null;
  artistId?: string | null;
  hasCompletedSale?: boolean;
}): string {
  const reason = resolveValuationDisabledReason(args);
  return reason === "artist_primary_only"
    ? VALUATION_ARTIST_PRIMARY_ONLY_MESSAGE
    : VALUATION_MARKET_DRIVEN_MESSAGE;
}
