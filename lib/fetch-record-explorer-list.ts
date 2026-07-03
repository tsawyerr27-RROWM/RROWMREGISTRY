import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchCertificatePublicStatusByArtworkIds } from "@/lib/fetch-certificate-public-status-map";
import {
  FIELD_RECORD_EXPLORER_PAGE_SIZE,
  type RecordExplorerCertificateFilter,
  type RecordExplorerSort,
  type RecordExplorerTrustFilter,
} from "@/lib/field-record-explorer-params";
import {
  isInstitutionallyVerified,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import {
  fieldCreativeHref,
  fieldExplorerRecordsHref,
  fieldOrganisationHref,
  fieldRecordHref,
} from "@/lib/field-nav";
import { fieldSearchIlikePattern } from "@/lib/field-search-contract";
import { parsePublicPresence } from "@/lib/public-presence";
import {
  creativeMatchesPracticeFilter,
  inferRegistryPracticeSlugs,
  mergeCreativePracticeChips,
  parseDeclaredPracticeSlugs,
  type CreativePracticeChip,
} from "@/lib/practices";
import { isPracticeSlug } from "@/lib/practice-types";

export type RecordExplorerRow = {
  id: string;
  registry_id: string;
  title: string | null;
  image_url: string | null;
  created_at: string;
  year: number | null;
  medium: string | null;
  recordVerified: boolean;
  trustTier: ReturnType<typeof parseArtworkTrustTier>;
  artistConfirmationOnFile: boolean;
  organisationVerified: boolean;
  organisationName: string | null;
  organisationHref: string | null;
  artistName: string | null;
  creativeHref: string | null;
  hasCertificate: boolean;
  certificateRevoked: boolean;
  practices: CreativePracticeChip[];
  href: string;
};

type ArtworkCandidate = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  created_at: string;
  year: number | null;
  medium: string | null;
  verification_status: string | null;
  filing_gallery_id: string | null;
  artist_id: string | null;
  artists:
    | {
        id: string;
        display_name: string | null;
        full_name: string | null;
        slug: string | null;
        verification_status: string | null;
        public_presence?: unknown;
        gallery_id: string | null;
        galleries:
          | {
              slug: string | null;
              name: string | null;
              verified: boolean | null;
              public_presence?: unknown;
            }
          | {
              slug: string | null;
              name: string | null;
              verified: boolean | null;
              public_presence?: unknown;
            }[]
          | null;
      }
    | {
        id: string;
        display_name: string | null;
        full_name: string | null;
        slug: string | null;
        verification_status: string | null;
        public_presence?: unknown;
        gallery_id: string | null;
        galleries:
          | {
              slug: string | null;
              name: string | null;
              verified: boolean | null;
              public_presence?: unknown;
            }
          | {
              slug: string | null;
              name: string | null;
              verified: boolean | null;
              public_presence?: unknown;
            }[]
          | null;
      }[]
    | null;
};

type GalleryRow = {
  id: string;
  slug: string | null;
  name: string | null;
  verified: boolean | null;
  public_presence?: unknown;
};

function resolveArtist(row: ArtworkCandidate) {
  return Array.isArray(row.artists) ? row.artists[0] : row.artists;
}

function resolveRepresentationGallery(artist: NonNullable<ReturnType<typeof resolveArtist>>) {
  const raw = Array.isArray(artist.galleries)
    ? artist.galleries[0]
    : artist.galleries;
  return raw ?? null;
}

function organisationHrefFromGallery(gallery: GalleryRow | null): string | null {
  if (!gallery?.slug?.trim()) return null;
  const presence = parsePublicPresence(gallery.public_presence);
  return presence.profile ? fieldOrganisationHref(gallery.slug) : null;
}

function creativeHrefFromArtist(
  artist: NonNullable<ReturnType<typeof resolveArtist>>
): string | null {
  const slug = artist.slug?.trim();
  if (!slug) return null;
  const presence = parsePublicPresence(artist.public_presence);
  return presence.profile ? fieldCreativeHref(slug) : null;
}

function sortRows(rows: RecordExplorerRow[], sort: RecordExplorerSort) {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sort === "recent" || sort === "oldest") {
      const cmp = a.created_at.localeCompare(b.created_at);
      return sort === "oldest" ? cmp : -cmp;
    }
    const titleA = (a.title || a.registry_id).trim();
    const titleB = (b.title || b.registry_id).trim();
    const cmp = titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
    return sort === "title_desc" ? -cmp : cmp;
  });
  return copy;
}

