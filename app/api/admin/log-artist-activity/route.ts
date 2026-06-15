import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireAdminApi } from "@/lib/api-admin-auth";

/**
 * Append an activity_events row for a given artist (user_id), after verifying the
 * caller is an admin. Uses service role so logging works when the RPC would
 * otherwise require auth.uid() = p_user_id.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!serviceKey || !url || !anon) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const artistUserId = body.artist_user_id != null ? String(body.artist_user_id) : "";
    const type = body.type != null ? String(body.type) : "activity";
    const message = body.message != null ? String(body.message) : "";
    const artworkId = body.artwork_id != null ? String(body.artwork_id) : null;
    const metadata = body.metadata ?? null;

    if (!artistUserId || !message) {
      return NextResponse.json(
        { error: "Missing artist_user_id or message" },
        { status: 400 }
      );
    }

    const adminSession = await requireAdminApi(req);
    let authorized = adminSession.ok;

    if (!authorized) {
      const authHeader = req.headers.get("authorization") ?? "";
      let user: { id: string } | null = null;
      if (authHeader.toLowerCase().startsWith("bearer ")) {
        const tokenClient = createClient(url, anon, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data, error } = await tokenClient.auth.getUser();
        if (!error && data?.user) {
          user = data.user as { id: string };
        }
      } else {
        const cookieStore = await cookies();
        const cookieClient = createServerClient(url, anon, {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        });
        const { data, error } = await cookieClient.auth.getUser();
        if (!error && data?.user) {
          user = data.user as { id: string };
        }
      }

      if (user) {
        const admin = createClient(url, serviceKey);
        const { data: profile } = await admin
          .from("artists")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        authorized = profile?.is_admin === true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createClient(url, serviceKey);
    const { error } = await admin.rpc("log_activity_event", {
      p_user_id: artistUserId,
      p_type: type,
      p_message: message,
      p_artwork_id: artworkId,
      p_metadata: metadata,
    });

    if (error) {
      console.error("[log-artist-activity]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
