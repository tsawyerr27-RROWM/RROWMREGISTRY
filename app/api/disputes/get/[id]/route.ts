import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** Private dispute view (creator only via RLS). */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const disputeId = String(id || "").trim();
  if (!disputeId) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("disputes")
    .select(
      "id, created_at, target_type, target_id, reason, details, status, resolution, resolved_at"
    )
    .eq("id", disputeId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, dispute: row });
}

