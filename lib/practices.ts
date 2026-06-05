import type { SupabaseClient } from "@supabase/supabase-js";

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
  /** Declared primary practice — ordered first when set. */
  isPrimary?: boolean;
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

/** Primary declared practice slug on `public_presence.primary_practice` (jsonb, no migration). */
export function parsePrimaryPracticeSlug(publicPresenceRaw: unknown): string | null {
  if (publicPresenceRaw == null || typeof publicPresenceRaw !== "object") {
    return null;
  }
  const raw = (publicPresenceRaw as Record<string, unknown>).primary_practice;
  if (typeof raw !== "string") return null;
  const slug = raw.trim().toLowerCase();
  return isPracticeSlug(slug) ? slug : null;
}

/** Practice chip visibility — default visible when profile is public. */
export function parsePracticeVisibility(publicPresenceRaw: unknown): boolean {
  if (publicPresenceRaw == null || typeof publicPresenceRaw !== "object") {
    return true;
  }
  return (publicPresenceRaw as Record<string, unknown>).practices_visible !== false;
}

export function partitionCreativePracticeChips(practices: CreativePracticeChip[]): {
  declared: CreativePracticeChip[];
  registry: CreativePracticeChip[];
} {
  return {
    declared: practices.filter((p) => p.source === "declared"),
    registry: practices.filter((p) => p.source === "registry"),
  };
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
 * Primary declared first, then other declared, then registry-evidence (declared wins dedupe).
 */
export function mergeCreativePracticeChips(
  declaredSlugs: readonly string[],
  registrySlugs: readonly string[],
  primarySlug?: string | null
): CreativePracticeChip[] {
  const normalizedPrimary = primarySlug?.trim().toLowerCase() ?? null;
  const declaredSet = new Set(declaredSlugs);
  const chips: CreativePracticeChip[] = [];
  const seen = new Set<string>();

  const pushDeclared = (slug: string, isPrimary: boolean) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    chips.push({
      slug,
      label: practiceLabel(slug),
      source: "declared",
      isPrimary: isPrimary || undefined,
    });
  };

  const pushRegistry = (slug: string) => {
    if (seen.has(slug) || declaredSet.has(slug)) return;
    seen.add(slug);
    chips.push({ slug, label: practiceLabel(slug), source: "registry" });
  };

  if (normalizedPrimary && declaredSet.has(normalizedPrimary)) {
    pushDeclared(normalizedPrimary, true);
  }

  for (const slug of declaredSlugs) {
    if (slug === normalizedPrimary) continue;
    pushDeclared(slug, false);
  }

  for (const slug of registrySlugs) {
    pushRegistry(slug);
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

export async function loadCreativePracticeChips(
  supabase: SupabaseClient,
  artistId: string,
  publicPresenceRaw: unknown
): Promise<CreativePracticeChip[]> {
  if (!parsePracticeVisibility(publicPresenceRaw)) {
    return [];
  }

  const declared = parseDeclaredPracticeSlugs(publicPresenceRaw);
  const primary = parsePrimaryPracticeSlug(publicPresenceRaw);

  const { data: artworkRows } = await supabase
    .from("artworks")
    .select("medium")
    .eq("artist_id", artistId)
    .eq("verification_status", "verified");

  const mediums = (artworkRows ?? [])
    .map((row) => (row as { medium?: string | null }).medium)
    .filter((m): m is string => Boolean(m?.trim()));

  return mergeCreativePracticeChips(
    declared,
    inferRegistryPracticeSlugs(mediums),
    primary
  );
}
