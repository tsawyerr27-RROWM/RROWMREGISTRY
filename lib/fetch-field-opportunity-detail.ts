import type { SupabaseClient } from "@supabase/supabase-js";

import { culturalSectorLabel } from "@/lib/cultural-sectors";
import {
  fieldOpportunityHref,
  fieldOrganisationHref,
  fieldProgrammeHref,
} from "@/lib/field-nav";
import {
  isOpportunityAcceptingResponses,
  type FieldBriefRow,
} from "@/lib/field-opportunity-params";
import {
  loadOrganisationPresencePageData,
  type OrganisationPresencePageData,
} from "@/lib/field-organisation-presence";
import {
  briefTypeLabel,
  participationModeLabel,
  type BriefType,
  type ParticipationMode,
} from "@/lib/opportunity-types";
import { practiceLabel } from "@/lib/practice-types";

export type FieldOpportunityDetailData = {
  brief: FieldBriefRow;
  organisation: {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
    href: string;
  };
  programme: {
    id: string;
    title: string;
    slug: string;
    href: string;
  } | null;
  sectorLabel: string;
  briefTypeLabel: string;
  participationModeLabel: string;
  practiceLabels: string[];
  acceptingResponses: boolean;
  presence: OrganisationPresencePageData | null;
};

export async function loadFieldOpportunityDetailPageData(
  supabase: SupabaseClient,
  briefId: string
): Promise<FieldOpportunityDetailData | null> {
  const { data, error } = await supabase
    .from("field_briefs")
    .select(
      "*, galleries(id, name, slug, verified), field_programmes(id, title, slug, visibility_state)"
    )
    .eq("id", briefId)
    .maybeSingle();

  if (error || !data) return null;

  const gallery = data.galleries as {
    id: string;
    name: string | null;
    slug: string;
    verified: boolean;
  } | null;

  if (
    data.visibility_state !== "published" ||
    data.participation_mode !== "open" ||
    !gallery?.verified
  ) {
    return null;
  }

  const programmeRaw = data.field_programmes as {
    id: string;
    title: string;
    slug: string;
    visibility_state: string;
  } | null;

  const practices = Array.isArray(data.practices_required)
    ? data.practices_required.filter(Boolean)
    : [];

  let presence: OrganisationPresencePageData | null = null;
  if (gallery.slug) {
    try {
      presence = await loadOrganisationPresencePageData(supabase, gallery.slug);
    } catch {
      presence = null;
    }
  }

  return {
    brief: {
      id: data.id,
      gallery_id: data.gallery_id,
      programme_id: data.programme_id,
      title: data.title,
      description: data.description,
      sector: data.sector,
      practices_required: practices,
      brief_type: data.brief_type as BriefType,
      participation_mode: data.participation_mode as ParticipationMode,
      visibility_state: data.visibility_state,
      opens_at: data.opens_at,
      closes_at: data.closes_at,
      registry_outcome_required: Boolean(data.registry_outcome_required),
      registry_outcome_copy: data.registry_outcome_copy,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
    organisation: {
      id: gallery.id,
      name: gallery.name?.trim() || "Organisation",
      slug: gallery.slug,
      verified: gallery.verified,
      href: fieldOrganisationHref(gallery.slug),
    },
    programme:
      programmeRaw && programmeRaw.visibility_state === "published"
        ? {
            id: programmeRaw.id,
            title: programmeRaw.title,
            slug: programmeRaw.slug,
            href: fieldProgrammeHref(programmeRaw.slug),
          }
        : null,
    sectorLabel: culturalSectorLabel(data.sector),
    briefTypeLabel: briefTypeLabel(data.brief_type as BriefType),
    participationModeLabel: participationModeLabel(
      data.participation_mode as ParticipationMode
    ),
    practiceLabels: practices.map((slug: string) => practiceLabel(slug)),
    acceptingResponses: isOpportunityAcceptingResponses({
      opensAt: data.opens_at,
      closesAt: data.closes_at,
    }),
    presence,
  };
}

export function fieldOpportunityCanonicalHref(id: string): string {
  return fieldOpportunityHref(id);
}
