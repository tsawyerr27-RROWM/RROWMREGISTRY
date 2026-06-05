import type { SupabaseClient } from "@supabase/supabase-js";

import {
  loadFieldVerifyRecordData,
  type FieldVerifyRecordData,
} from "@/lib/field-verify-record";
import {
  fieldCreativeHref,
  fieldOrganisationHref,
} from "@/lib/field-nav";
import { parsePublicPresence } from "@/lib/public-presence";

export type FieldRecordPageData = FieldVerifyRecordData & {
  image_url: string | null;
  year: number | null;
  medium: string | null;
  description: string | null;
  artistName: string | null;
  creativeHref: string | null;
  organisationName: string | null;
  organisationHref: string | null;
};

type GalleryLinkRow = {
  slug: string | null;
  name: string | null;
  public_presence?: unknown;
};

async function resolveOrganisationLink(
  supabase: SupabaseClient,
  args: {
    artistGalleryId: string | null;
    filingGalleryId: string | null;
    fallbackName: string | null;
  }
): Promise<{ name: string | null; href: string | null }> {
  let gallery: GalleryLinkRow | null = null;

  if (args.filingGalleryId) {
    const { data } = await supabase
      .from("galleries")
      .select("slug, name, public_presence")
      .eq("id", args.filingGalleryId)
      .maybeSingle<GalleryLinkRow>();
    gallery = data;
  } else if (args.artistGalleryId) {
    const { data } = await supabase
      .from("galleries")
      .select("slug, name, public_presence")
      .eq("id", args.artistGalleryId)
      .maybeSingle<GalleryLinkRow>();
    gallery = data;
  }

  const name = gallery?.name?.trim() || args.fallbackName;
  const slug = gallery?.slug?.trim();
  const presence = parsePublicPresence(gallery?.public_presence);
  const href =
    slug && presence.profile ? fieldOrganisationHref(slug) : null;

  return { name: name ?? null, href };
}

export async function loadFieldRecordPageData(
  supabase: SupabaseClient,
  registryId: string,
  sessionUserId: string | null
): Promise<FieldRecordPageData | null> {
  const base = await loadFieldVerifyRecordData(supabase, registryId, sessionUserId);
  if (!base) return null;

  const { data: artwork } = await supabase
    .from("artworks")
    .select(
      "image_url, year, medium, description, filing_gallery_id, artist_id"
    )
    .eq("id", base.artwork.id)
    .maybeSingle<{
      image_url: string | null;
      year: number | null;
      medium: string | null;
      description: string | null;
      filing_gallery_id: string | null;
      artist_id: string | null;
    }>();

  let artistName = base.artist?.display_name ?? null;
  let creativeHref: string | null = null;
  let artistGalleryId: string | null = null;

  if (base.artwork.artist_id) {
    const { data: artistRow } = await supabase
      .from("artists")
      .select("display_name, full_name, slug, public_presence, gallery_id")
      .eq("id", base.artwork.artist_id)
      .maybeSingle<{
        display_name: string | null;
        full_name: string | null;
        slug: string | null;
        public_presence?: unknown;
        gallery_id: string | null;
      }>();

    if (artistRow) {
      artistName =
        artistRow.display_name?.trim() ||
        artistRow.full_name?.trim() ||
        artistName;
      artistGalleryId = artistRow.gallery_id;
      const slug = artistRow.slug?.trim();
      const presence = parsePublicPresence(artistRow.public_presence);
      if (slug && presence.profile) {
        creativeHref = fieldCreativeHref(slug);
      }
    }
  }

  const orgLink = await resolveOrganisationLink(supabase, {
    artistGalleryId,
    filingGalleryId: artwork?.filing_gallery_id ?? null,
    fallbackName: base.organisation?.name ?? null,
  });

  return {
    ...base,
    image_url: artwork?.image_url ?? null,
    year: artwork?.year ?? null,
    medium: artwork?.medium ?? null,
    description: artwork?.description ?? null,
    artistName,
    creativeHref,
    organisationName: orgLink.name,
    organisationHref: orgLink.href,
  };
}

export async function loadFieldRecordMetadata(
  supabase: SupabaseClient,
  registryId: string
): Promise<{ title: string; registryId: string } | null> {
  const clean = registryId.trim();
  if (!clean) return null;

  const { data } = await supabase
    .from("artworks")
    .select("title, registry_id")
    .eq("registry_id", clean)
    .maybeSingle<{ title: string | null; registry_id: string }>();

  if (!data) return null;

  return {
    title: data.title?.trim() || "Registry record",
    registryId: data.registry_id,
  };
}
