import type { MessageKey } from "@/lib/locale-messages";

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

const BRIEF_TYPE_MESSAGE_KEYS: Record<BriefType, MessageKey> = {
  open_call: "studio.opportunities.briefType.openCall",
  residency_award: "studio.opportunities.briefType.residencyAward",
  direct_commission: "studio.opportunities.briefType.directCommission",
  production_partner_search: "studio.opportunities.briefType.productionPartnerSearch",
};

export function briefTypeMessageKey(type: string): MessageKey {
  if (isBriefType(type)) return BRIEF_TYPE_MESSAGE_KEYS[type];
  return "studio.opportunities.briefType.default";
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

export function briefTypeLabelLocalized(
  type: string,
  t: (key: MessageKey) => string
): string {
  const label = t(briefTypeMessageKey(type));
  if (label !== "[missing message]") return label;
  return isBriefType(type) ? briefTypeLabel(type) : type;
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
