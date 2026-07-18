import type {
  ArchiveRoleAdapter,
  ArchiveRecordSummary,
} from "@/lib/archive-engine";

type CreativeArchiveSource = {
  id: string;
  registry_id?: string | null;
  title?: string | null;
  artist_id?: string | null;
  verification_status?: string | null;
  medium?: string | null;
  year?: string | number | null;
  image_url?: string | null;
};

type CollectorArchiveSource = {
  id: string;
  registry_id?: string | null;
  title?: string | null;
  artist_id?: string | null;
  medium?: string | null;
  year?: string | number | null;
  image_url?: string | null;
};

type OrganisationArchiveSource = {
  id: string;
  registry_id: string | null;
  title: string | null;
  artist_id: string | null;
  catalogue_artist_name?: string | null;
  medium: string | null;
  year: string | number | null;
  image_url: string | null;
};

function normalizedTitle(
  title: string | null | undefined,
  untitledLabel: string
) {
  return title?.trim() || untitledLabel;
}

function normalizedRegistryId(registryId: string | null | undefined) {
  return registryId?.trim() || null;
}

export function createCreativeArchiveAdapter(
  creator: string | null | undefined,
  untitledLabel: string
): ArchiveRoleAdapter<CreativeArchiveSource> {
  return {
    surface: "creative",
    toSummary(source): ArchiveRecordSummary {
      return {
        id: String(source.id),
        registryId: normalizedRegistryId(source.registry_id),
        title: normalizedTitle(source.title, untitledLabel),
        creator: creator?.trim() || null,
        medium: source.medium ?? null,
        year: source.year ?? null,
        image: { url: source.image_url ?? null },
      };
    },
  };
}

export function createCollectorArchiveAdapter(
  artistNames: Readonly<Record<string, string>>,
  fallbackArtist: string,
  untitledLabel: string
): ArchiveRoleAdapter<CollectorArchiveSource> {
  return {
    surface: "collector",
    toSummary(source): ArchiveRecordSummary {
      return {
        id: source.id,
        registryId: normalizedRegistryId(source.registry_id),
        title: normalizedTitle(source.title, untitledLabel),
        creator:
          (source.artist_id && artistNames[source.artist_id]?.trim()) ||
          fallbackArtist,
        medium: source.medium ?? null,
        year: source.year ?? null,
        image: { url: source.image_url ?? null },
      };
    },
  };
}

export function createOrganisationArchiveAdapter(
  artistNameById: ReadonlyMap<string, string>,
  fallbackArtist: string,
  untitledLabel: string
): ArchiveRoleAdapter<OrganisationArchiveSource> {
  return {
    surface: "organisation",
    toSummary(source): ArchiveRecordSummary {
      return {
        id: source.id,
        registryId: normalizedRegistryId(source.registry_id),
        title: normalizedTitle(source.title, untitledLabel),
        creator:
          (source.artist_id && artistNameById.get(source.artist_id)?.trim()) ||
          source.catalogue_artist_name?.trim() ||
          fallbackArtist,
        medium: source.medium,
        year: source.year,
        image: { url: source.image_url },
      };
    },
  };
}
