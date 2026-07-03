import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  artworkTrustOgLabelKey,
  parseArtworkTrustTier,
} from "@/lib/artwork-trust-tier";
import {
  buildCertificateShareContext,
  buildCertificateShareText,
  buildCertificateShareTitle,
  certificateShareAbsoluteOgImageUrl,
  certificateShareAbsoluteUrl,
  type CertificateShareContext,
} from "@/lib/certificate-share";
import { fillMessage, translate, type MessageKey } from "@/lib/locale-messages";
import { getSiteUrl } from "@/lib/site-url";
import { warnSupabaseRpc } from "@/lib/supabase-rpc-error";

export type CertificateOgBundle = {
  context: CertificateShareContext;
  trustOgLine: string | null;
  indexable: boolean;
};

const OG_LANG = "en" as const;

function tOg(key: MessageKey): string {
  return translate(key, OG_LANG);
}

function truncateDescription(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function resolveCertificateTrustOgLine(
  context: CertificateShareContext
): string | null {
  const key = artworkTrustOgLabelKey(context.trustTier);
  return key ? tOg(key) : null;
}

export function resolveCertificateOgLines(bundle: CertificateOgBundle) {
  const title = buildCertificateShareTitle(bundle.context, tOg);
  const body = buildCertificateShareText(bundle.context, tOg);
  const trustLine = bundle.trustOgLine;
  const description = truncateDescription(
    [trustLine, body].filter(Boolean).join(" · ")
  );
  const alt =
    bundle.context.publicity === "full"
      ? fillMessage(tOg("certificate.share.ogAlt"), {
          title: bundle.context.artworkTitle.trim() || "Work on file",
        })
      : tOg("certificate.share.ogAltRestricted");

  return { title, description, alt, trustLine };
}

export function buildCertificateMetadata(bundle: CertificateOgBundle): Metadata {
  const lines = resolveCertificateOgLines(bundle);
  const canonicalUrl = certificateShareAbsoluteUrl(bundle.context.registryId, getSiteUrl());
  const ogImageUrl = certificateShareAbsoluteOgImageUrl(
    bundle.context.registryId,
    getSiteUrl()
  );

  return {
    title: lines.title,
    description: lines.description,
    alternates: { canonical: canonicalUrl },
    robots: bundle.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: lines.title,
      description: lines.description,
      url: canonicalUrl,
      siteName: "RROWM",
      type: "website",
      locale: "en_GB",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: lines.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: lines.title,
      description: lines.description,
      images: [ogImageUrl],
    },
  };
}

export function buildCertificateNotFoundMetadata(): Metadata {
  const title = tOg("certificate.share.titleRestricted");
  const description = tOg("certificate.share.textRestrictedGeneric");

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: "RROWM",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export async function loadCertificateOgBundle(
  supabase: SupabaseClient,
  registryId: string
): Promise<CertificateOgBundle | null> {
  const cleanId = registryId.trim();
  if (!cleanId) return null;

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("id, title, registry_id, verification_status, artist_id")
    .eq("registry_id", cleanId)
    .maybeSingle();

  if (artworkError) warnSupabaseRpc("certificate og artwork", artworkError);
  if (!artwork?.id) return null;

  const trustTier = parseArtworkTrustTier(artwork.verification_status);

  const { data: certRows, error: certErr } = await supabase.rpc(
    "get_certificate_public_status_single",
    { p_artwork_id: artwork.id }
  );
  if (certErr) warnSupabaseRpc("certificate og status", certErr);

  type CertPublic = {
    has_certificate: boolean;
    revoked: boolean;
  };
  const cert = (certRows?.[0] ?? null) as CertPublic | null;
  const hasCertificate = Boolean(cert?.has_certificate);
  const revoked = Boolean(cert?.revoked);

  let artistName: string | null = null;
  if (artwork.artist_id) {
    const { data: artist } = await supabase
      .from("artists")
      .select("display_name, full_name")
      .eq("id", artwork.artist_id)
      .maybeSingle();
    artistName =
      artist?.display_name?.trim() || artist?.full_name?.trim() || null;
  }

  let issuedAt: string | null = null;
  if (hasCertificate) {
    const { data: certificate } = await supabase
      .from("certificates")
      .select("issued_at, certificate_class")
      .eq("artwork_id", artwork.id)
      .maybeSingle();
    issuedAt = certificate?.issued_at ?? null;
  }

  const context = buildCertificateShareContext({
    registryId: String(artwork.registry_id || cleanId),
    artworkTitle: String(artwork.title || "").trim() || "Work on file",
    artistName,
    issuedAt,
    trustTier,
    hasCertificate,
    revoked,
  });

  const trustOgLine = resolveCertificateTrustOgLine(context);

  return {
    context,
    trustOgLine,
    indexable: context.publicity === "full",
  };
}

export type CertificateOgSealTier = "attested" | "revoked" | "restricted";

export function certificateOgSealTier(
  context: CertificateShareContext
): CertificateOgSealTier {
  if (context.publicity === "restricted") return "restricted";
  if (context.revoked) return "revoked";
  return "attested";
}
