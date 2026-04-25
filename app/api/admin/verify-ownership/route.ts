import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    const eventId = body.eventId != null ? String(body.eventId) : "";
    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") ?? "";

    let user: { id: string } | null = null;
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      const tokenClient = createClient(url, anon, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await tokenClient.auth.getUser();
      if (error || !data?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user as { id: string };
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
      if (error || !data?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user as { id: string };
    }

    const admin = createClient(url, serviceKey);
    const { data: profile } = await admin
      .from("artists")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin.rpc("ownership_admin_verify", {
      p_event_id: eventId,
      p_method: "admin",
      p_verified_by: user.id,
    });

    if (error) {
      console.error("[verify-ownership]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
