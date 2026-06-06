import { NextResponse } from "next/server";

import { requireGalleryStaff, resolveStaffGalleryId } from "@/lib/gallery-staff-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || "programme";
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const resolved = await resolveStaffGalleryId(supabase);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { data, error } = await supabase
    .from("field_programmes")
    .select("*")
    .eq("gallery_id", resolved.galleryId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ programmes: data ?? [] });
}

type ProgrammeBody = {
  gallery_id?: string;
  title?: string;
  description?: string;
  slug?: string;
};

export async function POST(req: Request) {
  let body: ProgrammeBody;
  try {
    body = (await req.json()) as ProgrammeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const galleryId = String(body.gallery_id || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim() || null;
  const slug = String(body.slug || slugifyTitle(title)).trim() || slugifyTitle(title);

  if (!galleryId || !title) {
    return NextResponse.json({ error: "Missing gallery_id or title." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const staff = await requireGalleryStaff(supabase, galleryId);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data, error } = await supabase
    .from("field_programmes")
    .insert({
      gallery_id: galleryId,
      title,
      description,
      slug,
      visibility_state: "draft",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ programme: data });
}
