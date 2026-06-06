/** Closed cultural sector taxonomy — Phase 2C founder freeze §6a / Product Blueprint v1.1 §3. */

export const CULTURAL_SECTORS = [
  "public_art",
  "film",
  "hospitality",
  "retail",
  "festivals",
  "museums",
  "culture",
  "education",
  "residential",
  "commercial_property",
  "public_realm",
  "heritage",
] as const;

export type CulturalSectorSlug = (typeof CULTURAL_SECTORS)[number];

export type CulturalSector = {
  slug: CulturalSectorSlug;
  label: string;
};

export const CULTURAL_SECTOR_OPTIONS: CulturalSector[] = [
  { slug: "public_art", label: "Public Art" },
  { slug: "film", label: "Film" },
  { slug: "hospitality", label: "Hospitality" },
  { slug: "retail", label: "Retail" },
  { slug: "festivals", label: "Festivals" },
  { slug: "museums", label: "Museums" },
  { slug: "culture", label: "Culture" },
  { slug: "education", label: "Education" },
  { slug: "residential", label: "Residential" },
  { slug: "commercial_property", label: "Commercial Property" },
  { slug: "public_realm", label: "Public Realm" },
  { slug: "heritage", label: "Heritage" },
];

export function isCulturalSectorSlug(value: string): value is CulturalSectorSlug {
  return (CULTURAL_SECTORS as readonly string[]).includes(value);
}

export function culturalSectorLabel(slug: string): string {
  return CULTURAL_SECTOR_OPTIONS.find((s) => s.slug === slug)?.label ?? slug.replace(/_/g, " ");
}
