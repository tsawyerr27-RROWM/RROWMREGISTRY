import type { MessageKey } from "@/lib/locale-messages";
import type { RegistrySemanticEvent } from "@/lib/registry-semantic-signals";

/** Canonical artwork trust tiers (artworks.verification_status). */
export const ARTWORK_TRUST_TIERS = [
  "filed",
  "self_attested",
  "verified",
] as const;

export type ArtworkTrustTier = (typeof ARTWORK_TRUST_TIERS)[number];

/** Certificate document class (certificates.certificate_class). */
export const CERTIFICATE_CLASSES = [
  "filing_attestation",
  "verified_registry",
] as const;

export type CertificateClass = (typeof CERTIFICATE_CLASSES)[number];

const TIER_RANK: Record<ArtworkTrustTier, number> = {
  filed: 1,
  self_attested: 2,
  verified: 3,
};

/** Map legacy DB values to canonical tiers during transition. */
export function parseArtworkTrustTier(
  raw: string | null | undefined
): ArtworkTrustTier {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s === "verified") return "verified";
  if (s === "self_attested" || s === "self-attested") return "self_attested";
  if (s === "filed") return "filed";
  // Legacy binary model
  if (s === "unverified" || s === "pending" || s === "") return "filed";
  return "filed";
}

export function isArtworkTrustTier(value: string): value is ArtworkTrustTier {
  return (ARTWORK_TRUST_TIERS as readonly string[]).includes(value);
}

export function trustTierRank(tier: ArtworkTrustTier): number {
  return TIER_RANK[tier];
}

export function isAtLeastTrustTier(
  current: string | null | undefined,
  minimum: ArtworkTrustTier
): boolean {
  return trustTierRank(parseArtworkTrustTier(current)) >= trustTierRank(minimum);
}

export function isFiled(status: string | null | undefined): boolean {
  return parseArtworkTrustTier(status) === "filed";
}

export function isSelfAttested(status: string | null | undefined): boolean {
  return parseArtworkTrustTier(status) === "self_attested";
}

/** Institutionally verified — full registry trust tier. */
export function isInstitutionallyVerified(
  status: string | null | undefined
): boolean {
  return parseArtworkTrustTier(status) === "verified";
}

/** Self-attested and institutionally verified works may transfer / claim ownership. */
export function canParticipateInOwnershipFlow(
  status: string | null | undefined
): boolean {
  const tier = parseArtworkTrustTier(status);
  return tier === "self_attested" || tier === "verified";
}

/** @deprecated Use isInstitutionallyVerified — kept for gradual migration. */
export function isRecordVerified(
  verificationStatus: string | null | undefined
): boolean {
  return isInstitutionallyVerified(verificationStatus);
}

export function canSelfAttestTrustTier(
  status: string | null | undefined
): boolean {
  return parseArtworkTrustTier(status) === "filed";
}

export function canInstitutionallyVerify(
  status: string | null | undefined
): boolean {
  const tier = parseArtworkTrustTier(status);
  return tier === "filed" || tier === "self_attested";
}

export function parseCertificateClass(
  raw: string | null | undefined
): CertificateClass | null {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s === "filing_attestation") return "filing_attestation";
  if (s === "verified_registry") return "verified_registry";
  return null;
}

export function certificateClassForTrustTier(
  tier: ArtworkTrustTier
): CertificateClass | null {
  if (tier === "self_attested") return "filing_attestation";
  if (tier === "verified") return "verified_registry";
  return null;
}

export function artworkTrustOgLabelKey(
  tier: ArtworkTrustTier
): Extract<
  MessageKey,
  | "certificate.og.trust.self_attested"
  | "certificate.og.trust.institutionally_verified"
> | null {
  if (tier === "self_attested") return "certificate.og.trust.self_attested";
  if (tier === "verified") return "certificate.og.trust.institutionally_verified";
  return null;
}

export function trustTierLabelKey(
  tier: ArtworkTrustTier
): `trust.tier.${ArtworkTrustTier}.label` {
  return `trust.tier.${tier}.label`;
}

export function trustTierTooltipKey(
  tier: ArtworkTrustTier
): `trust.tier.${ArtworkTrustTier}.tooltip` {
  return `trust.tier.${tier}.tooltip`;
}

export function certificateClassTitleKey(
  certClass: CertificateClass
): Extract<MessageKey, `certificate.class.${CertificateClass}.title`> {
  return `certificate.class.${certClass}.title`;
}

/** Semantic stamp event for trust tier badges. */
export function trustTierSemanticEvent(
  tier: ArtworkTrustTier
): RegistrySemanticEvent {
  switch (tier) {
    case "filed":
      return "registration";
    case "self_attested":
      return "certification";
    case "verified":
      return "certification";
    default:
      return "registration";
  }
}

export function trustTierBadgeClass(tier: ArtworkTrustTier): string {
  switch (tier) {
    case "filed":
      return "artwork-trust-badge artwork-trust-badge--filed";
    case "self_attested":
      return "artwork-trust-badge artwork-trust-badge--self-attested";
    case "verified":
      return "artwork-trust-badge artwork-trust-badge--verified";
    default:
      return "artwork-trust-badge artwork-trust-badge--filed";
  }
}

export type RecordExplorerTrustFilter = "all" | ArtworkTrustTier;

export const RECORD_EXPLORER_TRUST_FILTERS: RecordExplorerTrustFilter[] = [
  "all",
  "filed",
  "self_attested",
  "verified",
];

export function parseRecordExplorerTrustParam(
  sp: Record<string, string | string[] | undefined>
): { trust: RecordExplorerTrustFilter; trustScopeExplicit: boolean } {
  const trustRaw =
    typeof sp.trust === "string" ? sp.trust.trim().toLowerCase() : "";

  if (trustRaw && isArtworkTrustTier(trustRaw)) {
    return { trust: trustRaw, trustScopeExplicit: true };
  }

  // Legacy `verified` query param
  if (Object.prototype.hasOwnProperty.call(sp, "verified")) {
    const verifiedRaw =
      typeof sp.verified === "string" ? sp.verified.trim().toLowerCase() : "";
    if (verifiedRaw === "0" || verifiedRaw === "all" || verifiedRaw === "false") {
      return { trust: "all", trustScopeExplicit: true };
    }
    return { trust: "verified", trustScopeExplicit: true };
  }

  // Default: all tiers browsable (filed works are public registry facts)
  return { trust: "all", trustScopeExplicit: false };
}

export function recordExplorerTrustQueryValue(
  trust: RecordExplorerTrustFilter
): string | null {
  if (trust === "all") return "all";
  return trust;
}
