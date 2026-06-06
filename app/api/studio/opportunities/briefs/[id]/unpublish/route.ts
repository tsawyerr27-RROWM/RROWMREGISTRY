import { NextResponse } from "next/server";

import { requireGalleryStaff } from "@/lib/gallery-staff-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const briefId = String(id || "").trim();

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: loadErr } = await supabase
    .from("field_briefs")
    .select("gallery_id")
    .eq("id", briefId)
    .maybeSingle();

  if (loadErr || !existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const staff = await requireGalleryStaff(supabase, String(existing.gallery_id));
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data, error } = await supabase
    .from("field_briefs")
    .update({ visibility_state: "withdrawn" })
    .eq("id", briefId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ brief: data });
}
