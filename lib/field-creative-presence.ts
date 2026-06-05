import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchArtistArtworkList } from "@/lib/fetch-artist-artwork-list";
import type { ParticipationLayer } from "@/lib/get-artwork-participation-layers";
import type { CreativePracticeChip } from "@/lib/practices";
import { parsePublicPresence } from "@/lib/public-presence";
import { parseArtistRepresentationState } from "@/lib/artwork-representation";
import {
  REGISTRY_FILTER_LABELS,
  REPRESENTATION_PHRASES,
  representationStatusPublicLabel,
} from "@/lib/representation-language";
import {
  parseListParams,
  type ArtworkStatusFilter,
  type RegistrySort,
} from "@/lib/registry-list-params";
import { fieldCreativeHref, fieldOrganisationHref } from "@/lib/field-nav";
import { loadCreativePracticeChips } from "@/lib/practices";

export type CreativePresenceGallery = {
  name: string;
  verified: boolean;
  slug: string | null;
  profilePublic: boolean;
  href: string | null;
};

export type CreativePresenceArtwork = {
  id: string;
  title: string | null;
  registry_id: string;
  image_url: string | null;
  verification_status: string | null;
  year: number | null;
  medium: string | null;
};

export type CreativePresencePageData = {
  artist: {
    id: string;
    slug: string;
    display_name: string;
    bio: string | null;
    website: string | null;
    instagram: string | null;
    verification_status: string | null;
  };
  gallery: CreativePresenceGallery | null;
  participationLayers: ParticipationLayer[];
  artworks: CreativePresenceArtwork[];
  total: number;
  verifiedWorkCount: number;
  basePath: string;
  q: string;
  sort: RegistrySort;
  page: number;
  status: ArtworkStatusFilter;
  formKey: string;
  filterHint: string | null;
  showOrganisationSection: boolean;
  practices: CreativePracticeChip[];
};

type ArtistRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  website: string | null;
  instagram: string | null;
  verification_status: string | null;
  public_presence?: unknown;
  galleries:
    | {
        name: string | null;
        verified: boolean | null;
        slug: string | null;
        public_presence?: unknown;
      }
    | {
        name: string | null;
        verified: boolean | null;
        slug: string | null;
        public_presence?: unknown;
      }[]
    | null;
};

function resolveGallery(row: ArtistRow): CreativePresenceGallery | null {
  const raw = Array.isArray(row.galleries) ? row.galleries[0] : row.galleries;
  if (!raw?.name) return null;

  const orgPresence = parsePublicPresence(raw.public_presence);
  const slug = raw.slug?.trim() || null;
  const profilePublic = orgPresence.profile && Boolean(slug);

  return {
    name: raw.name.trim(),
    verified: Boolean(raw.verified),
    slug,
    profilePublic,
    href: profilePublic && slug ? fieldOrganisationHref(slug) : null,
  };
}

function buildParticipationLayers(
  gallery: CreativePresenceGallery | null,
  repState: ReturnType<typeof parseArtistRepresentationState>,
  artistVerificationStatus: string | null
): ParticipationLayer[] {
  const layers: ParticipationLayer[] = [];

  if (gallery && repState.historical) {
    layers.push({
      id: "historical_representation",
      label: representationStatusPublicLabel("representation_ended"),
      state: "neutral",
    });
  } else if (gallery && (repState.active || repState.represented_by_gallery)) {
    layers.push({
      id: "representation",
      label: gallery.verified
        ? REPRESENTATION_PHRASES.representationOnFile
        : REPRESENTATION_PHRASES.institutionLinkedContinuity,
      state: "on_file",
    });
  } else if (gallery) {
    layers.push({
      id: "representation",
      label: REPRESENTATION_PHRASES.institutionLinkedContinuity,
      state: "on_file",
    });
  }

  if (artistVerificationStatus === "verified") {
    layers.push({
      id: "artist",
      label: REPRESENTATION_PHRASES.artistConfirmationOnFile,
      state: "on_file",
    });
  }

  return layers;
}

export async function loadCreativePresencePageData(
  supabase: SupabaseClient,
  args: {
    slug: string;
    searchParams: Record<string, string | string[] | undefined>;
  }
): Promise<CreativePresencePageData | null> {
  const slugParam = args.slug.trim();
  if (!slugParam) return null;

  const { q, sort, page, status } = parseListParams(args.searchParams);

  const { data: artistRaw } = await supabase
    .from("artists")
    .select(`
      id,
      slug,
      display_name,
      bio,
      website,
      instagram,
      verification_status,
      public_presence,
      galleries(
        name,
        verified,
        slug,
        public_presence
      )
    `)
    .eq("slug", slugParam)
    .maybeSingle();

  if (!artistRaw) return null;

  const artist = artistRaw as ArtistRow;
  const presence = parsePublicPresence(artist.public_presence);
  if (!presence.profile) return null;

  const gallery = resolveGallery(artist);

  const { artworks, total } = await fetchArtistArtworkList(supabase, {
    artistId: artist.id,
    q,
    sort: sort as RegistrySort,
    page,
    status: status as ArtworkStatusFilter,
  });

  const { count: verifiedWorkCount } = await supabase
    .from("artworks")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artist.id)
    .eq("verification_status", "verified");

  const { data: repStateRaw } = await supabase.rpc(
    "get_artist_representation_state",
    { p_artist_id: artist.id }
  );
  const repState = parseArtistRepresentationState(repStateRaw);

  const participationLayers = buildParticipationLayers(
    gallery,
    repState,
    artist.verification_status
  );

  const practices = await loadCreativePracticeChips(
    supabase,
    artist.id,
    artist.public_presence
  );

  const filterHint =
    status === "verified"
      ? REGISTRY_FILTER_LABELS.verifiedOnly
      : status === "pending"
        ? REGISTRY_FILTER_LABELS.participationPending
        : null;

  return {
    artist: {
      id: artist.id,
      slug: artist.slug,
      display_name: artist.display_name,
      bio: artist.bio,
      website: artist.website,
      instagram: artist.instagram,
      verification_status: artist.verification_status,
    },
    gallery,
    participationLayers,
    artworks: artworks as CreativePresenceArtwork[],
    total,
    verifiedWorkCount: verifiedWorkCount ?? 0,
    basePath: fieldCreativeHref(artist.slug),
    q,
    sort: sort as RegistrySort,
    page,
    status: status as ArtworkStatusFilter,
    formKey: `${q}|${sort}|${status}`,
    filterHint,
    showOrganisationSection: presence.ownership && Boolean(gallery),
    practices,
  };
}

export async function loadCreativePresenceMetadata(
  supabase: SupabaseClient,
  slug: string
): Promise<{ displayName: string; bio: string | null; indexable: boolean } | null> {
  const clean = slug.trim();
  if (!clean) return null;

  const { data } = await supabase
    .from("artists")
    .select("display_name, bio, public_presence")
    .eq("slug", clean)
    .maybeSingle<{
      display_name: string | null;
      bio: string | null;
      public_presence?: unknown;
    }>();

  if (!data) return null;

  const presence = parsePublicPresence(data.public_presence);
  return {
    displayName: data.display_name?.trim() || "Creative",
    bio: data.bio,
    indexable: presence.profile,
  };
}
