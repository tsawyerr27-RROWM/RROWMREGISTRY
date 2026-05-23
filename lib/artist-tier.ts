import { artistTierPublicLabel } from "@/lib/representation-language";

/**
 * Derived trust tier for an artist relative to a gallery invitation.
 * Never persisted — always compute from invite visibility + artist opt-in.
 */

/** Trust tier before dispute override */
export type ArtistTrustTier = "public" | "confirmed" | "verified" | "unverified";

/** Display tier (includes derived `disputed` from open registry disputes) */
export type ArtistTier = ArtistTrustTier | "disputed";

/** Minimal invite fields used for tier derivation */
export type ArtistTierInviteInput = {
  visibility_status?: string | null;
  status?: string | null;
};

/** Minimal artist fields used for tier derivation */
export type ArtistTierArtistInput = {
  id?: string | null;
  shown_on_institutional_public?: boolean | null;
} | null | undefined;

function normVis(raw: string | null | undefined): string {
  return String(raw ?? "")
    .toLowerCase()
    .trim();
}

/**
 * @param invite Gallery invite row (or null when none applies)
 * @param artist Artist row for the represented account, or null if not linked / unknown
 */
export function getArtistTier(
  invite: ArtistTierInviteInput | null | undefined,
  artist: ArtistTierArtistInput
): ArtistTrustTier {
  const vis = normVis(invite?.visibility_status);
  const optIn = Boolean(artist?.shown_on_institutional_public);
  const hasArtist =
    artist != null &&
    artist.id != null &&
    String(artist.id).trim().length > 0;

  if (vis === "public" && optIn) return "public";
  if (vis === "confirmed") return "confirmed";
  if (hasArtist) return "verified";
  return "unverified";
}

/** When an open dispute exists for the artist or gallery relationship, surface as disputed. */
export function withDisputeOverride(
  base: ArtistTrustTier,
  hasActiveDispute: boolean
): ArtistTier {
  return hasActiveDispute ? "disputed" : base;
}

/** Human-readable label for UI and API documentation */
export function artistTierLabel(tier: ArtistTier): string {
  return artistTierPublicLabel(tier);
}

/** Muted badge styling — no bright accent colors */
export function artistTierBadgeClass(tier: ArtistTier): string {
  switch (tier) {
    case "disputed":
      return "border border-neutral-500/30 bg-neutral-200/55 text-neutral-900";
    case "public":
      return "border border-neutral-500/35 bg-neutral-100/80 text-neutral-800";
    case "confirmed":
      return "border border-neutral-400/40 bg-neutral-50/90 text-neutral-800";
    case "verified":
      return "border border-neutral-300/80 bg-white/90 text-neutral-700";
    case "unverified":
    default:
      return "border border-neutral-200/90 bg-neutral-50/70 text-neutral-600";
  }
}
