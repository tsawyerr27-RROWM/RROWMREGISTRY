import type { SupabaseClient } from "@supabase/supabase-js";

import type { CreativePresenceGallery } from "@/lib/field-creative-presence";
import type { OrganisationPresenceArtwork, OrganisationPresenceCreative } from "@/lib/field-organisation-presence";
import {
  fieldExplorerCreativesHref,
  fieldExplorerRecordsHref,
  fieldRecordHref,
  fieldVerifyRecordHref,
} from "@/lib/field-nav";
import { recordExplorerQueryString } from "@/lib/field-record-explorer-params";
import type { MessageKey } from "@/lib/locale-messages";
import { isPracticeSlug, practiceLabel } from "@/lib/practice-types";
import { registryLedgerHref } from "@/lib/registry-nav";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export const FIELD_RELATIONSHIP_CONTEXT_MAX = 6;

export type FieldRelationshipContextLink = {
  id: string;
  label: string;
  href: string;
  meta?: string;
  labelKey?: MessageKey;
};

export type FieldRelationshipContextPanelData = {
  id: string;
  headingKey: MessageKey;
  ledeKey: MessageKey;
  ledeParams?: Record<string, string>;
  links: FieldRelationshipContextLink[];
  viewAllHref?: string;
  viewAllLabelKey?: MessageKey;
};

export type FieldRelationshipContextSectionData = {
  panels: FieldRelationshipContextPanelData[];
};

type ContextArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  verification_status: string | null;
  created_at: string;
};

type MediumArtworkRow = ContextArtworkRow & {
  medium: string | null;
};

function isVerifiedStatus(status: string | null | undefined): boolean {
  return String(status || "").toLowerCase() === "verified";
}

