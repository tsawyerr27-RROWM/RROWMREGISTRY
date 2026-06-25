"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";

const SIGN_OUT_TIMEOUT_MS = 8000;

let signOutInFlight: Promise<{ ok: boolean; note?: string }> | null = null;

async function signOutServerCookies(): Promise<void> {
  const res = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Server sign-out failed (${res.status})`);
  }
  const serverError = res.headers.get("x-signout-error");
  if (serverError) {
    throw new Error(serverError);
  }
}

async function signOutBrowserClient(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function runSignOut(): Promise<void> {
  await signOutServerCookies();
  await signOutBrowserClient();
}

/**
 * Serialized sign-out — server cookies first, then browser client.
 * Avoids duplicate concurrent signOut calls that worsen GoTrue lock contention.
 */
export async function signOutSafely(): Promise<{ ok: boolean; note?: string }> {
  if (signOutInFlight) return signOutInFlight;

  signOutInFlight = (async () => {
    try {
      await Promise.race([
        runSignOut(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("signOut timeout")), SIGN_OUT_TIMEOUT_MS)
        ),
      ]);
      return { ok: true };
    } catch (e) {
      try {
        await signOutBrowserClient();
      } catch {
        /* best-effort client clear after server/timeout failure */
      }
      return {
        ok: true,
        note: e instanceof Error ? e.message : "signOut failed",
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
