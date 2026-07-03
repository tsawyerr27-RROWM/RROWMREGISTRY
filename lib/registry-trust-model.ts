import type { MessageKey } from "@/lib/locale-messages";
import {
  isInstitutionallyVerified,
  parseArtworkTrustTier,
  type ArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import type { RecordCompletenessLevel } from "@/lib/record-completeness";

/** Public trust presentation levels for registry surfaces. */
export type RegistryTrustLevel =
  | "registered"
  | "established"
  | "layered"
  | "attested"
  | "revoked";

export type RegistryTrustEvidencePillarId =
  | "creatorAttested"
  | "organisationVerified"
  | "certificateIssued"
  | "continuityEstablished";

export type RegistryTrustEvidencePillar = {
  id: RegistryTrustEvidencePillarId;
  active: boolean;
};

export type RegistryTrustPresentation = {
  level: RegistryTrustLevel;
  explanationKey: `registry.trust.explanation.${RegistryTrustLevel}`;
  pillars: RegistryTrustEvidencePillar[];
  recordVerified: boolean;
  hasCertificate: boolean;
  certificateRevoked: boolean;
  completenessLevel: RecordCompletenessLevel | null;
  verifierName: string | null;
};

const PILLAR_ORDER: RegistryTrustEvidencePillarId[] = [
  "creatorAttested",
  "organisationVerified",
  "certificateIssued",
  "continuityEstablished",
];

export function isRecordVerified(
  verificationStatus: string | null | undefined
): boolean {
  return isInstitutionallyVerified(verificationStatus);
}

export function trustTierFromVerificationStatus(
  verificationStatus: string | null | undefined
): ArtworkTrustTier {
  return parseArtworkTrustTier(verificationStatus);
}

function buildTrustPillars(input: {
  artistConfirmationOnFile: boolean;
  organisationVerified: boolean;
  hasCertificate: boolean;
  certRevoked: boolean;
  continuityEstablished: boolean;
}): RegistryTrustEvidencePillar[] {
  return PILLAR_ORDER.map((id) => {
    switch (id) {
      case "creatorAttested":
        return { id, active: input.artistConfirmationOnFile };
      case "organisationVerified":
        return { id, active: input.organisationVerified };
      case "certificateIssued":
        return { id, active: input.hasCertificate && !input.certRevoked };
      case "continuityEstablished":
        return { id, active: input.continuityEstablished };
      default:
        return { id, active: false };
    }
  });
}

export function computeRegistryTrustPresentation(input: {
  verificationStatus: string | null | undefined;
  hasCertificate: boolean;
  certRevoked: boolean;
  completenessLevel?: RecordCompletenessLevel | null;
  verifierName?: string | null;
  artistConfirmationOnFile?: boolean;
  organisationVerified?: boolean;
  continuityEstablished?: boolean;
}): RegistryTrustPresentation {
  const recordVerified = isInstitutionallyVerified(input.verificationStatus);
  const trustTier = parseArtworkTrustTier(input.verificationStatus);
  const completenessLevel = input.completenessLevel ?? null;
  const verifierName = input.verifierName ?? null;
  const artistConfirmationOnFile = input.artistConfirmationOnFile ?? false;
  const organisationVerified =
    input.organisationVerified ?? Boolean(verifierName?.trim());
  const continuityEstablished =
    input.continuityEstablished ??
    (completenessLevel === "high");

  const pillarInput = {
    artistConfirmationOnFile,
    organisationVerified,
    hasCertificate: input.hasCertificate,
    certRevoked: input.certRevoked,
    continuityEstablished,
  };

  if (input.certRevoked) {
    return {
      level: "revoked",
      explanationKey: "registry.trust.explanation.revoked",
      pillars: buildTrustPillars(pillarInput),
      recordVerified,
      hasCertificate: input.hasCertificate,
      certificateRevoked: true,
      completenessLevel,
      verifierName,
    };
  }

  if (recordVerified && input.hasCertificate && continuityEstablished) {
    return {
      level: "layered",
      explanationKey: "registry.trust.explanation.layered",
      pillars: buildTrustPillars(pillarInput),
      recordVerified: true,
      hasCertificate: true,
      certificateRevoked: false,
      completenessLevel,
      verifierName,
    };
  }

  if (recordVerified && input.hasCertificate) {
    return {
      level: "attested",
      explanationKey: "registry.trust.explanation.attested",
      pillars: buildTrustPillars(pillarInput),
      recordVerified: true,
      hasCertificate: true,
      certificateRevoked: false,
      completenessLevel,
      verifierName,
    };
  }

  if (trustTier === "self_attested") {
    return {
      level: "established",
      explanationKey: "registry.trust.explanation.established",
      pillars: buildTrustPillars({
        ...pillarInput,
        artistConfirmationOnFile: true,
      }),
      recordVerified: false,
      hasCertificate: input.hasCertificate,
      certificateRevoked: false,
      completenessLevel,
      verifierName,
    };
  }

  if (recordVerified) {
    return {
      level: "established",
      explanationKey: "registry.trust.explanation.established",
      pillars: buildTrustPillars(pillarInput),
      recordVerified: true,
      hasCertificate: false,
      certificateRevoked: false,
      completenessLevel,
      verifierName,
    };
  }

  return {
    level: "registered",
    explanationKey: "registry.trust.explanation.registered",
    pillars: buildTrustPillars(pillarInput),
    recordVerified: false,
    hasCertificate: input.hasCertificate,
    certificateRevoked: false,
    completenessLevel,
    verifierName,
  };
}

/** Maps trust level to locale key suffix under registry.trust.level.* */
export function registryTrustLevelMessageKey(
  level: RegistryTrustLevel
): `registry.trust.level.${RegistryTrustLevel}` {
  return `registry.trust.level.${level}`;
}

/** Maps trust level to seal label locale key under registry.seal.* */
export function registrySealLabelMessageKey(
  level: RegistryTrustLevel
): `registry.seal.${RegistryTrustLevel}` {
  return `registry.seal.${level}`;
}

export function registryTrustPillarMessageKey(
  id: RegistryTrustEvidencePillarId
): Extract<MessageKey, `registry.trust.pillar.${RegistryTrustEvidencePillarId}`> {
  return `registry.trust.pillar.${id}`;
}
