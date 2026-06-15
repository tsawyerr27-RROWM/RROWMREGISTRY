import type { MessageKey } from "@/lib/locale-messages";
import type { RecordCompletenessLevel } from "@/lib/record-completeness";
import type { ArchivalProvenanceBundle } from "@/lib/provenance-timeline";
import type { ProvenanceInsight } from "@/lib/provenance-insights";

export type RegistryIntelligenceDimensionId =
  | "recordCompleteness"
  | "continuity"
  | "evidenceDepth"
  | "riskSignals";

export type RecordCompletenessIntelligenceLevel =
  | "emerging"
  | "developing"
  | "deep"
  | "comprehensive";

export type ContinuityIntelligenceLevel =
  | "fragmented"
  | "partial"
  | "established"
  | "continuous";

export type EvidenceDepthIntelligenceLevel =
  | "light"
  | "moderate"
  | "strong"
  | "extensive";

export type RiskSignalsIntelligenceLevel =
  | "noneDetected"
  | "reviewRecommended"
  | "conflictsPresent";

export type RegistryIntelligenceLevel =
  | RecordCompletenessIntelligenceLevel
  | ContinuityIntelligenceLevel
  | EvidenceDepthIntelligenceLevel
  | RiskSignalsIntelligenceLevel;

export type RegistryIntelligenceDimensionAssessment = {
  id: RegistryIntelligenceDimensionId;
  level: RegistryIntelligenceLevel;
  levelKey: MessageKey;
  explanationKey: MessageKey;
};

export type RegistryIntelligenceAssessment = {
  recordCompleteness: RegistryIntelligenceDimensionAssessment;
  continuity: RegistryIntelligenceDimensionAssessment;
  evidenceDepth: RegistryIntelligenceDimensionAssessment;
  riskSignals: RegistryIntelligenceDimensionAssessment;
  dimensions: RegistryIntelligenceDimensionAssessment[];
};

export type RegistryIntelligenceInput = {
  provenanceBundle: ArchivalProvenanceBundle;
  recordVerified: boolean;
  hasCertificate: boolean;
  certRevoked: boolean;
  provenanceInsights?: ProvenanceInsight[];
};

function substantiveEventCount(bundle: ArchivalProvenanceBundle): number {
  return bundle.events.filter((event) => event.narrativeKind !== "registration")
    .length;
}

function chainIntact(bundle: ArchivalProvenanceBundle): boolean {
  return bundle.continuityIndicators.some((indicator) =>
    /without recorded breaks|chain without/i.test(indicator)
  );
}

function openDisputeCount(bundle: ArchivalProvenanceBundle): number {
  const opens = bundle.events.filter(
    (event) => event.narrativeKind === "dispute_open"
  ).length;
  const resolved = bundle.events.filter(
    (event) => event.narrativeKind === "dispute_resolved"
  ).length;
  return Math.max(0, opens - resolved);
}

function assessRecordCompleteness(
  bundle: ArchivalProvenanceBundle,
  recordVerified: boolean
): RecordCompletenessIntelligenceLevel {
  const filingLevel: RecordCompletenessLevel = bundle.recordCompleteness;
  const substantiveCount = substantiveEventCount(bundle);

  if (filingLevel === "high") {
    return substantiveCount >= 6 ? "comprehensive" : "deep";
  }
  if (filingLevel === "moderate") {
    return recordVerified ? "developing" : "emerging";
  }
  return recordVerified ? "developing" : "emerging";
}

function assessContinuity(
  bundle: ArchivalProvenanceBundle
): ContinuityIntelligenceLevel {
  const indicatorCount = bundle.continuityIndicators.length;
  const transfers = bundle.events.filter(
    (event) => event.narrativeKind === "transfer"
  ).length;
  const hasContinuation = bundle.events.some(
    (event) => event.narrativeKind === "provenance_continuation"
  );

  if (indicatorCount === 0 && transfers === 0) {
    return "fragmented";
  }
  if (
    indicatorCount >= 3 &&
    chainIntact(bundle) &&
    (hasContinuation || transfers >= 2)
  ) {
    return "continuous";
  }
  if (indicatorCount >= 2 || chainIntact(bundle)) {
    return "established";
  }
  return "partial";
}

function assessEvidenceDepth(
  bundle: ArchivalProvenanceBundle,
  hasCertificate: boolean,
  certRevoked: boolean
): EvidenceDepthIntelligenceLevel {
  const supportingEvents = bundle.events.filter(
    (event) => event.hasSupportingEvidence
  ).length;
  const confirmations = bundle.events.filter((event) =>
    ["institutional_confirmation", "artist_confirmation", "verification_other"].includes(
      event.narrativeKind
    )
  ).length;
  const certificateEvents = bundle.events.filter(
    (event) => event.narrativeKind === "certificate"
  ).length;
  const liveCertificate = hasCertificate && !certRevoked;

  const filingSignals =
    supportingEvents +
    confirmations +
    certificateEvents +
    (liveCertificate ? 2 : 0);

  if (filingSignals >= 7) return "extensive";
  if (filingSignals >= 4) return "strong";
  if (filingSignals >= 2) return "moderate";
  return "light";
}

