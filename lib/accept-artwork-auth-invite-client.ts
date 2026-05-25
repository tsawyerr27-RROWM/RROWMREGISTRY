import {
  artworkAuthTokenFromReturnPath,
  buildArtworkAuthenticationReturnPath,
  isArtworkAuthenticationReturnPath,
  sanitizeAuthReturnPath,
} from "@/lib/auth-return-path";

const STORAGE_KEY = "rrowm_artwork_auth_token";

export function persistArtworkAuthInviteToken(token: string): void {
  const t = token.trim();
  if (t.length < 32 || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
}

export function persistArtworkAuthInviteFromReturnPath(returnPath: string): void {
  const token = artworkAuthTokenFromReturnPath(returnPath);
  if (token) persistArtworkAuthInviteToken(token);
}

export function readPendingArtworkAuthInviteToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = window.sessionStorage.getItem(STORAGE_KEY)?.trim();
    if (fromStorage && fromStorage.length >= 32) return fromStorage;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("token")?.trim();
    if (
      fromQuery &&
      fromQuery.length >= 32 &&
      window.location.pathname.replace(/\/$/, "") === "/authenticate-record"
    ) {
      return fromQuery;
    }
    const next = params.get("next")?.trim();
    if (next) {
      const fromNext = artworkAuthTokenFromReturnPath(
        decodeURIComponent(next)
      );
      if (fromNext) return fromNext;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingArtworkAuthInviteToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Prefer explicit ?next=, then persisted artwork-auth token, else null. */
export function resolveArtworkAuthenticationReturnPath(
  explicitNext?: string | null
): string | null {
  const safe = sanitizeAuthReturnPath(explicitNext);
  if (safe && isArtworkAuthenticationReturnPath(safe)) {
    persistArtworkAuthInviteFromReturnPath(safe);
    return safe;
  }
  const token = readPendingArtworkAuthInviteToken();
  if (token) return buildArtworkAuthenticationReturnPath(token);
  return null;
}
