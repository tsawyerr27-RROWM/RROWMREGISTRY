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
import type {
  FieldOpportunityApplyContext,
  OrganisationOpportunityApplicationListItem,
  OpportunityApplicationStatus,
} from "@/lib/field-opportunity-applications";
import {
  isOpportunityApplicationStatus,
  opportunityApplicationStatusLabel,
} from "@/lib/field-opportunity-applications";
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
import {
  buildEligibilityMatchIndicators,
  creativeEligibilityProfileFromArtistRow,
  hasPublicEligibilityContent,
  parseOpportunityEligibilityFields,
  practiceApplyGateFromPublicPresence,
  type OpportunityEligibilityFields,
} from "@/lib/opportunity-eligibility";
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
  applyContext: FieldOpportunityApplyContext;
  eligibility: OpportunityEligibilityFields;
  showEligibilityPanel: boolean;
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

  const eligibility = parseOpportunityEligibilityFields(
    data as Record<string, unknown>
  );
  const applyContext = await loadFieldOpportunityApplyContext(
    supabase,
    briefId,
    eligibility
  );

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
      eligible_disciplines: eligibility.eligible_disciplines,
      eligible_locations: eligibility.eligible_locations,
      eligible_career_stages: eligibility.eligible_career_stages,
      eligibility_notes: eligibility.eligibility_notes,
      invitation_only: eligibility.invitation_only,
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
    applyContext,
    eligibility,
    showEligibilityPanel: hasPublicEligibilityContent(eligibility),
  };
}

export async function loadFieldOpportunityApplyContext(
  supabase: SupabaseClient,
  briefId: string,
  eligibility?: OpportunityEligibilityFields
): Promise<FieldOpportunityApplyContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      viewerRole: null,
      application: null,
      eligibilityIndicators: [],
      practiceApplyGate: null,
    };
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = actor?.role;
  const viewerRole =
    role === "artist" || role === "collector" || role === "gallery"
      ? role
      : null;

  if (viewerRole !== "artist") {
    return {
      isAuthenticated: true,
      viewerRole,
      application: null,
      eligibilityIndicators: [],
      practiceApplyGate: null,
    };
  }

  const [{ data: application }, { data: artist }] = await Promise.all([
    supabase
      .from("field_opportunity_applications")
      .select("id, status, created_at, updated_at")
      .eq("opportunity_id", briefId)
      .eq("applicant_user_id", user.id)
      .maybeSingle(),
    supabase
      .from("artists")
      .select("public_presence")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const creativeProfile = artist
    ? creativeEligibilityProfileFromArtistRow({
        publicPresence: artist.public_presence,
      })
    : null;

  const practiceApplyGate = practiceApplyGateFromPublicPresence({
    eligibleDisciplines: eligibility?.eligible_disciplines,
    publicPresence: artist?.public_presence,
  });

  const eligibilityIndicators =
    eligibility && hasPublicEligibilityContent(eligibility)
      ? buildEligibilityMatchIndicators({
          eligibility,
          profile: creativeProfile,
        })
      : [];

  return {
    isAuthenticated: true,
    viewerRole,
    application: application
      ? {
          id: application.id,
          status: isOpportunityApplicationStatus(application.status)
            ? application.status
            : ("submitted" satisfies OpportunityApplicationStatus),
          created_at: application.created_at,
          updated_at: application.updated_at,
        }
      : null,
    eligibilityIndicators,
    practiceApplyGate,
  };
}

export function fieldOpportunityCanonicalHref(id: string): string {
  return fieldOpportunityHref(id);
}
