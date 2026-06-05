import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchCertificatePublicStatusByArtworkIds } from "@/lib/fetch-certificate-public-status-map";
import {
  FIELD_PROFILE_PAGE_SIZE,
  type OrganisationExplorerRepresentedFilter,
  type OrganisationExplorerSort,
  type OrganisationExplorerVerifiedFilter,
} from "@/lib/field-organisation-explorer-params";
import { fieldExplorerOrganisationsHref, fieldOrganisationHref } from "@/lib/field-nav";
import { fieldSearchIlikePattern } from "@/lib/field-search-contract";
import { parsePublicPresence } from "@/lib/public-presence";

export type OrganisationExplorerRow = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  descriptionExcerpt: string | null;
  verified: boolean;
  representedCreativesCount: number;
  verifiedWorkCount: number;
  totalRecords: number;
  certificateCount: number;
  revokedCertificateCount: number;
  href: string;
};

type GalleryCandidate = {
  id: string;
  name: string | null;
  slug: string;
  location: string | null;
  description: string | null;
  verified: boolean;
  public_presence: unknown;
  created_at: string;
};

type ArtistLinkRow = {
  id: string;
  gallery_id: string | null;
  shown_on_institutional_public?: boolean | null;
};

type ArtworkStatRow = {
  id: string;
  artist_id: string | null;
  verification_status: string | null;
};

type GalleryStats = {
  representedCreativesCount: number;
  verifiedWorkCount: number;
  totalRecords: number;
  certificateCount: number;
  revokedCertificateCount: number;
};

function descriptionExcerpt(description: string | null, max = 160): string | null {
  const trimmed = description?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function emptyStats(): GalleryStats {
  return {
    representedCreativesCount: 0,
    verifiedWorkCount: 0,
    totalRecords: 0,
    certificateCount: 0,
    revokedCertificateCount: 0,
  };
}

function sortRows(
  rows: OrganisationExplorerRow[],
  sort: OrganisationExplorerSort,
  recentByGalleryId: Map<string, string>
) {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sort === "recent") {
      const aTs = recentByGalleryId.get(a.id) ?? "";
      const bTs = recentByGalleryId.get(b.id) ?? "";
      if (aTs !== bTs) return bTs.localeCompare(aTs);
    }
    const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    return sort === "name_desc" ? -cmp : cmp;
  });
  return copy;
}

