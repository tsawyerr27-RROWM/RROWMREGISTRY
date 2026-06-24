"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";

const AUTH_STORAGE_MODE_KEY = "rrowm_auth_storage_mode";
const SIGN_OUT_TIMEOUT_MS = 8000;

let signOutInFlight: Promise<{ ok: boolean; note?: string }> | null = null;

function authStorageKeys(storage: Storage): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith("sb-")) keys.push(key);
    }
  } catch {
    /* ignore */
  }
  return keys;
}

/** Best-effort wipe when GoTrue signOut is blocked on the auth storage lock. */
export function clearAuthStorageManually() {
  if (typeof window === "undefined") return;
  try {
    for (const key of authStorageKeys(localStorage)) {
      localStorage.removeItem(key);
    }
    for (const key of authStorageKeys(sessionStorage)) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Serialized sign-out — avoids duplicate concurrent signOut calls that worsen
 * GoTrue lock contention. Falls back to manual storage clear on timeout/error.
 */
export async function signOutSafely(): Promise<{ ok: boolean; note?: string }> {
  if (signOutInFlight) return signOutInFlight;

  signOutInFlight = (async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        clearAuthStorageManually();
        return { ok: true, note: "no client; storage cleared" };
      }

      await Promise.race([
        supabase.auth.signOut().then(({ error }: { error: Error | null }) => {
          if (error) throw error;
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("signOut timeout")), SIGN_OUT_TIMEOUT_MS)
        ),
      ]);

      return { ok: true };
    } catch (e) {
      clearAuthStorageManually();
      return {
        ok: true,
        note:
          e instanceof Error
            ? `${e.message}; storage cleared manually`
            : "signOut failed; storage cleared manually",
      };
    } finally {
      signOutInFlight = null;
    }
  })();

  return signOutInFlight;
}

/**
 * Clears the session then performs a full-page navigation.
 * Prefer this over client router navigation after sign-out — more reliable on mobile
 * and avoids stale SSR session cookies on the next view.
 */
export async function signOutAndRedirect(
  redirectTo = "/login"
): Promise<{ ok: boolean; note?: string }> {
  const result = await signOutSafely();
  if (typeof window !== "undefined") {
    window.location.assign(redirectTo);
  }
  return result;
}

export function getAuthStorageMode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.sessionStorage.getItem(AUTH_STORAGE_MODE_KEY) ??
      window.localStorage.getItem(AUTH_STORAGE_MODE_KEY)
    );
  } catch {
    return null;
  }
}

export function listSupabaseAuthStorageKeys(): {
  localStorage: string[];
  sessionStorage: string[];
} {
  if (typeof window === "undefined") {
    return { localStorage: [], sessionStorage: [] };
  }
  return {
    localStorage: authStorageKeys(localStorage),
    sessionStorage: authStorageKeys(sessionStorage),
  };
}

export function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}
