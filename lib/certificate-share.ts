import { fillMessage, type MessageKey } from "@/lib/locale-messages";
import { getSiteUrl } from "@/lib/site-url";

export type CertificateSharePublicity = "full" | "restricted";

export type CertificateShareContext = {
  registryId: string;
  artworkTitle: string;
  artistName?: string | null;
  issuedAt?: string | null;
  publicity: CertificateSharePublicity;
  revoked?: boolean;
};

export type TranslateFn = (key: MessageKey) => string;

export function certificateSharePath(registryId: string): string {
  const clean = registryId.trim();
  return `/certificate/${encodeURIComponent(clean)}`;
}

export function certificateShareOgImagePath(registryId: string): string {
  return `${certificateSharePath(registryId)}/opengraph-image`;
}

export function certificateShareAbsoluteUrl(
  registryId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${certificateSharePath(registryId)}`;
}

export function certificateShareAbsoluteOgImageUrl(
  registryId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${certificateShareOgImagePath(registryId)}`;
}

/** Relative client download path (same-origin; safe for SSR + local dev). */
export function certificateShareDownloadImagePath(registryId: string): string {
  const params = new URLSearchParams({ registry_id: registryId.trim() });
  return `/api/og/certificate?${params.toString()}`;
}

export function resolveCertificateSharePublicity(args: {
  isVerified: boolean;
  hasCertificate: boolean;
  revoked: boolean;
}): CertificateSharePublicity {
  if (args.isVerified && args.hasCertificate && !args.revoked) return "full";
  return "restricted";
}

export function buildCertificateShareTitle(
  context: CertificateShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return t("certificate.share.titleRestricted");
  }
  const title = context.artworkTitle.trim() || "Work on file";
  return fillMessage(t("certificate.share.titleWithWork"), { title });
}

export function buildCertificateShareText(
  context: CertificateShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return fillMessage(t("certificate.share.textRestricted"), {
      registryId: context.registryId,
    });
  }
  const title = context.artworkTitle.trim() || "Work on file";
  return fillMessage(t("certificate.share.text"), { title });
}

export function buildCertificateShareContext(args: {
  registryId: string;
  artworkTitle: string;
  artistName?: string | null;
  issuedAt?: string | null;
  isVerified: boolean;
  hasCertificate: boolean;
  revoked?: boolean;
}): CertificateShareContext {
  return {
    registryId: args.registryId.trim(),
    artworkTitle: args.artworkTitle,
    artistName: args.artistName ?? null,
    issuedAt: args.issuedAt ?? null,
    revoked: Boolean(args.revoked),
    publicity: resolveCertificateSharePublicity({
      isVerified: args.isVerified,
      hasCertificate: args.hasCertificate,
      revoked: Boolean(args.revoked),
    }),
  };
}
