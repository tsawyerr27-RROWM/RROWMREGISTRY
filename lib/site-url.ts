/**
 * Canonical public site base for absolute links (email, certificates, shares).
 * Trailing slash is stripped.
 * Prefer NEXT_PUBLIC_APP_URL, then NEXT_PUBLIC_SITE_URL for compatibility.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://rrowm.io";
}
