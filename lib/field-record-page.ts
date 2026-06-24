import type { SupabaseClient } from "@supabase/supabase-js";

import {
  loadFieldVerifyRecordData,
  type FieldVerifyRecordData,
} from "@/lib/field-verify-record";
import {
  loadRecordRelationshipContextPanels,
  type FieldRelationshipContextPanelData,
} from "@/lib/field-relationship-context";
import {
  fieldCreativeHref,
  fieldOrganisationHref,
} from "@/lib/field-nav";
import { getCurrentOwner } from "@/lib/get-current-owner";
import { resolveOwnershipClaimPath } from "@/lib/ownership-claim-eligibility";
import { parsePublicPresence } from "@/lib/public-presence";
import { parsePrimaryPracticeSlug } from "@/lib/practices";
import { resolveAcquisitionDealCounterparty } from "@/lib/acquisition-deal-counterparty";

export type FieldRecordPageData = FieldVerifyRecordData & {
  image_url: string | null;
  year: number | null;
  medium: string | null;
  description: string | null;
  artistName: string | null;
  creativeHref: string | null;
  organisationName: string | null;
  organisationHref: string | null;
  contextPanels: FieldRelationshipContextPanelData[];
  dealCounterparty: {
    userId: string;
    label: string;
  } | null;
  currentOwnerUserId: string | null;
  pendingAcquisitionOnArtwork: boolean;
};

type GalleryLinkRow = {
  id?: string;
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
): Promise<{
  name: string | null;
  href: string | null;
  slug: string | null;
  galleryId: string | null;
}> {
  let gallery: GalleryLinkRow | null = null;

  if (args.filingGalleryId) {
    const { data } = await supabase
      .from("galleries")
      .select("id, slug, name, public_presence")
      .eq("id", args.filingGalleryId)
      .maybeSingle<GalleryLinkRow>();
    gallery = data;
  } else if (args.artistGalleryId) {
    const { data } = await supabase
      .from("galleries")
      .select("id, slug, name, public_presence")
      .eq("id", args.artistGalleryId)
      .maybeSingle<GalleryLinkRow>();
    gallery = data;
  }

  const name = gallery?.name?.trim() || args.fallbackName;
  const slug = gallery?.slug?.trim() || null;
  const presence = parsePublicPresence(gallery?.public_presence);
  const href =
    slug && presence.profile ? fieldOrganisationHref(slug) : null;

  return {
    name: name ?? null,
    href,
    slug,
    galleryId: gallery?.id ?? args.filingGalleryId ?? args.artistGalleryId,
  };
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
  let artistSlug: string | null = base.artist?.slug?.trim() || null;
  let primaryPracticeSlug: string | null = null;

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
      artistSlug = artistRow.slug?.trim() || artistSlug;
      primaryPracticeSlug = parsePrimaryPracticeSlug(artistRow.public_presence);
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

  const contextPanels = await loadRecordRelationshipContextPanels(supabase, {
    registryId: base.artwork.registry_id,
    artistId: base.artwork.artist_id,
    artistSlug,
    artistName,
    galleryId: orgLink.galleryId,
    organisationSlug: orgLink.slug,
    organisationName: orgLink.name,
    medium: artwork?.medium ?? null,
    primaryPracticeSlug,
  });

  const currentOwner = await getCurrentOwner(supabase, base.artwork.id);

  let pendingAcquisitionOnArtwork = false;
  if (sessionUserId) {
    const claimPath = await resolveOwnershipClaimPath(
      supabase,
      sessionUserId,
      base.artwork.id
    );
    pendingAcquisitionOnArtwork = claimPath.kind === "provenance_accept";
  }

  const dealCounterparty = resolveAcquisitionDealCounterparty({
    artistUserId: base.artwork.artist_id,
    artistName: artistName?.trim() || "Registered artist",
    currentOwnerUserId: currentOwner.user_id,
    currentOwnerDisplayName: currentOwner.display_name,
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
    contextPanels,
    dealCounterparty,
    currentOwnerUserId: currentOwner.user_id,
    pendingAcquisitionOnArtwork,
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
