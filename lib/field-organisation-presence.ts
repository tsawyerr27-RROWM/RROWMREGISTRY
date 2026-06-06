import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchCertificatePublicStatusByArtworkIds } from "@/lib/fetch-certificate-public-status-map";
import { fieldCreativeHref } from "@/lib/field-nav";
import {
  buildOrganisationRelationshipContextPanels,
  type FieldRelationshipContextPanelData,
} from "@/lib/field-relationship-context";
import type { MessageKey } from "@/lib/locale-messages";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import { parsePublicPresence } from "@/lib/public-presence";
import { REPRESENTATION_PHRASES } from "@/lib/representation-language";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type OrganisationPresenceCreative = {
  id: string;
  displayName: string;
  slug: string | null;
  href: string | null;
  artistVerified: boolean;
  verifiedWorkCount: number;
  totalWorkCount: number;
};

export type OrganisationPresenceArtwork = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  artist_id: string | null;
  artistName: string | null;
  verification_status: string | null;
  created_at: string;
  hasCertificate: boolean;
  certificateRevoked: boolean;
};

export type OrganisationPresenceFootprint = {
  totalRecords: number;
  verifiedRecords: number;
  certificateCount: number;
  revokedCertificateCount: number;
};

export type OrganisationPresencePageData = {
  organisation: {
    id: string;
    slug: string;
    name: string;
    location: string | null;
    description: string | null;
    websiteHref: string | null;
    verified: boolean;
  };
  showRoster: boolean;
  showLocation: boolean;
  showDescription: boolean;
  participationLayers: ParticipationLayer[];
  representedCreatives: OrganisationPresenceCreative[];
  artworks: OrganisationPresenceArtwork[];
  footprint: OrganisationPresenceFootprint;
  isProfileOwner: boolean;
  stewardshipItems: Array<{ id: string; labelKey: MessageKey; complete: boolean }>;
  contextPanels: FieldRelationshipContextPanelData[];
};

type GalleryRow = {
  id: string;
  name: string | null;
  slug: string;
  location: string | null;
  description: string | null;
  website_url: string | null;
  verified: boolean;
  public_presence?: unknown;
};

type ArtistRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  slug: string | null;
  verification_status: string | null;
  public_presence?: unknown;
  shown_on_institutional_public?: boolean | null;
};

type ArtworkRow = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  artist_id: string | null;
  verification_status: string | null;
  created_at: string;
};

