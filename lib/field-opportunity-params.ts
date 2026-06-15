import type { BriefType, ParticipationMode } from "@/lib/opportunity-types";
import { isBriefType } from "@/lib/opportunity-types";
import { isCulturalSectorSlug } from "@/lib/cultural-sectors";
import { isPracticeSlug } from "@/lib/practice-types";
import { fieldSearchIlikePattern } from "@/lib/field-search-contract";

export const FIELD_OPPORTUNITY_PAGE_SIZE = 24;

export type FieldOpportunityWindowFilter = "all" | "open" | "closed";

export type FieldOpportunitySort = "closing" | "published" | "title";

export type FieldOpportunityListParams = {
  q: string;
  sector: string;
  practice: string;
  briefType: BriefType | "";
  window: FieldOpportunityWindowFilter;
  page: number;
  sort: FieldOpportunitySort;
};

function parseStringParam(
  value: string | string[] | undefined,
  maxLen = 120
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return String(raw ?? "").trim().slice(0, maxLen);
}

function parsePage(value: string | string[] | undefined): number {
  const raw = parseStringParam(value, 8);
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseSort(value: string | string[] | undefined): FieldOpportunitySort {
  const raw = parseStringParam(value, 24);
  if (raw === "published" || raw === "title") return raw;
  return "closing";
}

function parseWindow(value: string | string[] | undefined): FieldOpportunityWindowFilter {
  const raw = parseStringParam(value, 16);
  if (raw === "open" || raw === "closed") return raw;
  return "all";
}

export function parseFieldOpportunityListParams(
  searchParams: Record<string, string | string[] | undefined>
): FieldOpportunityListParams {
  const briefTypeRaw = parseStringParam(searchParams.type, 40);
  const briefType = isBriefType(briefTypeRaw) ? briefTypeRaw : "";

  const sectorRaw = parseStringParam(searchParams.sector, 40);
  const sector = isCulturalSectorSlug(sectorRaw) ? sectorRaw : "";

  const practiceRaw = parseStringParam(searchParams.practice, 40);
  const practice = isPracticeSlug(practiceRaw) ? practiceRaw : "";

  return {
    q: parseStringParam(searchParams.q, 120),
    sector,
    practice,
    briefType,
    window: parseWindow(searchParams.window),
    page: parsePage(searchParams.page),
    sort: parseSort(searchParams.sort),
  };
}

export function fieldOpportunitySearchPattern(q: string): string | null {
  return fieldSearchIlikePattern(q);
}

export function isOpportunityAcceptingResponses(args: {
  opensAt: string | null;
  closesAt: string | null;
  now?: Date;
}): boolean {
  const now = args.now ?? new Date();
  if (args.opensAt) {
    const opens = new Date(args.opensAt);
    if (!Number.isNaN(opens.getTime()) && opens > now) return false;
  }
  if (args.closesAt) {
    const closes = new Date(args.closesAt);
    if (!Number.isNaN(closes.getTime()) && closes < now) return false;
  }
  return true;
}

export type FieldBriefRow = {
  id: string;
  gallery_id: string;
  programme_id: string | null;
  title: string;
  description: string | null;
  sector: string;
  practices_required: string[];
  brief_type: BriefType;
  participation_mode: ParticipationMode;
  visibility_state: string;
  opens_at: string | null;
  closes_at: string | null;
  registry_outcome_required: boolean;
  registry_outcome_copy: string | null;
  eligible_disciplines: string[] | null;
  eligible_locations: string[] | null;
  eligible_career_stages: string[] | null;
  eligibility_notes: string | null;
  invitation_only: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FieldProgrammeRow = {
  id: string;
  gallery_id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility_state: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function fieldOpportunityQueryString(params: FieldOpportunityListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.sector) sp.set("sector", params.sector);
  if (params.practice) sp.set("practice", params.practice);
  if (params.briefType) sp.set("type", params.briefType);
  if (params.window !== "all") sp.set("window", params.window);
  if (params.sort !== "closing") sp.set("sort", params.sort);
  if (params.page > 1) sp.set("page", String(params.page));
  return sp.toString();
}
