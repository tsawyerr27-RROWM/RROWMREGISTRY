import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anon || !serviceKey) {
      return NextResponse.json({ isAdmin: false });
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
        return NextResponse.json({ isAdmin: false });
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
              /* read-only context */
            }
          },
        },
      });
      const { data, error } = await cookieClient.auth.getUser();
      if (error || !data?.user) {
        return NextResponse.json({ isAdmin: false });
      }
      userId = data.user.id;
      userEmail = String(data.user.email || "").toLowerCase();
    }

    const adminEmails = process.env.ADMIN_EMAILS?.trim();
    if (adminEmails) {
      const allowlist = new Set(
        adminEmails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
      );
      if (allowlist.has(userEmail)) {
        return NextResponse.json({ isAdmin: true });
      }
    }

    const service = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profile } = await service
      .from("artists")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();

    return NextResponse.json({ isAdmin: Boolean(profile?.is_admin) });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
