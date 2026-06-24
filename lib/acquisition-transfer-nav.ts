import { getSiteUrl } from "@/lib/site-url";

/** In-app path for confirming an acquisition / provenance transfer (not steward-invite). */
export function buildAcquisitionAcceptPath(token: string): string {
  return `/provenance/accept?token=${encodeURIComponent(token)}`;
}

/** Absolute URL for acquisition transfer confirmation emails and notifications. */
export function buildAcquisitionAcceptPublicUrl(
  token: string,
  origin?: string
): string {
  const base = (origin ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}${buildAcquisitionAcceptPath(token)}`;
}

export function buildAcquisitionAcceptHref(
  inviteToken: string | null | undefined
): string | null {
  const token = String(inviteToken ?? "").trim();
  if (token.length < 32) return null;
  return buildAcquisitionAcceptPath(token);
}
