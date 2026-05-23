import type { OwnershipSystemStatus } from "@/lib/ownership-ledger";
import { ownershipParticipationLabel } from "@/lib/representation-language";

/** Display-only ownership trust tier for public surfaces (not persisted). */
export type OwnershipTrustTier = "recorded" | "institution_linked" | "certified";

/**
 * Derive a coarse ownership trust tier for UI.
 * - Certified: live certificate on the work (not revoked).
 * - Institution linked: artwork verified and/or ownership row verified and/or gallery verification signal.
 * - Recorded: default ledger / registered state.
 */
export function getOwnershipTrustTier(args: {
  latestOwnershipStatus: OwnershipSystemStatus;
  artworkVerified: boolean;
  hasGalleryVerificationSignal: boolean;
  hasLiveCertificate: boolean;
  certificateRevoked: boolean;
}): OwnershipTrustTier {
  if (args.hasLiveCertificate && !args.certificateRevoked) return "certified";
  if (
    args.artworkVerified ||
    args.latestOwnershipStatus === "verified" ||
    args.hasGalleryVerificationSignal
  ) {
    return "institution_linked";
  }
  return "recorded";
}

export function ownershipTrustTierLabel(tier: OwnershipTrustTier): string {
  return ownershipParticipationLabel(tier);
}
