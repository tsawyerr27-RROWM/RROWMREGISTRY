import type { MessageKey } from "@/lib/locale-messages";

type Translate = (key: MessageKey) => string;

const CANONICAL_PHRASE_KEYS = {
  canonicalRecordOnFile: "representation.canonicalRecordOnFile",
  recordDeepensOverTime: "representation.recordDeepensOverTime",
  institutionAttestationOnFile: "representation.institutionAttestationOnFile",
  artistAttestationOnFile: "representation.artistAttestationOnFile",
  artistAttestationMayDeepen: "representation.artistAttestationMayDeepen",
  priorContributionsRemainVisible: "representation.priorContributionsRemainVisible",
  historicalInstitutionLayer: "representation.historicalInstitutionLayer",
  inviteRecordExists: "representation.inviteRecordExists",
  notApprovalWorkflow: "representation.notApprovalWorkflow",
} as const satisfies Record<string, MessageKey>;

export type CanonicalPhraseKey = keyof typeof CANONICAL_PHRASE_KEYS;

export function translateCanonicalPhrase(
  phrase: CanonicalPhraseKey,
  t: Translate
): string {
  return t(CANONICAL_PHRASE_KEYS[phrase]);
}

const REPRESENTATION_PHRASE_KEYS = {
  representationOnFile: "representation.representationOnFile",
  priorFilingsRemainVisible: "representation.priorFilingsRemainVisible",
  amendmentPendingReview: "representation.amendmentPendingReview",
} as const satisfies Record<string, MessageKey>;

export type RepresentationPhraseKey = keyof typeof REPRESENTATION_PHRASE_KEYS;

export function translateRepresentationPhrase(
  phrase: RepresentationPhraseKey,
  t: Translate
): string {
  return t(REPRESENTATION_PHRASE_KEYS[phrase]);
}
