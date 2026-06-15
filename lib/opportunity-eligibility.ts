import { parseDeclaredPracticeSlugs } from "@/lib/practices";
import { isPracticeSlug } from "@/lib/practice-types";

export type EligibilityDisciplineSlug =
  | "writer"
  | "curator"
  | "visual-artist"
  | "filmmaker"
  | "photographer"
  | "performer"
  | "producer"
  | "researcher"
  | "designer"
  | "architect";

export type EligibilityLocationSlug =
  | "uk"
  | "united-states"
  | "europe"
  | "canada"
  | "australia"
  | "global"
  | "remote";

export type EligibilityCareerStageSlug =
  | "student"
  | "emerging"
  | "early-career"
  | "mid-career"
  | "established";

export const ELIGIBILITY_DISCIPLINE_OPTIONS: readonly {
  slug: EligibilityDisciplineSlug;
  label: string;
}[] = [
  { slug: "writer", label: "Writer" },
  { slug: "curator", label: "Curator" },
  { slug: "visual-artist", label: "Visual artist" },
  { slug: "filmmaker", label: "Filmmaker" },
  { slug: "photographer", label: "Photographer" },
  { slug: "performer", label: "Performer" },
  { slug: "producer", label: "Producer" },
  { slug: "researcher", label: "Researcher" },
  { slug: "designer", label: "Designer" },
  { slug: "architect", label: "Architect" },
];

export const ELIGIBILITY_LOCATION_OPTIONS: readonly {
  slug: EligibilityLocationSlug;
  label: string;
}[] = [
  { slug: "uk", label: "United Kingdom" },
  { slug: "united-states", label: "United States" },
  { slug: "europe", label: "Europe" },
  { slug: "canada", label: "Canada" },
  { slug: "australia", label: "Australia" },
  { slug: "global", label: "Global" },
  { slug: "remote", label: "Remote" },
];

export const ELIGIBILITY_CAREER_STAGE_OPTIONS: readonly {
  slug: EligibilityCareerStageSlug;
  label: string;
}[] = [
  { slug: "student", label: "Student" },
  { slug: "emerging", label: "Emerging" },
  { slug: "early-career", label: "Early career" },
  { slug: "mid-career", label: "Mid-career" },
  { slug: "established", label: "Established" },
];

const DISCIPLINE_SLUGS = new Set(
  ELIGIBILITY_DISCIPLINE_OPTIONS.map((o) => o.slug)
);
const LOCATION_SLUGS = new Set(ELIGIBILITY_LOCATION_OPTIONS.map((o) => o.slug));
const CAREER_STAGE_SLUGS = new Set(
  ELIGIBILITY_CAREER_STAGE_OPTIONS.map((o) => o.slug)
);

const PRACTICE_TO_DISCIPLINES: Partial<Record<string, EligibilityDisciplineSlug[]>> =
  {
    writing: ["writer"],
    curation: ["curator"],
    film: ["filmmaker"],
    photography: ["photographer"],
    performance: ["performer"],
    production: ["producer"],
    research: ["researcher"],
    architecture: ["architect"],
    scenography: ["designer"],
    "creative-direction": ["designer"],
    placemaking: ["designer"],
    painting: ["visual-artist"],
    sculpture: ["visual-artist"],
    "public-art": ["visual-artist"],
  };

const LOCATION_KEYWORDS: Record<EligibilityLocationSlug, readonly string[]> = {
  uk: [
    "uk",
    "u.k.",
    "united kingdom",
    "england",
    "scotland",
    "wales",
    "northern ireland",
    "london",
    "britain",
  ],
  "united-states": [
    "united states",
    "u.s.",
    "usa",
    "us",
    "america",
  ],
  europe: ["europe", "eu", "european union"],
  canada: ["canada", "canadian"],
  australia: ["australia", "australian"],
  global: [],
  remote: [],
};

export type OpportunityEligibilityFields = {
  eligible_disciplines: string[] | null;
  eligible_locations: string[] | null;
  eligible_career_stages: string[] | null;
  eligibility_notes: string | null;
  invitation_only: boolean | null;
};

export type CreativeEligibilityProfile = {
  disciplineSlugs: string[];
  locationText: string | null;
  careerStageSlug: string | null;
};

export type EligibilityMatchStatus = "match" | "no_match" | "not_specified" | "info";

export type EligibilityMatchIndicator = {
  kind: "discipline" | "location" | "career_stage" | "invitation_only";
  status: EligibilityMatchStatus;
  message: string;
};

/** PR1C.5 — soft apply gate by declared practices / eligible disciplines only. */
export type PracticeApplyGateStatus =
  | "open"
  | "match"
  | "no_practices"
  | "mismatch";

