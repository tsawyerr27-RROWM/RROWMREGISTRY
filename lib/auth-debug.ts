"use client";

import type { Session } from "@supabase/supabase-js";

import {
  getAuthStorageMode,
  getSupabaseProjectRef,
  listSupabaseAuthStorageKeys,
} from "@/lib/auth-sign-out";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export type AuthDebugSnapshot = {
  sessionExists: boolean;
  userId: string | null;
  authStorageMode: string | null;
  localStorageAuthKeys: string[];
  sessionStorageAuthKeys: string[];
  projectRef: string | null;
  expectedStorageKey: string | null;
};

export async function loadAuthDebugSnapshot(): Promise<AuthDebugSnapshot> {
  const projectRef = getSupabaseProjectRef();
  const keys = listSupabaseAuthStorageKeys();

  let session: Session | null = null;
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    session = data.session ?? null;
  } catch {
    session = null;
  }

  return {
    sessionExists: Boolean(session),
    userId: session?.user?.id ?? null,
    authStorageMode: getAuthStorageMode(),
    localStorageAuthKeys: keys.localStorage,
    sessionStorageAuthKeys: keys.sessionStorage,
    projectRef,
    expectedStorageKey: projectRef ? `sb-${projectRef}-auth-token` : null,
  };
}
