import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "[RROWM] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local (Supabase Project Settings → API)."
  );
}

const AUTH_STORAGE_MODE_KEY = "rrowm_auth_storage_mode"; // "local" | "session"

type StorageMode = "local" | "session";

function getPreferredStorageMode(): StorageMode {
  if (typeof window === "undefined") return "local";
  try {
    const sessionPref = window.sessionStorage.getItem(AUTH_STORAGE_MODE_KEY);
    if (sessionPref === "session") return "session";
  } catch {
    /* ignore */
  }
  try {
    const localPref = window.localStorage.getItem(AUTH_STORAGE_MODE_KEY);
    if (localPref === "session") return "session";
    if (localPref === "local") return "local";
  } catch {
    /* ignore */
  }
  return "local";
}

const hybridAuthStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    try {
      const fromSession = window.sessionStorage.getItem(key);
      if (fromSession !== null) return fromSession;
    } catch {
      /* ignore */
    }
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
      } catch {
        /* ignore */
      }
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const supabase = createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: hybridAuthStorage,
    persistSession: true,
  },
});

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
  } catch {
    /* ignore */
  }

  // Best-effort migrate any existing auth payload to the preferred storage.
  // This keeps the app consistent when toggling remember-me between sessions.
  const storageKey = (supabase.auth as unknown as { storageKey?: string }).storageKey;
  if (!storageKey) return;

  try {
    const sessionVal = window.sessionStorage.getItem(storageKey);
    const localVal = window.localStorage.getItem(storageKey);
    if (mode === "session") {
      if (localVal && !sessionVal) window.sessionStorage.setItem(storageKey, localVal);
      window.localStorage.removeItem(storageKey);
    } else {
      if (sessionVal && !localVal) window.localStorage.setItem(storageKey, sessionVal);
      window.sessionStorage.removeItem(storageKey);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Safe session read for the browser. `getSession()` can reject with
 * `TypeError: Failed to fetch` when offline, blocked, or misconfigured — that
 * must not surface as an unhandled rejection in the console.
 */
export async function getSessionSafe(): Promise<Session | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
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
