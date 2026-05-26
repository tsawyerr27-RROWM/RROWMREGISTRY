/**
 * Canonical artwork record + layered participant attestation language.
 * The work exists on file first; participants deepen documentary continuity — not approval workflows.
 */

/** Internal representation lifecycle (Phase B+); labels exposed for dashboards. */
export type RepresentationStatus =
  | "institution_only"
  | "invited_pending_artist"
  | "artist_confirmed"
  | "artist_disputed"
  | "representation_ended";

export const CANONICAL_RECORD_PHRASES = {
  canonicalRecordOnFile: "Canonical artwork record on file",
  recordDeepensOverTime: "The record deepens as participants contribute attestations",
  institutionAttestationOnFile: "Institution-linked continuity on file",
  artistAttestationMayDeepen: "Artist attestation may deepen",
  artistAttestationNotYetOnFile: "Artist attestation not yet on file",
  catalogueArtistNameOnFile: "Artist name on file (account not yet linked)",
  artistAuthorshipOnFile: "Artist authorship on file",
  artistAttestationOnFile: "Artist attestation on file",
  participantChronologyOnFile: "Participant-confirmed chronology on file",
  historicalInstitutionLayer:
    "Historical institutional participation remains on file",
  chronologyUnderReview: "Chronology under review on file",
  priorContributionsRemainVisible: "Prior contributions remain visible on the chronology",
  amendmentOpenOnFile: "Amendment open on file",
  inviteAuthenticateRecord:
    "Authenticate and deepen records associated with your practice",
  inviteRecordExists:
    "A canonical record associated with your practice is already on file",
  registerIssuesRecord:
    "Issues a registry identifier and opens the canonical record",
  notApprovalWorkflow:
    "Layered attestations only, not ownership adjudication or institution approval",
  artworkAuthInviteSubject: (title: string) =>
    `Authenticate artwork record on file · ${title.trim() || "Work"}`,
  artworkAuthInviteLanding:
    "Review, authenticate, and deepen a canonical artwork record on file",
} as const;

/** @deprecated Prefer CANONICAL_RECORD_PHRASES — kept for existing imports */
export const REPRESENTATION_PHRASES = {
  institutionLinkedRecord: CANONICAL_RECORD_PHRASES.institutionAttestationOnFile,
  institutionLinkedContinuity: CANONICAL_RECORD_PHRASES.institutionAttestationOnFile,
  artistConfirmationOnFile: CANONICAL_RECORD_PHRASES.artistAttestationOnFile,
  artistParticipationPending: CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen,
  representationOnFile: "Institutional relationship on file",
  representationAcknowledged:
    "Institutional relationship acknowledged on the chronology",
  participantConfirmedChronology: CANONICAL_RECORD_PHRASES.participantChronologyOnFile,
  historicalRepresentation: CANONICAL_RECORD_PHRASES.historicalInstitutionLayer,
  recordReviewInProgress: CANONICAL_RECORD_PHRASES.chronologyUnderReview,
  priorFilingsRemainVisible: CANONICAL_RECORD_PHRASES.priorContributionsRemainVisible,
  amendmentPendingReview: CANONICAL_RECORD_PHRASES.amendmentOpenOnFile,
} as const;

export function representationStatusPublicLabel(
  status: RepresentationStatus
): string {
  switch (status) {
    case "institution_only":
      return CANONICAL_RECORD_PHRASES.institutionAttestationOnFile;
    case "invited_pending_artist":
      return CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen;
    case "artist_confirmed":
      return CANONICAL_RECORD_PHRASES.artistAttestationOnFile;
    case "artist_disputed":
      return CANONICAL_RECORD_PHRASES.chronologyUnderReview;
    case "representation_ended":
      return CANONICAL_RECORD_PHRASES.historicalInstitutionLayer;
    default:
      return CANONICAL_RECORD_PHRASES.institutionAttestationOnFile;
  }
}

export function artistTierPublicLabel(
  tier: "public" | "confirmed" | "verified" | "unverified" | "disputed"
): string {
  switch (tier) {
    case "disputed":
      return CANONICAL_RECORD_PHRASES.chronologyUnderReview;
    case "public":
      return "Public participation on file";
    case "confirmed":
      return REPRESENTATION_PHRASES.representationOnFile;
    case "verified":
      return "Artist account on file";
    case "unverified":
    default:
      return CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen;
  }
}

export function inviteVisibilityStudioLabel(
  visibility: string | null | undefined
): string {
  const v = String(visibility ?? "")
    .toLowerCase()
    .trim();
  if (v === "public") return "Public participation on file";
  if (v === "confirmed") return REPRESENTATION_PHRASES.representationOnFile;
  return CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen;
}

export function ownershipParticipationLabel(
  tier: "recorded" | "institution_linked" | "certified"
): string {
  switch (tier) {
    case "certified":
      return "Certificate on file";
    case "institution_linked":
      return CANONICAL_RECORD_PHRASES.institutionAttestationOnFile;
    case "recorded":
    default:
      return "Continuity recorded on file";
  }
}

export function artworkCardParticipationLabel(args: {
  institutionLinked: boolean;
  artistConfirmed: boolean;
}): string {
  if (args.artistConfirmed && args.institutionLinked) {
    return "Layered attestations on file";
  }
  if (args.institutionLinked) {
    return CANONICAL_RECORD_PHRASES.institutionAttestationOnFile;
  }
  return CANONICAL_RECORD_PHRASES.canonicalRecordOnFile;
}

export const REGISTRY_FILTER_LABELS = {
  verifiedOnly: "Institution-linked with artist attestation on file",
  participationPending: CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen,
} as const;

/** Certificate / registry continuity — not pass/fail verification marketing */
export function recordVerificationPendingLabel(): string {
  return "Continuity filing may deepen on file";
}

export function artistGalleryInvitationSubject(galleryName: string): string {
  const safe = galleryName.trim() || "Institution";
  return `${safe} · Authenticate records on file`;
}

/** Studio section labels */
export const STUDIO_RECORD_NAV = {
  artistSection: "Records",
  gallerySection: "Record depth",
} as const;
