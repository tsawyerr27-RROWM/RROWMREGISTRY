import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

/** Artist opt-in for appearing on institutional public pages (gallery must publish separately). */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!actor || actor.role !== "artist") {
    return NextResponse.json({ error: "Artist profile required." }, { status: 403 });
  }

  const service = createSupabaseServiceClient();
  const { data: row } = await service
    .from("artists")
    .select("shown_on_institutional_public")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    enabled: Boolean(row?.shown_on_institutional_public),
  });
}

export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw =
    body && typeof body === "object"
      ? (body as { enabled?: unknown }).enabled
      : undefined;

  if (typeof raw !== "boolean") {
    return NextResponse.json({ error: "Missing enabled boolean" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role, onboarding_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!actor || actor.role !== "artist" || !actor.onboarding_complete) {
    return NextResponse.json(
      { error: "Available after you finish artist onboarding." },
      { status: 403 }
    );
  }

  const service = createSupabaseServiceClient();

  const { error: updErr } = await service
    .from("artists")
    .update({ shown_on_institutional_public: raw })
    .eq("id", user.id);

  if (updErr) {
    console.error("[artist/public-visibility] update", updErr);
    return NextResponse.json(
      { error: "Could not update preference." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, enabled: raw });
}
