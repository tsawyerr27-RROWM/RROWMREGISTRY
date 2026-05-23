import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client (service role). Use only from trusted server contexts (Route Handlers).
 * Never expose the service key to the browser.
 */
export function createSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "[RROWM] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service client."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Same as {@link createSupabaseServiceClient} but returns null when env is not configured. */
export function tryCreateSupabaseServiceClient(): SupabaseClient | null {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}
