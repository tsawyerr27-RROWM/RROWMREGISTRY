import type { CertificateClass } from "@/lib/artwork-trust-tier";

export type CertificateVerificationSummary = {
  gallery?: boolean;
  artist?: boolean;
  certificate?: boolean;
};

export type CertificateVerifiedBy = {
  type?: string;
  gallery_name?: string | null;
  gallery_id?: string | null;
  user_id?: string | null;
};

export type CertificateDocumentRow = {
  certificate_number: string;
  issued_at: string;
  revoked: boolean;
  revoked_reason: string | null;
  certificate_hash: string | null;
  verification_summary: unknown;
  certificate_snapshot: unknown;
  certificate_class: CertificateClass | null;
};

export type CertificateArtworkRow = {
  id: string;
  title: string;
  registry_id: string;
  verification_status: string;
  verification_hash: string;
  timeline_hash: string | null;
  created_at: string;
  artist_id: string;
  image_url: string | null;
  year: string | number | null;
  medium: string | null;
};

export type CertificateDocumentData = {
  artwork: CertificateArtworkRow;
  certificate: CertificateDocumentRow;
  artistName: string | null;
  verifierName: string | null;
  verificationSummary: CertificateVerificationSummary | null;
  verifyUrl: string;
};

export function parseCertificateVerificationSummary(
  raw: unknown
): CertificateVerificationSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    gallery: o.gallery === true,
    artist: o.artist === true,
    certificate: o.certificate === true,
  };
}

export function parseCertificateVerifiedBy(raw: unknown): CertificateVerifiedBy | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    type: typeof o.type === "string" ? o.type : undefined,
    gallery_name:
      typeof o.gallery_name === "string" ? o.gallery_name : null,
    gallery_id: typeof o.gallery_id === "string" ? o.gallery_id : null,
    user_id: typeof o.user_id === "string" ? o.user_id : null,
  };
}

export function verifierNameFromSnapshot(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const verifiedBy = parseCertificateVerifiedBy(
    (snapshot as Record<string, unknown>).verified_by
  );
  if (verifiedBy?.gallery_name?.trim()) return verifiedBy.gallery_name.trim();
  if (verifiedBy?.type === "gallery") return "Organisation on file";
  if (verifiedBy?.type === "admin") return "Registry authority";
  return null;
}

export function formatCertificateIssuedDate(
  iso: string,
  locale?: string
): string {
  try {
    return new Intl.DateTimeFormat(locale || undefined, {
      dateStyle: "long",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function artworkYearMediumLine(
  year: string | number | null,
  medium: string | null
): string | null {
  const parts = [year, medium].filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ""
  );
  return parts.length > 0 ? parts.map(String).join(" · ") : null;
}
