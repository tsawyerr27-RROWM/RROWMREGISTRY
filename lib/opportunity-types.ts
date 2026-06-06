/** Frozen brief / opportunity kind enum — Phase 2C spec §2.2. */

export const BRIEF_TYPES = [
  "open_call",
  "residency_award",
  "direct_commission",
  "production_partner_search",
] as const;

export type BriefType = (typeof BRIEF_TYPES)[number];

export const PARTICIPATION_MODES = [
  "open",
  "roster_only",
  "invite_only",
  "direct",
] as const;

export type ParticipationMode = (typeof PARTICIPATION_MODES)[number];

export const BRIEF_VISIBILITY_STATES = ["draft", "published", "withdrawn"] as const;
export type BriefVisibilityState = (typeof BRIEF_VISIBILITY_STATES)[number];

export const PROGRAMME_VISIBILITY_STATES = ["draft", "published", "archived"] as const;
export type ProgrammeVisibilityState = (typeof PROGRAMME_VISIBILITY_STATES)[number];

export function isBriefType(value: string): value is BriefType {
  return (BRIEF_TYPES as readonly string[]).includes(value);
}

export function isParticipationMode(value: string): value is ParticipationMode {
  return (PARTICIPATION_MODES as readonly string[]).includes(value);
}

export function briefTypeLabel(type: BriefType): string {
  switch (type) {
    case "open_call":
      return "Open call";
    case "residency_award":
      return "Residency / award";
    case "direct_commission":
      return "Direct commission";
    case "production_partner_search":
      return "Production partner search";
    default:
      return type;
  }
}

export function participationModeLabel(mode: ParticipationMode): string {
  switch (mode) {
    case "open":
      return "Open";
    case "roster_only":
      return "Roster only";
    case "invite_only":
      return "Invite only";
    case "direct":
      return "Direct commission";
    default:
      return mode;
  }
}
