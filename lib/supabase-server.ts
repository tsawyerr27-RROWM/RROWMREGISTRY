import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 🔒 Hard guard for build-time + misconfigured env
  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  /**
   * During static generation (eg Next prerendering `/_not-found`) there is no request,
   * and `cookies()` throws. In that context we still want an anon Supabase client so
   * public pages can build, but we MUST NOT touch request cookies.
   */
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    cookieStore = null;
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore?.getAll() ?? [];
      },
      setAll(cookiesToSet) {
        try {
          if (!cookieStore) return;
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In some server contexts (like static generation), cookies cannot be set.
        }
      },
    },
  });
}