export type PracticeApplyGateResult = {
  /** False only when declared practices are missing (hard block). */
  canApply: boolean;
  /** True when applicant must submit a discipline mismatch justification. */
  requiresEligibilityOverride: boolean;
  status: PracticeApplyGateStatus;
};

export function evaluatePracticeApplyGate(args: {
  eligibleDisciplines: string[] | null | undefined;
  declaredPracticeSlugs: readonly string[];
}): PracticeApplyGateResult {
  const eligibleDisciplines = args.eligibleDisciplines ?? [];

  if (eligibleDisciplines.length === 0) {
    return { canApply: true, requiresEligibilityOverride: false, status: "open" };
  }

  const declaredPracticeSlugs = args.declaredPracticeSlugs.filter(Boolean);
  if (declaredPracticeSlugs.length === 0) {
    return { canApply: false, requiresEligibilityOverride: false, status: "no_practices" };
  }

  const mappedDisciplines = disciplineSlugsFromDeclaredPractices(declaredPracticeSlugs);
  const matches = eligibleDisciplines.some((slug) =>
    mappedDisciplines.includes(slug as EligibilityDisciplineSlug)
  );

  if (matches) {
    return { canApply: true, requiresEligibilityOverride: false, status: "match" };
  }

  return { canApply: true, requiresEligibilityOverride: true, status: "mismatch" };
}

export function practiceApplyGateFromPublicPresence(args: {
  eligibleDisciplines: string[] | null | undefined;
  publicPresence: unknown;
}): PracticeApplyGateResult {
  return evaluatePracticeApplyGate({
    eligibleDisciplines: args.eligibleDisciplines,
    declaredPracticeSlugs: parseDeclaredPracticeSlugs(args.publicPresence),
  });
}

export function practiceApplyGateBlockMessage(
  status: PracticeApplyGateStatus
): string | null {
  switch (status) {
    case "no_practices":
      return "You need declared practices in your profile before applying.";
    default:
      return null;
  }
}

export function isEligibilityDisciplineSlug(
  value: string
): value is EligibilityDisciplineSlug {
  return DISCIPLINE_SLUGS.has(value as EligibilityDisciplineSlug);
}

export function isEligibilityLocationSlug(
  value: string
): value is EligibilityLocationSlug {
  return LOCATION_SLUGS.has(value as EligibilityLocationSlug);
}

export function isEligibilityCareerStageSlug(
  value: string
): value is EligibilityCareerStageSlug {
  return CAREER_STAGE_SLUGS.has(value as EligibilityCareerStageSlug);
}

export function normalizeEligibilityDisciplines(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const entry of values) {
    const slug = String(entry).trim().toLowerCase();
    if (!isEligibilityDisciplineSlug(slug) || out.includes(slug)) continue;
    out.push(slug);
  }
  return out;
}

export function normalizeEligibilityLocations(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const entry of values) {
    const slug = String(entry).trim().toLowerCase();
    if (!isEligibilityLocationSlug(slug) || out.includes(slug)) continue;
    out.push(slug);
  }
  return out;
}

export function normalizeEligibilityCareerStages(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const entry of values) {
    const slug = String(entry).trim().toLowerCase();
    if (!isEligibilityCareerStageSlug(slug) || out.includes(slug)) continue;
    out.push(slug);
  }
  return out;
}

export function disciplineLabel(slug: string): string {
  return (
    ELIGIBILITY_DISCIPLINE_OPTIONS.find((o) => o.slug === slug)?.label ?? slug
  );
}

export function eligibilityLocationLabel(slug: string): string {
  return ELIGIBILITY_LOCATION_OPTIONS.find((o) => o.slug === slug)?.label ?? slug;
}

export function careerStageLabel(slug: string): string {
  return (
    ELIGIBILITY_CAREER_STAGE_OPTIONS.find((o) => o.slug === slug)?.label ?? slug
  );
}

export function parseOpportunityEligibilityFields(
  raw: Record<string, unknown>
): OpportunityEligibilityFields {
  const disciplines = Array.isArray(raw.eligible_disciplines)
    ? raw.eligible_disciplines.filter(Boolean).map(String)
    : null;
  const locations = Array.isArray(raw.eligible_locations)
    ? raw.eligible_locations.filter(Boolean).map(String)
    : null;
  const careerStages = Array.isArray(raw.eligible_career_stages)
    ? raw.eligible_career_stages.filter(Boolean).map(String)
    : null;

  return {
    eligible_disciplines: disciplines?.length ? disciplines : null,
    eligible_locations: locations?.length ? locations : null,
    eligible_career_stages: careerStages?.length ? careerStages : null,
    eligibility_notes: raw.eligibility_notes
      ? String(raw.eligibility_notes).trim() || null
      : null,
    invitation_only:
      raw.invitation_only === null || raw.invitation_only === undefined
        ? null
        : Boolean(raw.invitation_only),
  };
}

