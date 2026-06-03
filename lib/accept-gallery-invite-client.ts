import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";

const INVITE_TOKEN_STORAGE_KEY = "rrowm_invite_token";

/** Read pending gallery invite token from session storage (signup / login flows). */
export function readPendingGalleryInviteToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = window.sessionStorage.getItem(INVITE_TOKEN_STORAGE_KEY);
    if (fromStorage?.trim()) return fromStorage.trim();
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("invite_token")?.trim();
    return fromQuery || null;
  } catch {
    return null;
  }
}

export function clearPendingGalleryInviteToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(INVITE_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Bind a gallery invite to the current authenticated session.
 * Non-fatal: callers may continue onboarding if acceptance fails transiently.
 */
export async function acceptPendingGalleryInvite(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const token = readPendingGalleryInviteToken();
  if (!token || token.length < 32) {
    return { ok: true };
  }

  try {
    const csrfToken = await fetchRegistryCsrfToken();
    if (!csrfToken) {
      return {
        ok: false,
        error: "Could not prepare a secure session. Refresh and try again.",
      };
    }

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ token }),
    });
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (!res.ok) {
      return {
        ok: false,
        error:
          body?.error ||
          "Could not accept the gallery invitation. Try signing in again.",
      };
    }

    clearPendingGalleryInviteToken();

    await completeGalleryInviteVerificationIfReady();

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Network error while accepting the invitation.",
    };
  }
}

/**
 * After invite accept, mark visibility confirmed when the artist is already onboarded
 * (existing accounts signing in — not only the onboarding completion path).
 */
export async function completeGalleryInviteVerificationIfReady(): Promise<void> {
  try {
    const res = await fetch("/api/invite/complete-verification", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[invite] complete-verification",
          body?.error || res.status
        );
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[invite] complete-verification network", e);
    }
  }
}
