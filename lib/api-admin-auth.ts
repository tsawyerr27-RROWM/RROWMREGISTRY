import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AdminApiContext = {
  service: SupabaseClient;
};

/**
 * Verifies that the caller has a valid admin session cookie
 * (set by POST /api/admin/login). Returns a service-role Supabase client.
 */
export async function requireAdminApi(
  _req: Request
): Promise<
  { ok: true; ctx: AdminApiContext } | { ok: false; status: number; error: string }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, status: 500, error: "Server misconfiguration" };
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("rrowm_admin_session");

  if (!session?.value) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { ok: true, ctx: { service } };
}

/**
 * Supabase client scoped to the caller (cookie or Bearer).
 * Use for RPCs that rely on auth.uid().
 */
export async function createUserSupabaseClient(
  req: Request
): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
  }

  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}