export async function fetchRecordExplorerList(
  supabase: SupabaseClient,
  args: {
    q: string;
    sort: RecordExplorerSort;
    page: number;
    creative: string;
    organisation: string;
    practice: string;
    trust: RecordExplorerTrustFilter;
    certificate: RecordExplorerCertificateFilter;
  }
): Promise<{ rows: RecordExplorerRow[]; total: number; basePath: string }> {
  const basePath = fieldExplorerRecordsHref();

  let filingGalleryId: string | null = null;
  if (args.organisation) {
    const { data: orgRow } = await supabase
      .from("galleries")
      .select("id")
      .eq("slug", args.organisation)
      .maybeSingle<{ id: string }>();
    filingGalleryId = orgRow?.id ?? null;
  }

  let artistIdFilter: string | null = null;
  if (args.creative) {
    const { data: artistRow } = await supabase
      .from("artists")
      .select("id")
      .eq("slug", args.creative)
      .maybeSingle<{ id: string }>();
    artistIdFilter = artistRow?.id ?? null;
    if (!artistIdFilter) {
      return { rows: [], total: 0, basePath };
    }
  }

  let query = supabase.from("artworks").select(`
      id,
      title,
      registry_id,
      image_url,
      created_at,
      year,
      medium,
      verification_status,
      filing_gallery_id,
      artist_id,
      artists!artworks_artist_id_fkey(
        id,
        display_name,
        full_name,
        slug,
        verification_status,
        public_presence,
        gallery_id,
        galleries(
          slug,
          name,
          verified,
          public_presence
        )
      )
    `);

  const term = args.q.trim();
  const ilikePattern = fieldSearchIlikePattern(term);
  let candidates: ArtworkCandidate[] = [];

  if (ilikePattern) {
    let titleQuery = query;
    if (artistIdFilter) {
      titleQuery = titleQuery.eq("artist_id", artistIdFilter);
    }
    titleQuery = titleQuery.or(
      `title.ilike.${ilikePattern},registry_id.ilike.${ilikePattern}`
    );

    const { data: titleRows, error: titleError } = await titleQuery;
    if (titleError) {
      console.error("[fetchRecordExplorerList]", titleError.message);
      return { rows: [], total: 0, basePath };
    }

    const byId = new Map<string, ArtworkCandidate>();
    for (const row of (titleRows ?? []) as ArtworkCandidate[]) {
      byId.set(row.id, row);
    }

    let artistQuery = supabase
      .from("artists")
      .select("id")
      .or(`display_name.ilike.${ilikePattern},full_name.ilike.${ilikePattern}`);

    if (artistIdFilter) {
      artistQuery = artistQuery.eq("id", artistIdFilter);
    }

    const { data: artistMatches } = await artistQuery;
    const matchedArtistIds = (artistMatches ?? []).map((row) => row.id).filter(Boolean);

    if (matchedArtistIds.length > 0) {
      let artworkByArtistQuery = supabase.from("artworks").select(`
          id,
          title,
          registry_id,
          image_url,
          created_at,
          year,
          medium,
          verification_status,
          filing_gallery_id,
          artist_id,
          artists!artworks_artist_id_fkey(
            id,
            display_name,
            full_name,
            slug,
            verification_status,
            public_presence,
            gallery_id,
            galleries(
              slug,
              name,
              verified,
              public_presence
            )
          )
        `)
        .in("artist_id", matchedArtistIds);

      if (artistIdFilter) {
        artworkByArtistQuery = artworkByArtistQuery.eq("artist_id", artistIdFilter);
      }

      const { data: artistArtworkRows, error: artistArtworkError } =
        await artworkByArtistQuery;

      if (artistArtworkError) {
        console.error("[fetchRecordExplorerList]", artistArtworkError.message);
      } else {
        for (const row of (artistArtworkRows ?? []) as ArtworkCandidate[]) {
          byId.set(row.id, row);
        }
      }
    }

    candidates = [...byId.values()];
  } else {
    if (artistIdFilter) {
      query = query.eq("artist_id", artistIdFilter);
    }

    const { data: rawRows, error } = await query;

    if (error) {
      console.error("[fetchRecordExplorerList]", error.message);
      return { rows: [], total: 0, basePath };
    }

    candidates = (rawRows ?? []) as ArtworkCandidate[];
  }

  if (candidates.length === 0) {
    return { rows: [], total: 0, basePath };
  }

  const filingGalleryIds = [
    ...new Set(
      candidates
        .map((row) => row.filing_gallery_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const filingGalleryById = new Map<string, GalleryRow>();
  if (filingGalleryIds.length > 0) {
    const { data: filingRows } = await supabase
      .from("galleries")
      .select("id, slug, name, verified, public_presence")
      .in("id", filingGalleryIds)
      .returns<GalleryRow[]>();

    for (const gallery of filingRows ?? []) {
      filingGalleryById.set(gallery.id, gallery);
    }
  }

  const artworkIds = candidates.map((row) => row.id);
  const certificateMap = await fetchCertificatePublicStatusByArtworkIds(
    supabase,
    artworkIds
  );

  const practiceFilter = args.practice && isPracticeSlug(args.practice)
    ? args.practice
    : "";

  let enriched: RecordExplorerRow[] = candidates.map((row) => {
    const artist = resolveArtist(row);
    const repGallery = artist ? resolveRepresentationGallery(artist) : null;
    const filingGallery = row.filing_gallery_id
      ? filingGalleryById.get(row.filing_gallery_id) ?? null
      : null;

    const organisationGallery = filingGallery ?? repGallery;
    const organisationName =
      organisationGallery?.name?.trim() ||
      (filingGallery ? filingGallery.name?.trim() : null) ||
      (repGallery ? repGallery.name?.trim() : null) ||
      null;

    const organisationVerified = Boolean(
      filingGallery?.verified ?? repGallery?.verified
    );

    const orgHref = filingGallery
      ? organisationHrefFromGallery(filingGallery)
      : organisationHrefFromGallery(
          repGallery
            ? {
                id: artist?.gallery_id ?? "",
                slug: repGallery.slug,
                name: repGallery.name,
                verified: repGallery.verified,
                public_presence: repGallery.public_presence,
              }
            : null
        );

    const artistName =
      artist?.display_name?.trim() ||
      artist?.full_name?.trim() ||
      null;

    const recordVerified = isInstitutionallyVerified(row.verification_status);
    const trustTier = parseArtworkTrustTier(row.verification_status);
    const cert = certificateMap.get(row.id);
    const hasCertificate = Boolean(cert);
    const certificateRevoked = Boolean(cert?.revoked);

    const declared = parseDeclaredPracticeSlugs(artist?.public_presence);
    const registrySlugs = inferRegistryPracticeSlugs(
      row.medium?.trim() ? [row.medium.trim()] : []
    );
    const practices = mergeCreativePracticeChips(declared, registrySlugs);

    return {
      id: row.id,
      registry_id: row.registry_id,
      title: row.title,
      image_url: row.image_url,
      created_at: row.created_at,
      year: row.year,
      medium: row.medium,
      recordVerified,
      trustTier,
      artistConfirmationOnFile:
        trustTier === "self_attested" ||
        recordVerified ||
        artist?.verification_status === "verified",
      organisationVerified,
      organisationName,
      organisationHref: orgHref,
      artistName,
      creativeHref: artist ? creativeHrefFromArtist(artist) : null,
      hasCertificate,
      certificateRevoked,
      practices,
      href: fieldRecordHref(row.registry_id),
    };
  });

  if (args.organisation) {
    if (!filingGalleryId) {
      enriched = [];
    } else {
      enriched = enriched.filter((row) => {
        const candidate = candidates.find((c) => c.id === row.id);
        if (!candidate) return false;
        if (candidate.filing_gallery_id === filingGalleryId) return true;
        const artist = resolveArtist(candidate);
        return artist?.gallery_id === filingGalleryId;
      });
    }
  }

  if (args.trust !== "all") {
    enriched = enriched.filter((row) => row.trustTier === args.trust);
  }

  if (args.certificate === "present") {
    enriched = enriched.filter((row) => row.hasCertificate);
  }

  if (practiceFilter) {
    enriched = enriched.filter((row) => {
      const candidate = candidates.find((c) => c.id === row.id);
      const artist = candidate ? resolveArtist(candidate) : null;
      const declared = parseDeclaredPracticeSlugs(artist?.public_presence);
      const registrySlugs = inferRegistryPracticeSlugs(
        candidate?.medium?.trim() ? [candidate.medium.trim()] : []
      );
      return creativeMatchesPracticeFilter(
        declared,
        registrySlugs,
        practiceFilter
      );
    });
  }

  enriched = sortRows(enriched, args.sort);

  const total = enriched.length;
  const from = (args.page - 1) * FIELD_RECORD_EXPLORER_PAGE_SIZE;
  const rows = enriched.slice(from, from + FIELD_RECORD_EXPLORER_PAGE_SIZE);

  return { rows, total, basePath };
}
