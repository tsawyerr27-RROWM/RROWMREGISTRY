import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cookie-free anon Supabase client for global, public, cacheable data
 * (e.g. Field signature counts). Never reads request cookies, so it is
 * safe inside `unstable_cache` / static contexts. Do NOT use for
 * user-scoped reads — RLS will treat every query as anonymous.
 */
export function getSupabaseAnonServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[RROWM] Missing Supabase env for anon server client");
    return null;
  }
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
