import type { SupabaseClient } from "@supabase/supabase-js";

import { isCurrentOwner } from "@/lib/canonical-ownership-engine";
import {
  type RegistryStewardAuthorshipEligibility,
  type RegistryStewardCustodyEligibility,
  type RegistryStewardInviteArtwork,
  type RegistryStewardInviteEligibility,
  type RegistryStewardInviteKind,
} from "@/lib/registry-steward-invite";
import {
  PROVENANCE_TRANSFER_TYPES,
  type ProvenanceTransferType,
} from "@/lib/provenance-transfer";

async function loadArtworkForStewardInvite(
  service: SupabaseClient,
  artworkId: string
): Promise<RegistryStewardInviteArtwork | null> {
  const { data } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, catalogue_artist_name, artist_id, verification_status, filing_gallery_id"
    )
    .eq("id", artworkId)
    .maybeSingle<RegistryStewardInviteArtwork>();

  return data?.id ? data : null;
}

async function resolveAuthorshipEligibility(
  supabase: SupabaseClient,
  service: SupabaseClient,
  artwork: RegistryStewardInviteArtwork,
  userId: string
): Promise<RegistryStewardAuthorshipEligibility | null> {
  const galleryId = String(artwork.filing_gallery_id || "");
  if (!galleryId) return null;

  const { data: membership } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("gallery_id", galleryId)
    .eq("user_id", userId)
    .maybeSingle<{ role: string }>();

  if (
    !membership ||
    (membership.role !== "admin" && membership.role !== "staff")
  ) {
    return null;
  }

  if (artwork.artist_id) {
    const { data: artist } = await service
      .from("artists")
      .select("user_id, verification_status")
      .eq("id", artwork.artist_id)
      .maybeSingle<{ user_id: string | null; verification_status: string | null }>();

    if (artist?.user_id && artist.verification_status === "verified") {
      return null;
    }
  }

  const { data: gallery } = await service
    .from("galleries")
    .select("name")
    .eq("id", galleryId)
    .maybeSingle<{ name: string | null }>();

  const { data: pendingInvite } = await service
    .from("artwork_authentication_invites")
    .select("artist_email")
    .eq("artwork_id", artwork.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ artist_email: string }>();

  return {
    kind: "authorship",
    artistNameOnFile:
      artwork.catalogue_artist_name?.trim() || "Creative on file",
    institutionName: gallery?.name?.trim() || "Institution",
    defaultEmail: pendingInvite?.artist_email?.trim().toLowerCase() || null,
    artistLinked: Boolean(artwork.artist_id),
  };
}

async function resolveCustodyEligibility(
  service: SupabaseClient,
  artwork: RegistryStewardInviteArtwork,
  userId: string
): Promise<RegistryStewardCustodyEligibility | null> {
  if (String(artwork.verification_status || "") !== "verified") return null;
  if (!(await isCurrentOwner(service, userId, artwork.id))) {
    return null;
  }

  const transferTypes = [...PROVENANCE_TRANSFER_TYPES] as ProvenanceTransferType[];

  return {
    kind: "custody",
    transferTypes,
  };
}

export async function resolveRegistryStewardInviteEligibility(
  supabase: SupabaseClient,
  service: SupabaseClient,
  args: { artworkId?: string; registryId?: string; userId: string }
): Promise<RegistryStewardInviteEligibility | null> {
  const userId = args.userId.trim();
  if (!userId) return null;

  let artwork: RegistryStewardInviteArtwork | null = null;

  if (args.artworkId?.trim()) {
    artwork = await loadArtworkForStewardInvite(service, args.artworkId.trim());
  } else if (args.registryId?.trim()) {
    const { data } = await service
      .from("artworks")
      .select(
        "id, title, registry_id, catalogue_artist_name, artist_id, verification_status, filing_gallery_id"
      )
      .eq("registry_id", args.registryId.trim())
      .maybeSingle<RegistryStewardInviteArtwork>();
    artwork = data?.id ? data : null;
  }

  if (!artwork) return null;

  const [authorship, custody] = await Promise.all([
    resolveAuthorshipEligibility(supabase, service, artwork, userId),
    resolveCustodyEligibility(service, artwork, userId),
  ]);

  const kinds: RegistryStewardInviteKind[] = [];
  if (authorship) kinds.push("authorship");
  if (custody) kinds.push("custody");

  if (kinds.length === 0) return null;

  return {
    artwork: {
      id: artwork.id,
      title: String(artwork.title || "").trim() || "Work on file",
      registry_id: String(artwork.registry_id || "").trim(),
    },
    kinds,
    authorship,
    custody,
  };
}
