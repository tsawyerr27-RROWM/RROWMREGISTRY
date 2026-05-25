/**
 * Safe post-auth redirects (login, signup complete, onboarding).
 * Only same-origin relative paths are allowed.
 */

const ARTWORK_AUTH_PATH = "/authenticate-record";

export function sanitizeAuthReturnPath(
  raw: string | null | undefined
): string | null {
  const path = String(raw || "").trim();
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  if (path.includes("\\")) return null;
  return path;
}

export function isArtworkAuthenticationReturnPath(path: string): boolean {
  const base = path.split("?")[0]?.replace(/\/$/, "") || "";
  return base === ARTWORK_AUTH_PATH;
}

export function artworkAuthTokenFromReturnPath(path: string): string | null {
  if (!isArtworkAuthenticationReturnPath(path)) return null;
  try {
    const q = path.includes("?") ? path.slice(path.indexOf("?")) : "";
    const token = new URLSearchParams(q).get("token")?.trim();
    return token && token.length >= 32 ? token : null;
  } catch {
    return null;
  }
}

export function buildArtworkAuthenticationReturnPath(token: string): string {
  const t = token.trim();
  return `${ARTWORK_AUTH_PATH}?token=${encodeURIComponent(t)}`;
}
