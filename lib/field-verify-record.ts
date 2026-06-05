import type { SupabaseClient } from "@supabase/supabase-js";

import { parseArtistRepresentationState } from "@/lib/artwork-representation";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";
import {
  getArtworkArchiveCount,
  isArtworkArchived,
} from "@/lib/personal-archive";
import { REPRESENTATION_PHRASES } from "@/lib/representation-language";

export type FieldVerifyCertificateStatus = {
  has_certificate: boolean;
  revoked: boolean;
  revoked_reason: string | null;
};

export type FieldVerifyOrganisationContext = {
  name: string;
  verified: boolean;
  role: "representation" | "filing";
} | null;

export type FieldVerifyRecordData = {
  artwork: {
    id: string;
    title: string | null;
    registry_id: string;
    verification_status: string | null;
    created_at: string;
    artist_id: string | null;
  };
  artist: {
    display_name: string | null;
    verification_status: string | null;
    slug: string | null;
  } | null;
  recordVerified: boolean;
  artistConfirmationOnFile: boolean;
  organisation: FieldVerifyOrganisationContext;
  artistVerifiedWorkCount: number;
  certificate: FieldVerifyCertificateStatus | null;
  certificateRevoked: boolean;
  archiveCount: number;
  userArchived: boolean;
  sessionUserId: string | null;
};

type GalleryRow = {
  name: string | null;
  verified: boolean | null;
};

async function loadGalleryById(
  supabase: SupabaseClient,
  galleryId: string | null
): Promise<GalleryRow | null> {
  if (!galleryId) return null;
  const { data } = await supabase
    .from("galleries")
    .select("name, verified")
    .eq("id", galleryId)
    .maybeSingle();
  return data;
}

export async function loadFieldVerifyRecordData(
  supabase: SupabaseClient,
  registryId: string,
  sessionUserId: string | null
): Promise<FieldVerifyRecordData | null> {
  const cleanId = registryId.trim();
  if (!cleanId) return null;

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      "id, title, registry_id, verification_status, created_at, artist_id, filing_gallery_id"
    )
    .eq("registry_id", cleanId)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("field verify artwork", artworkError);
  if (!artwork) return null;

  const recordVerified = artwork.verification_status === "verified";

  let artist: FieldVerifyRecordData["artist"] = null;
  let organisation: FieldVerifyOrganisationContext = null;
  let artistVerifiedWorkCount = 0;

  if (artwork.artist_id) {
    const { data: artistRow } = await supabase
      .from("artists")
      .select(`
        display_name,
        full_name,
        verification_status,
        slug,
        gallery_id,
        galleries(name, verified)
      `)
      .eq("id", artwork.artist_id)
      .maybeSingle();

    if (artistRow) {
      const galleryRaw = Array.isArray(artistRow.galleries)
        ? artistRow.galleries[0]
        : artistRow.galleries;
      artist = {
        display_name:
          artistRow.display_name?.trim() ||
          (artistRow as { full_name?: string | null }).full_name?.trim() ||
          null,
        verification_status: artistRow.verification_status,
        slug: artistRow.slug,
      };

      const { data: repStateRaw } = await supabase.rpc(
        "get_artist_representation_state",
        { p_artist_id: artwork.artist_id }
      );
      const repState = parseArtistRepresentationState(repStateRaw);

      if (galleryRaw?.name && (repState.active || repState.represented_by_gallery)) {
        organisation = {
          name: String(galleryRaw.name).trim(),
          verified: Boolean(galleryRaw.verified),
          role: "representation",
        };
      }

      const { count } = await supabase
        .from("artworks")
        .select("id", { count: "exact", head: true })
        .eq("artist_id", artwork.artist_id)
        .eq("verification_status", "verified");
      artistVerifiedWorkCount = count ?? 0;
    }
  }

  const filingGalleryId = (artwork as { filing_gallery_id?: string | null })
    .filing_gallery_id;
  if (filingGalleryId) {
    const filing = await loadGalleryById(supabase, filingGalleryId);
    if (filing?.name) {
      organisation = {
        name: filing.name.trim(),
        verified: Boolean(filing.verified),
        role: "filing",
      };
    }
  }

  let certificate: FieldVerifyCertificateStatus | null = null;
  let certificateRevoked = false;

  if (recordVerified) {
    const { data: certRows, error: certRpcError } = await supabase.rpc(
      "get_certificate_public_status_single",
      { p_artwork_id: artwork.id }
    );
    if (certRpcError) warnSupabaseRpc("field verify cert RPC", certRpcError);
    const cert = certRows?.[0] as FieldVerifyCertificateStatus | undefined;
    if (cert) {
      certificate = cert;
      certificateRevoked = Boolean(cert.revoked);
    }
  }

  const archiveCount = await getArtworkArchiveCount(supabase, artwork.id);
  const userArchived =
    sessionUserId != null
      ? await isArtworkArchived(supabase, artwork.id, sessionUserId)
      : false;

  const artistConfirmationOnFile =
    recordVerified || artist?.verification_status === "verified";

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      registry_id: artwork.registry_id,
      verification_status: artwork.verification_status,
      created_at: artwork.created_at,
      artist_id: artwork.artist_id,
    },
    artist,
    recordVerified,
    artistConfirmationOnFile,
    organisation,
    artistVerifiedWorkCount,
    certificate,
    certificateRevoked,
    archiveCount,
    userArchived,
    sessionUserId,
  };
}

export function recordVerificationStatusLabel(
  status: string | null,
  recordVerified: boolean
): string {
  if (recordVerified) return "Verified Registry record";
  const s = String(status ?? "").toLowerCase();
  if (s === "pending") return "Registered — verification may deepen on file";
  return "Registered on file";
}

export function artistConfirmationLabel(onFile: boolean): string {
  return onFile
    ? REPRESENTATION_PHRASES.artistConfirmationOnFile
    : "Artist confirmation not yet on file for this record";
}

export function organisationVerificationLabel(
  org: FieldVerifyOrganisationContext
): string {
  if (!org) return "No organisation attestation linked to this record";
  if (org.verified) {
    return org.role === "filing"
      ? "Verified organisation filed this Registry record"
      : "Verified organisation linked to representation on file";
  }
  return org.role === "filing"
    ? "Organisation filed this Registry record"
    : "Institutional representation on file";
}

export function certificateStatusLabel(args: {
  recordVerified: boolean;
  certificate: FieldVerifyCertificateStatus | null;
  certificateRevoked: boolean;
  pendingLabel: string;
}): string {
  if (!args.recordVerified) return args.pendingLabel;
  if (!args.certificate?.has_certificate) return "Certificate not yet recorded";
  if (args.certificateRevoked) return "Certificate revoked";
  return "Certificate recorded on file";
}
