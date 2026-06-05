import {
  isPracticeSlug,
  practiceLabel,
  PRACTICE_TYPES,
  type PracticeType,
} from "@/lib/practice-types";

export type PracticeChipSource = "registry" | "declared";

export type CreativePracticeChip = {
  slug: string;
  label: string;
  source: PracticeChipSource;
};

/** Self-authored practice slugs stored on `public_presence.practices` (jsonb, no migration required). */
export function parseDeclaredPracticeSlugs(publicPresenceRaw: unknown): string[] {
  if (publicPresenceRaw == null || typeof publicPresenceRaw !== "object") {
    return [];
  }
  const practices = (publicPresenceRaw as Record<string, unknown>).practices;
  if (!Array.isArray(practices)) return [];

  const slugs: string[] = [];
  for (const entry of practices) {
    if (typeof entry !== "string") continue;
    const slug = entry.trim().toLowerCase();
    if (slug && isPracticeSlug(slug) && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }
  return slugs;
}

function matchMediumToPractice(medium: string, practice: PracticeType): boolean {
  const hay = medium.toLowerCase();
  return practice.mediumKeywords.some((kw) => hay.includes(kw.toLowerCase()));
}

/** Registry-derived practices from verified artwork mediums only. */
export function inferRegistryPracticeSlugs(
  verifiedMediums: readonly string[]
): string[] {
  const slugs: string[] = [];
  for (const practice of PRACTICE_TYPES) {
    const matched = verifiedMediums.some(
      (medium) => medium.trim() && matchMediumToPractice(medium, practice)
    );
    if (matched && !slugs.includes(practice.slug)) {
      slugs.push(practice.slug);
    }
  }
  return slugs;
}

/**
 * Merge declared + registry practices for display.
 * Registry-derived slugs rank first; declared fill remaining canonical slugs.
 */
export function mergeCreativePracticeChips(
  declaredSlugs: readonly string[],
  registrySlugs: readonly string[]
): CreativePracticeChip[] {
  const chips: CreativePracticeChip[] = [];
  const seen = new Set<string>();

  for (const slug of registrySlugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    chips.push({ slug, label: practiceLabel(slug), source: "registry" });
  }

  for (const slug of declaredSlugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    chips.push({ slug, label: practiceLabel(slug), source: "declared" });
  }

  return chips;
}

/** Filter match: creative matches if any merged practice slug equals filter slug. */
export function creativeMatchesPracticeFilter(
  declaredSlugs: readonly string[],
  registrySlugs: readonly string[],
  filterSlug: string
): boolean {
  const slug = filterSlug.trim().toLowerCase();
  if (!slug) return true;
  return declaredSlugs.includes(slug) || registrySlugs.includes(slug);
}
