import type { SupabaseClient } from "@supabase/supabase-js";

import {
  FIELD_PROFILE_PAGE_SIZE,
  type CreativeExplorerSort,
  type CreativeExplorerVerifiedFilter,
} from "@/lib/field-creative-explorer-params";
import { fieldCreativeHref, fieldExplorerCreativesHref } from "@/lib/field-nav";
import { parsePublicPresence } from "@/lib/public-presence";
import {
  creativeMatchesPracticeFilter,
  inferRegistryPracticeSlugs,
  mergeCreativePracticeChips,
  parseDeclaredPracticeSlugs,
  type CreativePracticeChip,
} from "@/lib/practices";

export type CreativeExplorerRow = {
  id: string;
  slug: string;
  displayName: string;
  bioExcerpt: string | null;
  practices: CreativePracticeChip[];
  verifiedWorkCount: number;
  totalWorkCount: number;
  artistVerified: boolean;
  institutionLinked: boolean;
  institutionVerified: boolean;
  href: string;
};

type ArtistCandidate = {
  id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  verification_status: string | null;
  public_presence: unknown;
  galleries:
    | { verified: boolean | null }
    | { verified: boolean | null }[]
    | null;
};

type ArtworkStatRow = {
  artist_id: string;
  verification_status: string | null;
  medium: string | null;
};

function bioExcerpt(bio: string | null, max = 160): string | null {
  const trimmed = bio?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function resolveGalleryVerified(row: ArtistCandidate): {
  institutionLinked: boolean;
  institutionVerified: boolean;
} {
  const gallery = Array.isArray(row.galleries)
    ? row.galleries[0]
    : row.galleries;
  return {
    institutionLinked: Boolean(gallery),
    institutionVerified: Boolean(gallery?.verified),
  };
}

function aggregateArtworkStats(rows: ArtworkStatRow[]) {
  const byArtist = new Map<
    string,
    { verifiedCount: number; totalCount: number; verifiedMediums: string[] }
  >();

  for (const row of rows) {
    if (!row.artist_id) continue;
    const current = byArtist.get(row.artist_id) ?? {
      verifiedCount: 0,
      totalCount: 0,
      verifiedMediums: [],
    };
    current.totalCount += 1;
    if (row.verification_status === "verified") {
      current.verifiedCount += 1;
      if (row.medium?.trim()) {
        current.verifiedMediums.push(row.medium.trim());
      }
    }
    byArtist.set(row.artist_id, current);
  }

  return byArtist;
}

function sortRows(
  rows: CreativeExplorerRow[],
  sort: CreativeExplorerSort,
  recentByArtistId: Map<string, string>
) {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sort === "recent") {
      const aTs = recentByArtistId.get(a.id) ?? "";
      const bTs = recentByArtistId.get(b.id) ?? "";
      if (aTs !== bTs) return bTs.localeCompare(aTs);
    }
    const cmp = a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    });
    return sort === "name_desc" ? -cmp : cmp;
  });
  return copy;
}

export async function fetchCreativeExplorerList(
  supabase: SupabaseClient,
  args: {
    q: string;
    sort: CreativeExplorerSort;
    page: number;
    practice: string;
    verified: CreativeExplorerVerifiedFilter;
  }
): Promise<{ rows: CreativeExplorerRow[]; total: number; basePath: string }> {
  const basePath = fieldExplorerCreativesHref();

  let query = supabase
    .from("artists")
    .select(`
      id,
      slug,
      display_name,
      bio,
      verification_status,
      public_presence,
      galleries(
        verified
      )
    `);

  const term = args.q.trim().replace(/,/g, " ");
  if (term) {
    const p = `%${term}%`;
    query = query.or(`display_name.ilike.${p},bio.ilike.${p}`);
  }

  const { data: rawArtists, error } = await query;

  if (error) {
    console.error("[fetchCreativeExplorerList]", error.message);
    return { rows: [], total: 0, basePath };
  }

  const publicArtists = (rawArtists ?? []).filter((row) => {
    const presence = parsePublicPresence(
      (row as ArtistCandidate).public_presence
    );
    return presence.profile && (row as ArtistCandidate).slug?.trim();
  }) as ArtistCandidate[];

  if (publicArtists.length === 0) {
    return { rows: [], total: 0, basePath };
  }

  const artistIds = publicArtists.map((a) => a.id);

  const { data: artworkRows } = await supabase
    .from("artworks")
    .select("artist_id, verification_status, medium")
    .in("artist_id", artistIds);

  const statsByArtist = aggregateArtworkStats(
    (artworkRows ?? []) as ArtworkStatRow[]
  );

  let recentByArtistId = new Map<string, string>();
  if (args.sort === "recent") {
    const { data: actorRows } = await supabase
      .from("actor_profiles")
      .select("user_id, updated_at")
      .in("user_id", artistIds);
    recentByArtistId = new Map(
      (actorRows ?? []).map((r) => [
        String(r.user_id),
        String(r.updated_at ?? ""),
      ])
    );
  }

  let enriched: CreativeExplorerRow[] = publicArtists.map((artist) => {
    const stats = statsByArtist.get(artist.id) ?? {
      verifiedCount: 0,
      totalCount: 0,
      verifiedMediums: [],
    };
    const declared = parseDeclaredPracticeSlugs(artist.public_presence);
    const registry = inferRegistryPracticeSlugs(stats.verifiedMediums);
    const { institutionLinked, institutionVerified } =
      resolveGalleryVerified(artist);

    return {
      id: artist.id,
      slug: artist.slug,
      displayName: artist.display_name?.trim() || "Creative",
      bioExcerpt: bioExcerpt(artist.bio),
      practices: mergeCreativePracticeChips(declared, registry),
      verifiedWorkCount: stats.verifiedCount,
      totalWorkCount: stats.totalCount,
      artistVerified: artist.verification_status === "verified",
      institutionLinked,
      institutionVerified,
      href: fieldCreativeHref(artist.slug),
    };
  });

  if (args.practice) {
    enriched = enriched.filter((row) => {
      const declared = parseDeclaredPracticeSlugs(
        publicArtists.find((a) => a.id === row.id)?.public_presence
      );
      const stats = statsByArtist.get(row.id);
      const registry = inferRegistryPracticeSlugs(stats?.verifiedMediums ?? []);
      return creativeMatchesPracticeFilter(declared, registry, args.practice);
    });
  }

  if (args.verified === "verified") {
    enriched = enriched.filter(
      (row) => row.artistVerified || row.verifiedWorkCount > 0
    );
  }

  enriched = sortRows(enriched, args.sort, recentByArtistId);

  const total = enriched.length;
  const from = (args.page - 1) * FIELD_PROFILE_PAGE_SIZE;
  const rows = enriched.slice(from, from + FIELD_PROFILE_PAGE_SIZE);

  return { rows, total, basePath };
}