function sortContextArtworks<T extends { verification_status: string | null; created_at: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    const av = isVerifiedStatus(a.verification_status) ? 1 : 0;
    const bv = isVerifiedStatus(b.verification_status) ? 1 : 0;
    if (av !== bv) return bv - av;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function recordTitle(row: Pick<ContextArtworkRow, "title" | "registry_id">): string {
  return row.title?.trim() || row.registry_id?.trim() || "Registry record";
}

function mapArtworkLinks(
  rows: ContextArtworkRow[],
  metaKey?: "verified" | "onFile"
): FieldRelationshipContextLink[] {
  return sortContextArtworks(rows)
    .slice(0, FIELD_RELATIONSHIP_CONTEXT_MAX)
    .map((row) => {
      const registryId = row.registry_id?.trim();
      return {
        id: row.id,
        label: recordTitle(row),
        href: registryId ? fieldRecordHref(registryId) : "#",
        meta: metaKey && isVerifiedStatus(row.verification_status) ? metaKey : undefined,
      };
    })
    .filter((link) => link.href !== "#");
}

function recordExplorerHref(args: {
  creative?: string;
  organisation?: string;
  q?: string;
}): string {
  const query = recordExplorerQueryString({
    q: args.q?.trim() || "",
    sort: "recent",
    page: 1,
    creative: args.creative?.trim() || "",
    organisation: args.organisation?.trim() || "",
    practice: "",
    verified: "all",
    certificate: "all",
  });
  return query ? `${fieldExplorerRecordsHref()}?${query}` : fieldExplorerRecordsHref();
}

export async function loadRecordRelationshipContextPanels(
  supabase: SupabaseClient,
  args: {
    registryId: string;
    artistId: string | null;
    artistSlug: string | null;
    artistName: string | null;
    galleryId: string | null;
    organisationSlug: string | null;
    organisationName: string | null;
    medium: string | null;
    primaryPracticeSlug: string | null;
  }
): Promise<FieldRelationshipContextPanelData[]> {
  const panels: FieldRelationshipContextPanelData[] = [];
  const currentRegistryId = args.registryId.trim();

  if (args.artistId && args.artistName) {
    const { data, error } = await supabase
      .from("artwork_read_model")
      .select("id, title, registry_id, verification_status, created_at")
      .eq("artist_id", args.artistId)
      .neq("registry_id", currentRegistryId)
      .not("registry_id", "is", null)
      .returns<ContextArtworkRow[]>();

    if (error) warnSupabaseRpc("field record context same creative", error);

    const links = mapArtworkLinks(
      (data || []).filter((row) => Boolean(row.registry_id?.trim())),
      "verified"
    );
    if (links.length > 0) {
      panels.push({
        id: "same_creative",
        headingKey: "field.context.record.sameCreative.heading",
        ledeKey: "field.context.record.sameCreative.lede",
        ledeParams: { name: args.artistName },
        links,
        viewAllHref: args.artistSlug
          ? recordExplorerHref({ creative: args.artistSlug })
          : undefined,
        viewAllLabelKey: "field.context.viewAllRecords",
      });
    }
  }

  if (args.galleryId && args.organisationName) {
    const { data: galleryArtists, error: artistsError } = await supabase
      .from("artists")
      .select("id")
      .eq("gallery_id", args.galleryId)
      .returns<Array<{ id: string }>>();

    if (artistsError) warnSupabaseRpc("field record context org artists", artistsError);

    const artistIds = (galleryArtists || []).map((row) => row.id).filter(Boolean);
    let orgQuery = supabase
      .from("artwork_read_model")
      .select("id, title, registry_id, verification_status, created_at")
      .neq("registry_id", currentRegistryId)
      .not("registry_id", "is", null);

    if (artistIds.length > 0) {
      orgQuery = orgQuery.or(
        `artist_id.in.(${artistIds.join(",")}),filing_gallery_id.eq.${args.galleryId}`
      );
    } else {
      orgQuery = orgQuery.eq("filing_gallery_id", args.galleryId);
    }

    const { data: orgRows, error: orgError } = await orgQuery.returns<ContextArtworkRow[]>();
    if (orgError) warnSupabaseRpc("field record context same organisation", orgError);

    const links = mapArtworkLinks(
      (orgRows || []).filter((row) => Boolean(row.registry_id?.trim())),
      "verified"
    );
    if (links.length > 0) {
      panels.push({
        id: "same_organisation",
        headingKey: "field.context.record.sameOrganisation.heading",
        ledeKey: "field.context.record.sameOrganisation.lede",
        ledeParams: { name: args.organisationName },
        links,
        viewAllHref: args.organisationSlug
          ? recordExplorerHref({ organisation: args.organisationSlug })
          : undefined,
        viewAllLabelKey: "field.context.viewAllRecords",
      });
    }
  }

  const medium = args.medium?.trim();
  if (medium) {
    const { data: mediumRows, error: mediumError } = await supabase
      .from("artwork_read_model")
      .select("id, title, registry_id, verification_status, created_at, medium")
      .ilike("medium", medium)
      .neq("registry_id", currentRegistryId)
      .not("registry_id", "is", null)
      .returns<MediumArtworkRow[]>();

    if (mediumError) warnSupabaseRpc("field record context shared medium", mediumError);

    const exactMediumRows = (mediumRows || []).filter(
      (row) => row.medium?.trim().toLowerCase() === medium.toLowerCase()
    );
    const links = mapArtworkLinks(exactMediumRows, "verified");
    if (links.length > 0) {
      panels.push({
        id: "shared_medium",
        headingKey: "field.context.record.sharedMedium.heading",
        ledeKey: "field.context.record.sharedMedium.lede",
        ledeParams: { medium },
        links,
        viewAllHref: recordExplorerHref({ q: medium }),
        viewAllLabelKey: "field.context.viewAllRecords",
      });
    }
  }

  if (args.primaryPracticeSlug && isPracticeSlug(args.primaryPracticeSlug)) {
    const practice = practiceLabel(args.primaryPracticeSlug);
    panels.push({
      id: "practice_context",
      headingKey: "field.context.record.practice.heading",
      ledeKey: "field.context.record.practice.lede",
      ledeParams: { practice },
      links: [
        {
          id: "practice-explorer",
          label: practice,
          href: `${fieldExplorerCreativesHref()}?practice=${encodeURIComponent(args.primaryPracticeSlug)}`,
        },
      ],
      viewAllHref: `${fieldExplorerCreativesHref()}?practice=${encodeURIComponent(args.primaryPracticeSlug)}`,
      viewAllLabelKey: "field.context.viewAllInExplorer",
    });
  }

  panels.push({
    id: "registry_continuity",
    headingKey: "field.context.record.registryContinuity.heading",
    ledeKey: "field.context.record.registryContinuity.lede",
    links: [
      {
        id: "verify",
        label: "",
        labelKey: "field.context.link.verify",
        href: fieldVerifyRecordHref(currentRegistryId),
      },
      {
        id: "ledger",
        label: "",
        labelKey: "field.context.link.ledger",
        href: registryLedgerHref(currentRegistryId),
      },
    ],
  });

  return panels;
}

export function buildCreativeRelationshipContextPanels(args: {
  gallery: CreativePresenceGallery | null;
  showOrganisationSection: boolean;
  practiceExplorerHref: string | null;
  primaryPracticeSlug: string | null;
}): FieldRelationshipContextPanelData[] {
  const panels: FieldRelationshipContextPanelData[] = [];

  if (args.showOrganisationSection && args.gallery?.href && args.gallery.name) {
    panels.push({
      id: "creative_organisation",
      headingKey: "field.context.creative.organisation.heading",
      ledeKey: "field.context.creative.organisation.lede",
      ledeParams: { name: args.gallery.name },
      links: [
        {
          id: args.gallery.slug || args.gallery.name,
          label: args.gallery.name,
          href: args.gallery.href,
          meta: args.gallery.verified ? "verified" : undefined,
        },
      ],
    });
  }

  if (args.practiceExplorerHref && args.primaryPracticeSlug) {
    const practice = practiceLabel(args.primaryPracticeSlug);
    panels.push({
      id: "creative_practice",
      headingKey: "field.context.creative.practice.heading",
      ledeKey: "field.context.creative.practice.lede",
      ledeParams: { practice },
      links: [
        {
          id: "practice-explorer",
          label: practice,
          href: args.practiceExplorerHref,
        },
      ],
      viewAllHref: args.practiceExplorerHref,
      viewAllLabelKey: "field.context.viewAllInExplorer",
    });
  }

  return panels;
}

export function buildOrganisationRelationshipContextPanels(args: {
  organisationName: string;
  representedCreatives: OrganisationPresenceCreative[];
  artworks: OrganisationPresenceArtwork[];
}): FieldRelationshipContextPanelData[] {
  const panels: FieldRelationshipContextPanelData[] = [];

  const rosterLinks = [...args.representedCreatives]
    .filter((creative) => Boolean(creative.href))
    .sort((a, b) => {
      if (a.verifiedWorkCount !== b.verifiedWorkCount) {
        return b.verifiedWorkCount - a.verifiedWorkCount;
      }
      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, FIELD_RELATIONSHIP_CONTEXT_MAX)
    .map((creative) => ({
      id: creative.id,
      label: creative.displayName,
      href: creative.href!,
      meta:
        creative.verifiedWorkCount > 0
          ? String(creative.verifiedWorkCount)
          : creative.totalWorkCount > 0
            ? String(creative.totalWorkCount)
            : undefined,
    }));

  if (rosterLinks.length > 0) {
    panels.push({
      id: "organisation_roster",
      headingKey: "field.context.organisation.roster.heading",
      ledeKey: "field.context.organisation.roster.lede",
      ledeParams: { name: args.organisationName },
      links: rosterLinks,
      viewAllHref:
        args.representedCreatives.length > FIELD_RELATIONSHIP_CONTEXT_MAX
          ? "#org-roster-heading"
          : undefined,
      viewAllLabelKey: "field.context.viewAllCreatives",
    });
  }

  const recordLinks = sortContextArtworks(args.artworks)
    .slice(0, FIELD_RELATIONSHIP_CONTEXT_MAX)
    .map((row) => ({
      id: row.id,
      label: recordTitle(row),
      href: fieldRecordHref(row.registry_id),
      meta: row.artistName || undefined,
    }));

  if (recordLinks.length > 0) {
    panels.push({
      id: "organisation_records",
      headingKey: "field.context.organisation.records.heading",
      ledeKey: "field.context.organisation.records.lede",
      ledeParams: { name: args.organisationName },
      links: recordLinks,
      viewAllHref:
        args.artworks.length > FIELD_RELATIONSHIP_CONTEXT_MAX
          ? "#org-footprint-heading"
          : undefined,
      viewAllLabelKey: "field.context.viewAllRecords",
    });
  }

  return panels;
}
