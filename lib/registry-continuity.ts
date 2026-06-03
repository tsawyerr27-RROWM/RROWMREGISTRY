import type {
  ArchivalNarrativeKind,
  ArchivalProvenanceBundle,
} from "@/lib/provenance-timeline";

/**
 * Canonical continuity milestone types — application projection today;
 * durable store may later mirror these in a registry_continuity_events table
 * without rewriting historical chronology rows.
 */
export type RegistryContinuityEventType =
  | "work_entered"
  | "institutional_relationship"
  | "participant_confirmation"
  | "chronology_continued"
  | "custody_in_chronology"
  | "certificate_documented"
  | "supporting_material"
  | "record_review_opened"
  | "record_review_closed"
  | "other_confirmation";

export type RegistryContinuityEvent = {
  id: string;
  eventType: RegistryContinuityEventType;
  occurredAtIso: string;
  headline: string;
  participantCaption: string | null;
  stateCaption: string;
  supportingMaterialAttached: boolean;
  certificateRelated: boolean;
};

function narrativeKindToContinuityType(
  kind: ArchivalNarrativeKind
): RegistryContinuityEventType {
  switch (kind) {
    case "registration":
      return "work_entered";
    case "institutional_confirmation":
      return "institutional_relationship";
    case "artist_confirmation":
    case "verification_other":
      return "participant_confirmation";
    case "provenance_continuation":
      return "chronology_continued";
    case "transfer":
      return "custody_in_chronology";
    case "certificate":
      return "certificate_documented";
    case "evidence":
      return "supporting_material";
    case "dispute_open":
      return "record_review_opened";
    case "dispute_resolved":
      return "record_review_closed";
    default:
      return "other_confirmation";
  }
}

/** Maps the archival chronology projection into continuity-typed milestones (immutable, replayable). */
export function projectContinuityEvents(
  bundle: ArchivalProvenanceBundle
): RegistryContinuityEvent[] {
  return bundle.events.map((ev) => ({
    id: ev.key,
    eventType: narrativeKindToContinuityType(ev.narrativeKind),
    occurredAtIso: ev.dateIso,
    headline: ev.displayTitle,
    participantCaption: ev.participantLabel,
    stateCaption: ev.verificationLabel,
    supportingMaterialAttached: ev.hasSupportingEvidence,
    certificateRelated: ev.certificateRelated,
  }));
}

/**
 * Quiet copy for verification — not a second timeline (max two lines).
 */
export function verificationContinuitySummaryLines(
  bundle: ArchivalProvenanceBundle | null | undefined
): string[] {
  if (!bundle?.events?.length) return [];

  const hasConfirmations = bundle.events.some(
    (e) =>
      e.narrativeKind === "institutional_confirmation" ||
      e.narrativeKind === "artist_confirmation" ||
      e.narrativeKind === "verification_other"
  );

  const nonRegistration = bundle.events.filter(
    (e) => e.narrativeKind !== "registration"
  );
  const visiblyGrowing =
    bundle.events.some(
      (e) => e.narrativeKind === "provenance_continuation"
    ) ||
    bundle.continuityIndicators.length > 0 ||
    nonRegistration.length >= 2;

  const hasParticipantConfirmedContinuity =
    bundle.events.some((e) => e.narrativeKind === "provenance_continuation") ||
    bundle.continuityIndicators.some((i) =>
      /participant|custody milestone|continuation/i.test(i)
    );

  const lines: string[] = [];
  if (hasConfirmations) {
    lines.push("Additional participant confirmations are on file.");
  }
  if (hasParticipantConfirmedContinuity) {
    lines.push("Participant-confirmed continuity is on file.");
  } else if (visiblyGrowing) {
    lines.push(
      "The current record reflects ongoing provenance continuity."
    );
  }
  return lines.slice(0, 2);
}

/**
 * Sparse framing for studio workspaces — not alerts; derived from continuity signals only.
 */
export function studioContinuityNotesFromBundle(
  bundle: ArchivalProvenanceBundle | null | undefined
): string[] {
  if (!bundle?.events?.length) return [];
  const notes: string[] = [];
  if (bundle.continuityIndicators.length > 0) {
    notes.push(
      "The chronology gains depth as durable milestones are filed. This is historical continuity, not a running feed."
    );
  }
  return notes.slice(0, 1);
}
