"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

const AUTH_STORAGE_MODE_KEY = "rrowm_auth_storage_mode";

type StorageMode = "local" | "session";

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

function getPreferredStorageMode(): StorageMode {
  if (typeof window === "undefined") return "local";

  try {
    const sessionPref = window.sessionStorage.getItem(AUTH_STORAGE_MODE_KEY);
    if (sessionPref === "session") return "session";
  } catch {}

  try {
    const localPref = window.localStorage.getItem(AUTH_STORAGE_MODE_KEY);
    if (localPref === "session") return "session";
    if (localPref === "local") return "local";
  } catch {}

  return "local";
}

const hybridAuthStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;

    try {
      const fromSession = window.sessionStorage.getItem(key);
      if (fromSession !== null) return fromSession;
    } catch {}

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;

    const mode = getPreferredStorageMode();

    if (mode === "session") {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {}
      try {
        window.localStorage.removeItem(key);
      } catch {}
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {}

    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  },

  removeItem(key: string) {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(key);
    } catch {}

    try {
      window.sessionStorage.removeItem(key);
    } catch {}
  },
};

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
    browserClient = createBrowserClient(url, key, {
      auth: {
        storage: hybridAuthStorage,
        persistSession: true,
      },
    });
  }

  return browserClient;
}

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;

  const mode: StorageMode = remember ? "local" : "session";

  try {
    if (mode === "session") {
      window.sessionStorage.setItem(AUTH_STORAGE_MODE_KEY, "session");
      window.localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
    } else {
      window.localStorage.setItem(AUTH_STORAGE_MODE_KEY, "local");
      window.sessionStorage.removeItem(AUTH_STORAGE_MODE_KEY);
    }
  } catch {}

  let storageKey: string | undefined;

  try {
    const supabase = getSupabaseBrowserClient();
    storageKey = (supabase.auth as any)?.storageKey;
  } catch {}

  if (!storageKey) return;

  try {
    const sessionVal = window.sessionStorage.getItem(storageKey);
    const localVal = window.localStorage.getItem(storageKey);

    if (mode === "session") {
      if (localVal && !sessionVal) {
        window.sessionStorage.setItem(storageKey, localVal);
      }
      window.localStorage.removeItem(storageKey);
    } else {
      if (sessionVal && !localVal) {
        window.localStorage.setItem(storageKey, sessionVal);
      }
      window.sessionStorage.removeItem(storageKey);
    }
  } catch {}
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