"use client";

import { useCallback, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

/**
 * Stable accessor for the browser Supabase client. The client is created on first
 * invocation (not during render), so it is safe while the component tree is still
 * SSR/hydrating — call only from effects, handlers, or async work after mount.
 */
export function useSupabaseBrowserLazy(): () => SupabaseClient {
  const ref = useRef<SupabaseClient | null>(null);
  return useCallback(() => {
    if (!ref.current) {
      ref.current = getSupabaseBrowserClient();
    }
    return ref.current!;
  }, []);
}
