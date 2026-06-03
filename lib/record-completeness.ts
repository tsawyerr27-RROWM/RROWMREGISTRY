export type RecordCompletenessLevel = "high" | "moderate" | "limited";

export type RecordCompletenessContext = {
  artworkVerified: boolean;
  hasLiveCertificate: boolean;
  hasOwnershipChainGap: boolean;
  hasSupportingEvidence: boolean;
  ownershipEventCount: number;
  allOwnershipVerified: boolean;
  anyOwnershipVerified: boolean;
  hasInstitutionalVerification: boolean;
  hasArtistConfirmation: boolean;
};

export function computeRecordCompleteness(
  ctx: RecordCompletenessContext
): RecordCompletenessLevel {
  if (!ctx.artworkVerified) return "limited";
  if (ctx.hasOwnershipChainGap) return "limited";

  const hasMeaningfulChain = ctx.ownershipEventCount > 0;
  if (!hasMeaningfulChain) {
    if (ctx.hasLiveCertificate && ctx.hasArtistConfirmation) return "moderate";
    if (ctx.hasLiveCertificate || ctx.hasInstitutionalVerification) return "moderate";
    return "limited";
  }

  const institutionalStewardship =
    ctx.hasInstitutionalVerification || ctx.hasArtistConfirmation;

  const strongDocumentation =
    ctx.hasLiveCertificate ||
    ctx.hasSupportingEvidence ||
    ctx.allOwnershipVerified;

  if (
    institutionalStewardship &&
    ctx.hasLiveCertificate &&
    (ctx.allOwnershipVerified || ctx.hasSupportingEvidence) &&
    !ctx.hasOwnershipChainGap
  ) {
    return "high";
  }

  if (
    (institutionalStewardship && ctx.anyOwnershipVerified) ||
    (ctx.hasLiveCertificate && ctx.anyOwnershipVerified) ||
    (ctx.allOwnershipVerified && institutionalStewardship)
  ) {
    return "moderate";
  }

  if (ctx.anyOwnershipVerified || strongDocumentation) return "moderate";
  return "limited";
}

export function recordCompletenessLabel(level: RecordCompletenessLevel): string {
  switch (level) {
    case "high":
      return "Layered file";
    case "moderate":
      return "Growing file";
    default:
      return "Opening file";
  }
}

export function recordCompletenessDescription(level: RecordCompletenessLevel): string {
  switch (level) {
    case "high":
      return "Several kinds of filing sit together (studio records, custody sequence, and documents) so the chronology reads with more historical depth.";
    case "moderate":
      return "Core facts are on file; further participant confirmations or custody milestones may still arrive.";
    default:
      return "Only part of the story is visible here until more is filed on the chronology.";
  }
}
