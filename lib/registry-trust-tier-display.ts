import type { ArtworkTrustTier } from "@/lib/artwork-trust-tier";
import type { MessageKey } from "@/lib/locale-messages";

/** Hero / intelligence-surface copy for canonical trust tiers (presentation only). */
export function registryTrustTierHeadlineKey(
  tier: ArtworkTrustTier
): `registry.trust.tier.${ArtworkTrustTier}.headline` {
  return `registry.trust.tier.${tier}.headline`;
}

export function registryTrustTierSublineKey(
  tier: ArtworkTrustTier
): `registry.trust.tier.${ArtworkTrustTier}.subline` {
  return `registry.trust.tier.${tier}.subline`;
}

export function registryCertificateTierLabelKey(
  hasCertificate: boolean,
  revoked: boolean
): MessageKey {
  if (revoked) return "registry.record.trust.revokedHeadline";
  if (!hasCertificate) return "registry.record.badge.noCertificate";
  return "registry.record.field.certificateTier";
}
