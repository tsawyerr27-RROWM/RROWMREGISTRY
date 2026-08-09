"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve env ONLY at runtime (never at module scope)
 */
function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { url: null, key: null };
  }

  return { url, key };
}

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | null = null;

/**
 * Browser-only Supabase client (safe for Next.js build + SSR).
 *
 * Throws on misconfiguration instead of returning `null` — a null client used
 * to be laundered through callers and blow up later as
 * `Cannot read properties of null (reading 'auth')`, white-screening every page
 * via the global Header. Failing fast here keeps the type honest (always a real
 * client) so no caller needs a non-null assertion. Callers that must tolerate a
 * missing client (e.g. the Header auth subscription) should catch this.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("[RROWM] Supabase browser client requested on the server.");
  }

  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    throw new Error(
      "[RROWM] Supabase browser client unavailable: missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}

/**
 * Safe session getter (never crashes SSR)
 */
export async function getSessionSafe(): Promise<Session | null> {
  if (typeof window === "undefined") return null;

  const { url, key } = getSupabaseEnv();
  if (!url || !key) return null;

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RROWM] getSession:", error.message);
      }
      return null;
    }

    return data.session ?? null;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[RROWM] getSession failed:", e);
    }
    return null;
  }
}
