import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AdminApiContext = {
  userId: string;
  email: string;
  service: SupabaseClient;
};

/**
 * Parsed allowlist from ADMIN_EMAILS env var.
 * Comma-separated, lowercased, trimmed. If unset, falls back to DB-only check.
 */
function adminEmailAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return null;
  const emails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.length > 0 ? new Set(emails) : null;
}

/**
 * Supabase client scoped to the caller (cookie or Bearer). Use for RPCs that rely on auth.uid().
 */
export async function createUserSupabaseClient(req: Request): Promise<SupabaseClient | null> {
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
        } catch {
          /* ignore */
        }
      },
    },
  });
}

/**
 * Authenticated request + service-role client + admin verification.
 * Two-layer check: DB `artists.is_admin` AND ADMIN_EMAILS env allowlist (if set).
 */
export async function requireAdminApi(
  req: Request
): Promise<
  { ok: true; ctx: AdminApiContext } | { ok: false; status: number; error: string }
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !serviceKey) {
    return { ok: false, status: 500, error: "Server misconfiguration" };
  }

  const authHeader = req.headers.get("authorization") ?? "";
  let userId: string | null = null;
  let userEmail = "";

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const tokenClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data, error } = await tokenClient.auth.getUser();
    if (error || !data?.user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
    userId = data.user.id;
    userEmail = String(data.user.email || "").toLowerCase();
  } else {
    const cookieStore = await cookies();
    const cookieClient = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /* ignore */
          }
        },
      },
    });
    const { data, error } = await cookieClient.auth.getUser();
    if (error || !data?.user) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
    userId = data.user.id;
    userEmail = String(data.user.email || "").toLowerCase();
  }

  const allowlist = adminEmailAllowlist();
  if (allowlist && !allowlist.has(userEmail)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile } = await service
    .from("artists")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, ctx: { userId, email: userEmail, service } };
}
