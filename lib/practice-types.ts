/** Canonical practice taxonomy — application layer until 2B lookup table migration. */

export type PracticeType = {
  slug: string;
  label: string;
  /** Keywords matched against verified artwork medium (registry-derived inference). */
  mediumKeywords: readonly string[];
};

export const PRACTICE_TYPES: readonly PracticeType[] = [
  {
    slug: "painting",
    label: "Painting",
    mediumKeywords: ["painting", "oil", "acrylic", "canvas", "watercolour", "watercolor", "gouache"],
  },
  {
    slug: "sculpture",
    label: "Sculpture",
    mediumKeywords: ["sculpture", "bronze", "marble", "ceramic", "clay", "stone"],
  },
  {
    slug: "photography",
    label: "Photography",
    mediumKeywords: ["photograph", "photo", "pigment print", "gelatin", "c-print", "chromogenic"],
  },
  {
    slug: "film",
    label: "Film",
    mediumKeywords: ["film", "video", "cinema", "moving image", "16mm", "35mm"],
  },
  {
    slug: "production",
    label: "Production",
    mediumKeywords: ["production design", "produced", "production"],
  },
  {
    slug: "scenography",
    label: "Scenography",
    mediumKeywords: ["scenography", "stage design", "set design", "theatrical"],
  },
  {
    slug: "public-art",
    label: "Public Art",
    mediumKeywords: ["public art", "site-specific", "monument", "mural"],
  },
  {
    slug: "architecture",
    label: "Architecture",
    mediumKeywords: ["architecture", "architectural", "built environment"],
  },
  {
    slug: "research",
    label: "Research",
    mediumKeywords: ["research", "archive", "study"],
  },
  {
    slug: "writing",
    label: "Writing",
    mediumKeywords: ["writing", "text", "essay", "manuscript"],
  },
  {
    slug: "performance",
    label: "Performance",
    mediumKeywords: ["performance", "live art", "durational"],
  },
  {
    slug: "curation",
    label: "Curation",
    mediumKeywords: ["curated", "curatorial", "exhibition"],
  },
  {
    slug: "creative-direction",
    label: "Creative Direction",
    mediumKeywords: ["creative direction", "art direction"],
  },
  {
    slug: "placemaking",
    label: "Placemaking",
    mediumKeywords: ["placemaking", "place-making", "urban design"],
  },
] as const;

const BY_SLUG = new Map(PRACTICE_TYPES.map((p) => [p.slug, p]));

export function practiceTypeBySlug(slug: string): PracticeType | undefined {
  return BY_SLUG.get(slug.trim().toLowerCase());
}

export function isPracticeSlug(value: string): boolean {
  return BY_SLUG.has(value.trim().toLowerCase());
}

export function practiceLabel(slug: string): string {
  return practiceTypeBySlug(slug)?.label ?? slug;
}
