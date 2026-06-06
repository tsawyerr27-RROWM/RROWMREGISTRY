import {
  parseDeclaredPracticeSlugs,
  parsePrimaryPracticeSlug,
  parsePracticeVisibility,
} from "@/lib/practices";
import { isPracticeSlug } from "@/lib/practice-types";
import {
  type PublicPresence,
  toPublicPresenceJson,
} from "@/lib/public-presence";

/** Maximum declared practices per Phase 2B spec §2.4. */
export const MAX_DECLARED_PRACTICES = 5;

export type CreativePracticeSettings = {
  declaredSlugs: string[];
  primarySlug: string | null;
  practicesVisible: boolean;
};

export function parseCreativePracticeSettings(raw: unknown): CreativePracticeSettings {
  return {
    declaredSlugs: parseDeclaredPracticeSlugs(raw),
    primarySlug: parsePrimaryPracticeSlug(raw),
    practicesVisible: parsePracticeVisibility(raw),
  };
}

export function normalizeDeclaredPracticeSlugs(slugs: readonly string[]): string[] {
  const out: string[] = [];
  for (const entry of slugs) {
    const slug = entry.trim().toLowerCase();
    if (!isPracticeSlug(slug) || out.includes(slug)) continue;
    out.push(slug);
    if (out.length >= MAX_DECLARED_PRACTICES) break;
  }
  return out;
}

export function normalizeCreativePracticeSettings(input: {
  declaredSlugs: readonly string[];
  primarySlug: string | null;
  practicesVisible: boolean;
}): CreativePracticeSettings {
  const declaredSlugs = normalizeDeclaredPracticeSlugs(input.declaredSlugs);
  let primarySlug = input.primarySlug?.trim().toLowerCase() ?? null;

  if (primarySlug && !declaredSlugs.includes(primarySlug)) {
    primarySlug = null;
  }
  if (!primarySlug && declaredSlugs.length === 1) {
    primarySlug = declaredSlugs[0];
  }

  return {
    declaredSlugs,
    primarySlug,
    practicesVisible: input.practicesVisible,
  };
}

/** Merge standard presence flags with optional Creative practice jsonb keys. */
export function buildPublicPresenceJson(
  presence: PublicPresence,
  practice?: CreativePracticeSettings
): Record<string, unknown> {
  const base = toPublicPresenceJson(presence);
  if (!practice) return base;

  const normalized = normalizeCreativePracticeSettings(practice);
  const json: Record<string, unknown> = {
    ...base,
    practices: normalized.declaredSlugs,
    practices_visible: normalized.practicesVisible,
  };

  if (normalized.primarySlug) {
    json.primary_practice = normalized.primarySlug;
  }

  return json;
}
