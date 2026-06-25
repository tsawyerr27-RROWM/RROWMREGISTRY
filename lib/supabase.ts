"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

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
 * Browser-only Supabase client (safe for Next.js build + SSR)
 */
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("[RROWM] Supabase browser client requested on the server.");
  }

  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    console.warn("[RROWM] Missing Supabase env in browser");
    return null as any;
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