export async function fetchOrganisationExplorerList(
  supabase: SupabaseClient,
  args: {
    q: string;
    sort: OrganisationExplorerSort;
    page: number;
    location: string;
    verified: OrganisationExplorerVerifiedFilter;
    represented: OrganisationExplorerRepresentedFilter;
  }
): Promise<{ rows: OrganisationExplorerRow[]; total: number; basePath: string }> {
  const basePath = fieldExplorerOrganisationsHref();

  let query = supabase
    .from("galleries")
    .select(
      "id, name, slug, location, description, verified, public_presence, created_at"
    );

  const ilikePattern = fieldSearchIlikePattern(args.q);
  if (ilikePattern) {
    query = query.or(
      `name.ilike.${ilikePattern},description.ilike.${ilikePattern},location.ilike.${ilikePattern}`
    );
  }

  const { data: rawGalleries, error } = await query;

  if (error) {
    console.error("[fetchOrganisationExplorerList]", error.message);
    return { rows: [], total: 0, basePath };
  }

  const publicGalleries = (rawGalleries ?? []).filter((row) => {
    const candidate = row as GalleryCandidate;
    const presence = parsePublicPresence(candidate.public_presence);
    return presence.profile && candidate.slug?.trim();
  }) as GalleryCandidate[];

  if (publicGalleries.length === 0) {
    return { rows: [], total: 0, basePath };
  }

  const galleryIds = publicGalleries.map((gallery) => gallery.id);

  const { data: artistRows } = await supabase
    .from("artists")
    .select("id, gallery_id, shown_on_institutional_public")
    .in("gallery_id", galleryIds);

  const artists = (artistRows ?? []) as ArtistLinkRow[];
  const artistIds = artists.map((artist) => artist.id).filter(Boolean);
  const galleryIdByArtistId = new Map<string, string>();

  const representedByGallery = new Map<string, number>();
  for (const artist of artists) {
    if (!artist.gallery_id) continue;
    galleryIdByArtistId.set(artist.id, artist.gallery_id);
    if (artist.shown_on_institutional_public) {
      representedByGallery.set(
        artist.gallery_id,
        (representedByGallery.get(artist.gallery_id) ?? 0) + 1
      );
    }
  }

  const statsByGallery = new Map<string, GalleryStats>(
    galleryIds.map((id) => [id, emptyStats()])
  );

  for (const [galleryId, count] of representedByGallery) {
    const stats = statsByGallery.get(galleryId) ?? emptyStats();
    stats.representedCreativesCount = count;
    statsByGallery.set(galleryId, stats);
  }

  let artworkRows: ArtworkStatRow[] = [];
  if (artistIds.length > 0) {
    const { data: artworks } = await supabase
      .from("artworks")
      .select("id, artist_id, verification_status")
      .in("artist_id", artistIds);

    artworkRows = (artworks ?? []) as ArtworkStatRow[];
  }

  const artworkIds: string[] = [];
  for (const artwork of artworkRows) {
    if (!artwork.artist_id) continue;
    const galleryId = galleryIdByArtistId.get(artwork.artist_id);
    if (!galleryId) continue;

    const stats = statsByGallery.get(galleryId) ?? emptyStats();
    stats.totalRecords += 1;
    if (artwork.verification_status === "verified") {
      stats.verifiedWorkCount += 1;
    }
    statsByGallery.set(galleryId, stats);
    artworkIds.push(artwork.id);
  }

  const certificateMap = await fetchCertificatePublicStatusByArtworkIds(
    supabase,
    artworkIds
  );

  for (const artwork of artworkRows) {
    const cert = certificateMap.get(artwork.id);
    if (!cert || !artwork.artist_id) continue;
    const galleryId = galleryIdByArtistId.get(artwork.artist_id);
    if (!galleryId) continue;

    const stats = statsByGallery.get(galleryId) ?? emptyStats();
    stats.certificateCount += 1;
    if (cert.revoked) stats.revokedCertificateCount += 1;
    statsByGallery.set(galleryId, stats);
  }

  const recentByGalleryId = new Map(
    publicGalleries.map((gallery) => [gallery.id, gallery.created_at ?? ""])
  );

  const locationTerm = args.location.trim().toLowerCase();

  let enriched: OrganisationExplorerRow[] = publicGalleries.map((gallery) => {
    const presence = parsePublicPresence(gallery.public_presence);
    const stats = statsByGallery.get(gallery.id) ?? emptyStats();
    const locationLine =
      presence.location && gallery.location?.trim() ? gallery.location.trim() : null;

    return {
      id: gallery.id,
      slug: gallery.slug,
      name: gallery.name?.trim() || "Organisation",
      location: locationLine,
      descriptionExcerpt:
        presence.values && gallery.description?.trim()
          ? descriptionExcerpt(gallery.description)
          : null,
      verified: Boolean(gallery.verified),
      representedCreativesCount: stats.representedCreativesCount,
      verifiedWorkCount: stats.verifiedWorkCount,
      totalRecords: stats.totalRecords,
      certificateCount: stats.certificateCount,
      revokedCertificateCount: stats.revokedCertificateCount,
      href: fieldOrganisationHref(gallery.slug),
    };
  });

  if (args.verified === "verified") {
    enriched = enriched.filter((row) => row.verified);
  }

  if (args.represented === "represented") {
    enriched = enriched.filter((row) => row.representedCreativesCount > 0);
  }

  if (locationTerm) {
    enriched = enriched.filter((row) =>
      (row.location ?? "").toLowerCase().includes(locationTerm)
    );
  }

  enriched = sortRows(enriched, args.sort, recentByGalleryId);

  const total = enriched.length;
  const from = (args.page - 1) * FIELD_PROFILE_PAGE_SIZE;
  const rows = enriched.slice(from, from + FIELD_PROFILE_PAGE_SIZE);

  return { rows, total, basePath };
}
