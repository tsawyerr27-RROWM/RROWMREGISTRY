import * as QRCode from "qrcode";

import {
  type CertificateDocumentData,
  parseCertificateVerificationSummary,
  verifierNameFromSnapshot,
} from "@/lib/certificate-document";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type CertificatePageResult =
  | { kind: "missing"; registryId: string; ackRegistryId: string }
  | {
      kind: "document";
      data: CertificateDocumentData;
      isArtistOwner: boolean;
      qrCodeDataUrl: string;
      ackRegistryId: string;
    };

export async function loadCertificatePageData(
  registryId: string
): Promise<CertificatePageResult | "not_found" | "redirect_login"> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  const cleanId = registryId.trim();

  if (!user) {
    return "redirect_login";
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      `
      id,
      title,
      registry_id,
      verification_status,
      verification_hash,
      timeline_hash,
      created_at,
      artist_id,
      image_url,
      year,
      medium
    `
    )
    .eq("registry_id", cleanId)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("certificate page artwork", artworkError);
  if (!artwork) return "not_found";

  const { error: certOwnErr } = await supabase.rpc(
    "ownership_certificate_verify",
    { p_artwork_id: artwork.id }
  );
  if (certOwnErr) {
    warnSupabaseRpc("ownership_certificate_verify", certOwnErr);
  }

  if (artwork.verification_status !== "verified") {
    return "not_found";
  }

  const { data: artist } = await supabase
    .from("artists")
    .select("display_name, full_name")
    .eq("id", artwork.artist_id)
    .maybeSingle();

  const publicName =
    artist?.display_name?.trim() || artist?.full_name?.trim() || null;

  const { data: certificate } = await supabase
    .from("certificates")
    .select(
      `
      certificate_number,
      issued_at,
      revoked,
      revoked_reason,
      certificate_hash,
      verification_summary,
      certificate_snapshot
    `
    )
    .eq("artwork_id", artwork.id)
    .maybeSingle();

  if (!certificate) {
    return { kind: "missing", registryId: cleanId, ackRegistryId: cleanId };
  }

  const verifyUrl = `${getSiteUrl()}/field/verify/${encodeURIComponent(cleanId)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);

  const verifierName =
    verifierNameFromSnapshot(certificate.certificate_snapshot) ??
    (parseCertificateVerificationSummary(certificate.verification_summary)
      ?.gallery
      ? "Organisation on file"
      : null);

  const data: CertificateDocumentData = {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      registry_id: artwork.registry_id,
      verification_status: artwork.verification_status,
      verification_hash: artwork.verification_hash,
      timeline_hash: artwork.timeline_hash,
      created_at: artwork.created_at,
      artist_id: artwork.artist_id,
      image_url: artwork.image_url,
      year: artwork.year,
      medium: artwork.medium,
    },
    certificate: {
      certificate_number: certificate.certificate_number,
      issued_at: certificate.issued_at,
      revoked: certificate.revoked,
      revoked_reason: certificate.revoked_reason,
      certificate_hash: certificate.certificate_hash,
      verification_summary: certificate.verification_summary,
      certificate_snapshot: certificate.certificate_snapshot,
    },
    artistName: publicName,
    verifierName,
    verificationSummary: parseCertificateVerificationSummary(
      certificate.verification_summary
    ),
    verifyUrl,
  };

  return {
    kind: "document",
    data,
    isArtistOwner: user.id === artwork.artist_id,
    qrCodeDataUrl,
    ackRegistryId: cleanId,
  };
}

export function certificateLoginRedirectPath(registryId: string): string {
  return `/login?next=${encodeURIComponent(`/certificate/${encodeURIComponent(registryId.trim())}`)}`;
}
