import type { SupabaseClient } from "@supabase/supabase-js";

import { culturalSectorLabel } from "@/lib/cultural-sectors";
import {
  fieldOpportunitiesHref,
  fieldOpportunityHref,
  fieldOrganisationHref,
} from "@/lib/field-nav";
import {
  fieldOpportunitySearchPattern,
  isOpportunityAcceptingResponses,
  type FieldOpportunityListParams,
  type FieldOpportunitySort,
  FIELD_OPPORTUNITY_PAGE_SIZE,
} from "@/lib/field-opportunity-params";
import { briefTypeLabel } from "@/lib/opportunity-types";
import { practiceLabel } from "@/lib/practice-types";

export type FieldOpportunityCard = {
  id: string;
  title: string;
  descriptionExcerpt: string | null;
  sector: string;
  sectorLabel: string;
  briefType: string;
  briefTypeLabel: string;
  practicesRequired: string[];
  practiceLabels: string[];
  organisationName: string;
  organisationSlug: string;
  organisationVerified: boolean;
  organisationHref: string;
  href: string;
  closesAt: string | null;
  publishedAt: string | null;
  acceptingResponses: boolean;
};

type BriefCandidate = {
  id: string;
  title: string;
  description: string | null;
  sector: string;
  practices_required: string[] | null;
  brief_type: string;
  closes_at: string | null;
  published_at: string | null;
  opens_at: string | null;
  gallery_id: string;
  galleries: {
    name: string | null;
    slug: string;
    verified: boolean;
  } | null;
};

function excerpt(text: string | null, max = 180): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function sortCards(cards: FieldOpportunityCard[], sort: FieldOpportunitySort) {
  const copy = [...cards];
  copy.sort((a, b) => {
    if (sort === "title") {
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    if (sort === "published") {
      const aTs = a.publishedAt ?? "";
      const bTs = b.publishedAt ?? "";
      return bTs.localeCompare(aTs);
    }
    const aClose = a.closesAt ?? "9999";
    const bClose = b.closesAt ?? "9999";
    return aClose.localeCompare(bClose);
  });
  return copy;
}

export async function fetchFieldOpportunitiesList(
  supabase: SupabaseClient,
  params: FieldOpportunityListParams
): Promise<{ rows: FieldOpportunityCard[]; total: number; basePath: string }> {
  const basePath = fieldOpportunitiesHref();

  let query = supabase
    .from("field_briefs")
    .select(
      "id, title, description, sector, practices_required, brief_type, closes_at, published_at, opens_at, gallery_id, galleries(name, slug, verified)"
    )
    .eq("visibility_state", "published")
    .eq("participation_mode", "open");

  if (params.sector) {
    query = query.eq("sector", params.sector);
  }

  if (params.briefType) {
    query = query.eq("brief_type", params.briefType);
  }

  if (params.practice) {
    query = query.contains("practices_required", [params.practice]);
  }

  const pattern = fieldOpportunitySearchPattern(params.q);
  if (pattern) {
    query = query.or(
      `title.ilike.${pattern},description.ilike.${pattern},sector.ilike.${pattern}`
    );
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const now = new Date();
  type Row = (typeof data extends (infer U)[] | null ? U : never);

  function normalizeGallery(
    raw: Row["galleries"]
  ): BriefCandidate["galleries"] {
    if (!raw) return null;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw as BriefCandidate["galleries"];
  }

  let cards: FieldOpportunityCard[] = ((data || []) as Row[])
    .map((row) => {
      const gallery = normalizeGallery(row.galleries);
      if (!gallery?.verified) return null;
      const practices = Array.isArray(row.practices_required)
        ? row.practices_required.filter(Boolean)
        : [];
      const accepting = isOpportunityAcceptingResponses({
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        now,
      });
      return {
        id: row.id,
        title: row.title,
        descriptionExcerpt: excerpt(row.description),
        sector: row.sector,
        sectorLabel: culturalSectorLabel(row.sector),
        briefType: row.brief_type,
        briefTypeLabel: briefTypeLabel(row.brief_type as never),
        practicesRequired: practices,
        practiceLabels: practices.map((slug: string) => practiceLabel(slug)),
        organisationName: gallery.name?.trim() || "Organisation",
        organisationSlug: gallery.slug || "",
        organisationVerified: Boolean(gallery.verified),
        organisationHref: gallery.slug
          ? fieldOrganisationHref(gallery.slug)
          : fieldOpportunitiesHref(),
        href: fieldOpportunityHref(row.id),
        closesAt: row.closes_at,
        publishedAt: row.published_at,
        acceptingResponses: accepting,
      };
    })
    .filter((card): card is FieldOpportunityCard => card !== null);

  if (params.window === "open") {
    cards = cards.filter((c) => c.acceptingResponses);
  } else if (params.window === "closed") {
    cards = cards.filter((c) => !c.acceptingResponses);
  }

  cards = sortCards(cards, params.sort);

  // `cards` is the fully filtered set (verified gallery + response window), so
  // its length is the honest total for every window. The previous SQL `count`
  // counted rows before those JS filters and advertised empty pages. (Caveat:
  // if opportunities ever exceed PostgREST's default row cap, push the verified
  // filter into SQL and paginate there instead.)
  const total = cards.length;
  const start = (params.page - 1) * FIELD_OPPORTUNITY_PAGE_SIZE;
  const rows = cards.slice(start, start + FIELD_OPPORTUNITY_PAGE_SIZE);

  return { rows, total, basePath };
}