export function opportunityEligibilityDisplayLabels(
  eligibility: OpportunityEligibilityFields
): {
  disciplines: string[];
  locations: string[];
  careerStages: string[];
} {
  return {
    disciplines: (eligibility.eligible_disciplines ?? []).map(disciplineLabel),
    locations: (eligibility.eligible_locations ?? []).map(eligibilityLocationLabel),
    careerStages: (eligibility.eligible_career_stages ?? []).map(careerStageLabel),
  };
}

export function hasPublicEligibilityContent(
  eligibility: OpportunityEligibilityFields
): boolean {
  return Boolean(
    eligibility.eligible_disciplines?.length ||
      eligibility.eligible_locations?.length ||
      eligibility.eligible_career_stages?.length ||
      eligibility.eligibility_notes?.trim() ||
      eligibility.invitation_only !== null
  );
}

export function disciplineSlugsFromDeclaredPractices(
  practiceSlugs: readonly string[]
): string[] {
  const out = new Set<EligibilityDisciplineSlug>();
  for (const practice of practiceSlugs) {
    const slug = practice.trim().toLowerCase();
    if (!isPracticeSlug(slug)) continue;
    const mapped = PRACTICE_TO_DISCIPLINES[slug];
    if (mapped) {
      for (const discipline of mapped) out.add(discipline);
      continue;
    }
    if (isEligibilityDisciplineSlug(slug)) {
      out.add(slug);
    }
  }
  return [...out];
}

export function creativeEligibilityProfileFromArtistRow(args: {
  publicPresence: unknown;
  locationText?: string | null;
  careerStageSlug?: string | null;
}): CreativeEligibilityProfile {
  const practiceSlugs = parseDeclaredPracticeSlugs(args.publicPresence);
  return {
    disciplineSlugs: disciplineSlugsFromDeclaredPractices(practiceSlugs),
    locationText: args.locationText?.trim() || null,
    careerStageSlug: args.careerStageSlug?.trim().toLowerCase() || null,
  };
}

function locationTextMatchesSlug(
  locationText: string,
  slug: EligibilityLocationSlug
): boolean {
  if (slug === "global" || slug === "remote") return true;
  const normalized = locationText.trim().toLowerCase();
  if (!normalized) return false;
  return (LOCATION_KEYWORDS[slug] ?? []).some((keyword) =>
    normalized.includes(keyword)
  );
}

function formatLocationPreference(locations: string[]): string {
  const labels = locations.map((slug) => eligibilityLocationLabel(slug));
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

export function buildEligibilityMatchIndicators(args: {
  eligibility: OpportunityEligibilityFields;
  profile: CreativeEligibilityProfile | null;
}): EligibilityMatchIndicator[] {
  const { eligibility, profile } = args;
  const indicators: EligibilityMatchIndicator[] = [];

  const disciplines = eligibility.eligible_disciplines ?? [];
  if (disciplines.length > 0) {
    if (!profile || profile.disciplineSlugs.length === 0) {
      indicators.push({
        kind: "discipline",
        status: "not_specified",
        message: "Discipline not specified on your profile",
      });
    } else {
      const matches = disciplines.some((slug) =>
        profile.disciplineSlugs.includes(slug)
      );
      indicators.push({
        kind: "discipline",
        status: matches ? "match" : "no_match",
        message: matches
          ? "Discipline matches"
          : "Your declared practices may not match the preferred disciplines",
      });
    }
  }

  const locations = eligibility.eligible_locations ?? [];
  if (locations.length > 0) {
    const preference = formatLocationPreference(locations);
    if (!profile?.locationText) {
      indicators.push({
        kind: "location",
        status: "not_specified",
        message: `Opportunity prefers ${preference}-based applicants`,
      });
    } else {
      const matches = locations.some((slug) =>
        isEligibilityLocationSlug(slug)
          ? locationTextMatchesSlug(profile.locationText!, slug)
          : false
      );
      indicators.push({
        kind: "location",
        status: matches ? "match" : "no_match",
        message: matches
          ? "Location matches"
          : `Opportunity prefers ${preference}-based applicants`,
      });
    }
  }

  const careerStages = eligibility.eligible_career_stages ?? [];
  if (careerStages.length > 0) {
    if (!profile?.careerStageSlug) {
      indicators.push({
        kind: "career_stage",
        status: "not_specified",
        message: "Career stage not specified on your profile",
      });
    } else {
      const matches = careerStages.includes(profile.careerStageSlug);
      indicators.push({
        kind: "career_stage",
        status: matches ? "match" : "no_match",
        message: matches
          ? "Career stage matches"
          : "Your career stage may not match the preferred stages",
      });
    }
  }

  if (eligibility.invitation_only) {
    indicators.push({
      kind: "invitation_only",
      status: "info",
      message: "This opportunity is marked invitation only",
    });
  }

  return indicators;
}