function assessRiskSignals(input: RegistryIntelligenceInput): RiskSignalsIntelligenceLevel {
  if (input.certRevoked) {
    return "conflictsPresent";
  }

  if (openDisputeCount(input.provenanceBundle) > 0) {
    return "conflictsPresent";
  }

  const insights = input.provenanceInsights ?? [];
  const hasGap = insights.some((insight) => insight.type === "gap");
  const hasWarning = insights.some((insight) => insight.type === "warning");
  const hadFormalReview = input.provenanceBundle.events.some((event) =>
    ["dispute_open", "dispute_resolved"].includes(event.narrativeKind)
  );

  if (hasGap || hasWarning || hadFormalReview) {
    return "reviewRecommended";
  }

  return "noneDetected";
}

function buildDimensionAssessment<
  TLevel extends RegistryIntelligenceLevel,
>(
  id: RegistryIntelligenceDimensionId,
  level: TLevel,
  levelKey: MessageKey,
  explanationKey: MessageKey
): RegistryIntelligenceDimensionAssessment {
  return { id, level, levelKey, explanationKey };
}

export function registryIntelligenceDimensionLabelKey(
  id: RegistryIntelligenceDimensionId
): Extract<MessageKey, `registry.intelligence.dimension.${RegistryIntelligenceDimensionId}`> {
  return `registry.intelligence.dimension.${id}`;
}

export function registryIntelligenceCompletenessLevelKey(
  level: RecordCompletenessIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.completeness.${RecordCompletenessIntelligenceLevel}`
> {
  return `registry.intelligence.completeness.${level}`;
}

export function registryIntelligenceCompletenessExplanationKey(
  level: RecordCompletenessIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.completeness.explanation.${RecordCompletenessIntelligenceLevel}`
> {
  return `registry.intelligence.completeness.explanation.${level}`;
}

export function registryIntelligenceContinuityLevelKey(
  level: ContinuityIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.continuity.${ContinuityIntelligenceLevel}`
> {
  return `registry.intelligence.continuity.${level}`;
}

export function registryIntelligenceContinuityExplanationKey(
  level: ContinuityIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.continuity.explanation.${ContinuityIntelligenceLevel}`
> {
  return `registry.intelligence.continuity.explanation.${level}`;
}

export function registryIntelligenceEvidenceLevelKey(
  level: EvidenceDepthIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.evidence.${EvidenceDepthIntelligenceLevel}`
> {
  return `registry.intelligence.evidence.${level}`;
}

export function registryIntelligenceEvidenceExplanationKey(
  level: EvidenceDepthIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.evidence.explanation.${EvidenceDepthIntelligenceLevel}`
> {
  return `registry.intelligence.evidence.explanation.${level}`;
}

export function registryIntelligenceRiskLevelKey(
  level: RiskSignalsIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.risk.${RiskSignalsIntelligenceLevel}`
> {
  return `registry.intelligence.risk.${level}`;
}

export function registryIntelligenceRiskExplanationKey(
  level: RiskSignalsIntelligenceLevel
): Extract<
  MessageKey,
  `registry.intelligence.risk.explanation.${RiskSignalsIntelligenceLevel}`
> {
  return `registry.intelligence.risk.explanation.${level}`;
}

export function computeRegistryIntelligence(
  input: RegistryIntelligenceInput
): RegistryIntelligenceAssessment {
  const completenessLevel = assessRecordCompleteness(
    input.provenanceBundle,
    input.recordVerified
  );
  const continuityLevel = assessContinuity(input.provenanceBundle);
  const evidenceLevel = assessEvidenceDepth(
    input.provenanceBundle,
    input.hasCertificate,
    input.certRevoked
  );
  const riskLevel = assessRiskSignals(input);

  const recordCompleteness = buildDimensionAssessment(
    "recordCompleteness",
    completenessLevel,
    registryIntelligenceCompletenessLevelKey(completenessLevel),
    registryIntelligenceCompletenessExplanationKey(completenessLevel)
  );
  const continuity = buildDimensionAssessment(
    "continuity",
    continuityLevel,
    registryIntelligenceContinuityLevelKey(continuityLevel),
    registryIntelligenceContinuityExplanationKey(continuityLevel)
  );
  const evidenceDepth = buildDimensionAssessment(
    "evidenceDepth",
    evidenceLevel,
    registryIntelligenceEvidenceLevelKey(evidenceLevel),
    registryIntelligenceEvidenceExplanationKey(evidenceLevel)
  );
  const riskSignals = buildDimensionAssessment(
    "riskSignals",
    riskLevel,
    registryIntelligenceRiskLevelKey(riskLevel),
    registryIntelligenceRiskExplanationKey(riskLevel)
  );

  return {
    recordCompleteness,
    continuity,
    evidenceDepth,
    riskSignals,
    dimensions: [recordCompleteness, continuity, evidenceDepth, riskSignals],
  };
}
