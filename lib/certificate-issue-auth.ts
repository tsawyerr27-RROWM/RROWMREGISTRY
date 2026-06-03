import type { SupabaseClient } from "@supabase/supabase-js";

export type CertificateIssueVia = "admin" | "artist" | "gallery_staff";

export type CertificateIssueAuthResult =
  | { authorized: true; via: CertificateIssueVia }
  | { authorized: false; reason: string };

/**
 * Whether the signed-in user may trigger certificate issuance for an artwork.
 * Used by POST /api/issue-certificate before service-role RPC.
 */
export async function authorizeCertificateIssuance(
  supabase: SupabaseClient,
  userId: string,
  artworkId: string
): Promise<CertificateIssueAuthResult> {
  const { data: profile } = await supabase
    .from("artists")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.is_admin === true) {
    return { authorized: true, via: "admin" };
  }

  const { data: art, error } = await supabase
    .from("artworks")
    .select("artist_id, filing_gallery_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (error || !art) {
    return { authorized: false, reason: "Artwork not found" };
  }

  if (art.artist_id && String(art.artist_id) === userId) {
    return { authorized: true, via: "artist" };
  }

  const galleryId = art.filing_gallery_id;
  if (galleryId) {
    const { data: membership } = await supabase
      .from("gallery_users")
      .select("id")
      .eq("gallery_id", galleryId)
      .eq("user_id", userId)
      .in("role", ["admin", "staff"])
      .limit(1)
      .maybeSingle();

    if (membership?.id) {
      return { authorized: true, via: "gallery_staff" };
    }
  }

  return {
    authorized: false,
    reason: "Not authorized to issue a certificate for this artwork",
  };
}
