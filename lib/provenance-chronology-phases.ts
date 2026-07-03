import type { ArchivalNarrativeKind, ArchivalTimelineEvent } from "@/lib/provenance-timeline";
import type { MessageKey } from "@/lib/locale-messages";

/** Presentation-only chronology phases for registry intelligence surfaces. */
export const PROVENANCE_CHRONOLOGY_PHASES = [
  "genesis",
  "market",
  "ownership",
  "governance",
] as const;

export type ProvenanceChronologyPhase =
  (typeof PROVENANCE_CHRONOLOGY_PHASES)[number];

export function provenanceEventPhase(
  kind: ArchivalNarrativeKind
): ProvenanceChronologyPhase {
  switch (kind) {
    case "registration":
    case "artist_confirmation":
      return "genesis";
    case "evidence":
      return "market";
    case "transfer":
    case "provenance_continuation":
      return "ownership";
    default:
      return "governance";
  }
}

export function provenancePhaseMessageKey(
  phase: ProvenanceChronologyPhase
): `provenance.phase.${ProvenanceChronologyPhase}` {
  return `provenance.phase.${phase}`;
}

export type ProvenancePhaseGroup = {
  phase: ProvenanceChronologyPhase;
  events: ArchivalTimelineEvent[];
};

export function groupProvenanceEventsByPhase(
  events: ArchivalTimelineEvent[]
): ProvenancePhaseGroup[] {
  const buckets = new Map<ProvenanceChronologyPhase, ArchivalTimelineEvent[]>();
  for (const phase of PROVENANCE_CHRONOLOGY_PHASES) {
    buckets.set(phase, []);
  }
  for (const event of events) {
    const phase = provenanceEventPhase(event.narrativeKind);
    buckets.get(phase)!.push(event);
  }
  return PROVENANCE_CHRONOLOGY_PHASES.map((phase) => ({
    phase,
    events: buckets.get(phase) ?? [],
  })).filter((group) => group.events.length > 0);
}
