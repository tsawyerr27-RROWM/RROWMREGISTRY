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
    .select("gallery_id, sector, title")
    .eq("id", briefId)
    .maybeSingle();

  if (loadErr || !existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const staff = await requireGalleryStaff(supabase, String(existing.gallery_id));
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data: gallery, error: galleryErr } = await supabase
    .from("galleries")
    .select("verified")
    .eq("id", existing.gallery_id)
    .maybeSingle();

  if (galleryErr || !gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  if (!gallery.verified) {
    return NextResponse.json(
      { error: "Verified organisation required to publish to Field." },
      { status: 403 }
    );
  }

  if (!existing.sector || !existing.title?.trim()) {
    return NextResponse.json(
      { error: "Title and sector required before publish." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("field_briefs")
    .update({
      visibility_state: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", briefId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ brief: data });
}
