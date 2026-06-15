import type { ArchivalNarrativeKind, ArchivalTimelineEvent } from "@/lib/provenance-timeline";

/** Narrative milestone tiers for public chronology hierarchy. */
export type ProvenanceMilestoneTier =
  | "creation"
  | "verification"
  | "transfer"
  | "exhibition"
  | "amendment";

const TIER_ORDER: ProvenanceMilestoneTier[] = [
  "creation",
  "verification",
  "transfer",
  "exhibition",
  "amendment",
];

export function milestoneTierForKind(
  kind: ArchivalNarrativeKind
): ProvenanceMilestoneTier {
  switch (kind) {
    case "registration":
      return "creation";
    case "institutional_confirmation":
    case "artist_confirmation":
    case "certificate":
    case "verification_other":
      return "verification";
    case "transfer":
    case "provenance_continuation":
      return "transfer";
    case "evidence":
      return "exhibition";
    case "dispute_open":
    case "dispute_resolved":
      return "amendment";
    default:
      return "verification";
  }
}

/** Major events render as full evidence panels; minor events stay compact. */
export function isMajorProvenanceEvent(kind: ArchivalNarrativeKind): boolean {
  switch (kind) {
    case "registration":
    case "institutional_confirmation":
    case "artist_confirmation":
    case "certificate":
    case "transfer":
    case "provenance_continuation":
    case "dispute_open":
    case "dispute_resolved":
      return true;
    default:
      return false;
  }
}

export function milestoneTierMessageKey(
  tier: ProvenanceMilestoneTier
): `provenance.milestone.${ProvenanceMilestoneTier}` {
  return `provenance.milestone.${tier}`;
}

export type ProvenanceMilestoneSummary = {
  tier: ProvenanceMilestoneTier;
  count: number;
};

export function summarizeProvenanceMilestones(
  events: ArchivalTimelineEvent[]
): ProvenanceMilestoneSummary[] {
  const counts = new Map<ProvenanceMilestoneTier, number>();
  for (const ev of events) {
    const tier = milestoneTierForKind(ev.narrativeKind);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return TIER_ORDER.filter((tier) => (counts.get(tier) ?? 0) > 0).map((tier) => ({
    tier,
    count: counts.get(tier) ?? 0,
  }));
}

export function milestoneTierAccentClass(tier: ProvenanceMilestoneTier): string {
  switch (tier) {
    case "creation":
      return "border-l-neutral-800/80";
    case "verification":
      return "border-l-emerald-900/50";
    case "transfer":
      return "border-l-stone-600/45";
    case "exhibition":
      return "border-l-neutral-500/40";
    case "amendment":
      return "border-l-amber-900/35";
    default:
      return "border-l-neutral-400/40";
  }
}