function resolveWebsiteHref(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function buildOrganisationParticipationLayers(
  verified: boolean,
  footprint: OrganisationPresenceFootprint
): ParticipationLayer[] {
  const layers: ParticipationLayer[] = [];

  if (verified) {
    layers.push({
      id: "organisation_verified",
      label: REPRESENTATION_PHRASES.representationOnFile,
      state: "on_file",
    });
  } else {
    layers.push({
      id: "organisation_participant",
      label: REPRESENTATION_PHRASES.institutionLinkedContinuity,
      state: "on_file",
    });
  }

  if (footprint.verifiedRecords > 0) {
    layers.push({
      id: "verified_works",
      label: `${footprint.verifiedRecords} verified ${
        footprint.verifiedRecords === 1 ? "work" : "works"
      } on file`,
      state: "on_file",
    });
  }

  if (footprint.certificateCount > 0) {
    layers.push({
      id: "certificates",
      label: `${footprint.certificateCount} ${
        footprint.certificateCount === 1 ? "certificate" : "certificates"
      } recorded on file`,
      state: footprint.revokedCertificateCount > 0 ? "neutral" : "on_file",
    });
  }

  return layers;
}

export async function loadOrganisationPresencePageData(
  supabase: SupabaseClient,
  slug: string,
  sessionUserId?: string | null
): Promise<OrganisationPresencePageData | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data: galleryRaw, error: galleryError } = await supabase
    .from("galleries")
    .select(
      "id, name, slug, location, description, website_url, verified, public_presence"
    )
    .eq("slug", clean)
    .maybeSingle();

  if (galleryError) warnSupabaseRpc("field organisation gallery", galleryError);
  if (!galleryRaw) return null;

  const gallery = galleryRaw as GalleryRow;
  const presence = parsePublicPresence(gallery.public_presence);
  if (!presence.profile) return null;

  const displayName = gallery.name?.trim() || "Organisation";

  const { data: artistRows, error: artistsError } = await supabase
    .from("artists")
    .select(
      "id, display_name, full_name, slug, verification_status, public_presence, shown_on_institutional_public"
    )
    .eq("gallery_id", gallery.id)
    .returns<ArtistRow[]>();

  if (artistsError) warnSupabaseRpc("field organisation artists", artistsError);

  const allArtists = artistRows || [];
  const artistNameById: Record<string, string> = {};
  for (const artist of allArtists) {
    artistNameById[artist.id] =
      artist.display_name?.trim() || artist.full_name?.trim() || "Creative";
  }

  const representedCreatives: OrganisationPresenceCreative[] = presence.ownership
    ? allArtists
        .filter((artist) => Boolean(artist.shown_on_institutional_public))
        .map((artist) => {
          const artistPresence = parsePublicPresence(artist.public_presence);
          const artistSlug = artist.slug?.trim() || null;
          const profilePublic = artistPresence.profile && Boolean(artistSlug);

          return {
            id: artist.id,
            displayName: artistNameById[artist.id],
            slug: artistSlug,
            href: profilePublic && artistSlug ? fieldCreativeHref(artistSlug) : null,
            artistVerified: artist.verification_status === "verified",
            verifiedWorkCount: 0,
            totalWorkCount: 0,
          };
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
    : [];

  const artistIds = allArtists.map((artist) => artist.id).filter(Boolean);
  let artworkRows: ArtworkRow[] = [];

  if (artistIds.length > 0) {
    const { data: artworks, error: artworksError } = await supabase
      .from("artwork_read_model")
      .select(
        "id, title, registry_id, image_url, artist_id, verification_status, created_at"
      )
      .in("artist_id", artistIds)
      .order("created_at", { ascending: false })
      .returns<ArtworkRow[]>();

    if (artworksError) warnSupabaseRpc("field organisation artworks", artworksError);
    artworkRows = (artworks || []).filter((row) => Boolean(row.registry_id?.trim()));
  }

  const artworkIds = artworkRows.map((row) => row.id);
  const certificateMap = await fetchCertificatePublicStatusByArtworkIds(
    supabase,
    artworkIds
  );

  let certificateCount = 0;
  let revokedCertificateCount = 0;

  const artworks: OrganisationPresenceArtwork[] = artworkRows.map((row) => {
    const cert = certificateMap.get(row.id);
    const hasCertificate = Boolean(cert);
    const certificateRevoked = Boolean(cert?.revoked);

    if (hasCertificate) {
      certificateCount += 1;
      if (certificateRevoked) revokedCertificateCount += 1;
    }

    return {
      id: row.id,
      title: row.title,
      registry_id: row.registry_id!.trim(),
      image_url: row.image_url,
      artist_id: row.artist_id,
      artistName:
        (row.artist_id && artistNameById[row.artist_id]) || null,
      verification_status: row.verification_status,
      created_at: row.created_at,
      hasCertificate,
      certificateRevoked,
    };
  });

  const verifiedRecords = artworks.filter(
    (row) => String(row.verification_status || "").toLowerCase() === "verified"
  ).length;

  const worksByArtist = new Map<string, { verified: number; total: number }>();
  for (const row of artworks) {
    if (!row.artist_id) continue;
    const current = worksByArtist.get(row.artist_id) ?? { verified: 0, total: 0 };
    current.total += 1;
    if (String(row.verification_status || "").toLowerCase() === "verified") {
      current.verified += 1;
    }
    worksByArtist.set(row.artist_id, current);
  }

  for (const creative of representedCreatives) {
    const stats = worksByArtist.get(creative.id);
    creative.verifiedWorkCount = stats?.verified ?? 0;
    creative.totalWorkCount = stats?.total ?? 0;
  }

  const footprint: OrganisationPresenceFootprint = {
    totalRecords: artworks.length,
    verifiedRecords,
    certificateCount,
    revokedCertificateCount,
  };

  const locationLine =
    presence.location && gallery.location?.trim() ? gallery.location.trim() : null;

  const description =
    presence.values && gallery.description?.trim()
      ? gallery.description.trim()
      : null;

  let isProfileOwner = false;
  if (sessionUserId) {
    const { data: membership } = await supabase
      .from("gallery_users")
      .select("user_id")
      .eq("gallery_id", gallery.id)
      .eq("user_id", sessionUserId)
      .maybeSingle();
    isProfileOwner = Boolean(membership);
  }

  const stewardshipItems: OrganisationPresencePageData["stewardshipItems"] =
    isProfileOwner
      ? [
          {
            id: "description",
            labelKey: "field.organisation.stewardship.item.description",
            complete: Boolean(description),
          },
          {
            id: "location",
            labelKey: "field.organisation.stewardship.item.location",
            complete: Boolean(locationLine),
          },
          {
            id: "website",
            labelKey: "field.organisation.stewardship.item.website",
            complete: Boolean(resolveWebsiteHref(gallery.website_url)),
          },
          {
            id: "roster",
            labelKey: "field.organisation.stewardship.item.roster",
            complete: representedCreatives.length > 0,
          },
          {
            id: "verified_works",
            labelKey: "field.organisation.stewardship.item.verifiedWorks",
            complete: footprint.verifiedRecords > 0,
          },
        ]
      : [];

  return {
    organisation: {
      id: gallery.id,
      slug: gallery.slug,
      name: displayName,
      location: locationLine,
      description,
      websiteHref: resolveWebsiteHref(gallery.website_url),
      verified: Boolean(gallery.verified),
    },
    showRoster: presence.ownership,
    showLocation: presence.location,
    showDescription: presence.values,
    participationLayers: buildOrganisationParticipationLayers(
      Boolean(gallery.verified),
      footprint
    ),
    representedCreatives,
    artworks,
    footprint,
    isProfileOwner,
    stewardshipItems,
    contextPanels: buildOrganisationRelationshipContextPanels({
      organisationName: displayName,
      representedCreatives,
      artworks,
    }),
  };
}

export async function loadOrganisationPresenceMetadata(
  supabase: SupabaseClient,
  slug: string
): Promise<{ name: string; description: string | null; indexable: boolean } | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data } = await supabase
    .from("galleries")
    .select("name, description, public_presence")
    .eq("slug", clean)
    .maybeSingle<{
      name: string | null;
      description: string | null;
      public_presence?: unknown;
    }>();

  if (!data) return null;

  const presence = parsePublicPresence(data.public_presence);
  return {
    name: data.name?.trim() || "Organisation",
    description: data.description,
    indexable: presence.profile,
  };
}
