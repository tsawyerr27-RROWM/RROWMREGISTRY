import { NextResponse } from "next/server";

import { isCulturalSectorSlug } from "@/lib/cultural-sectors";
import { requireGalleryStaff } from "@/lib/gallery-staff-auth";
import {
  isBriefType,
  isParticipationMode,
  type BriefType,
  type ParticipationMode,
} from "@/lib/opportunity-types";
import { isPracticeSlug } from "@/lib/practice-types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type BriefBody = {
  gallery_id?: string;
  programme_id?: string | null;
  title?: string;
  description?: string;
  sector?: string;
  practices_required?: string[];
  brief_type?: BriefType;
  participation_mode?: ParticipationMode;
  opens_at?: string | null;
  closes_at?: string | null;
  registry_outcome_required?: boolean;
  registry_outcome_copy?: string | null;
};

function normalizePractices(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((v) => String(v).trim()).filter(isPracticeSlug))];
}

export async function GET(req: Request) {
  const galleryId = new URL(req.url).searchParams.get("gallery_id")?.trim() || "";
  if (!galleryId) {
    return NextResponse.json({ error: "Missing gallery_id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const staff = await requireGalleryStaff(supabase, galleryId);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data, error } = await supabase
    .from("field_briefs")
    .select("*, field_programmes(id, title, slug)")
    .eq("gallery_id", galleryId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ briefs: data ?? [] });
}

export async function POST(req: Request) {
  let body: BriefBody;
  try {
    body = (await req.json()) as BriefBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const galleryId = String(body.gallery_id || "").trim();
  const title = String(body.title || "").trim();
  const sector = String(body.sector || "").trim();
  const briefType = body.brief_type;
  const participationMode = body.participation_mode ?? "open";

  if (!galleryId || !title || !sector || !briefType) {
    return NextResponse.json(
      { error: "Missing gallery_id, title, sector, or brief_type." },
      { status: 400 }
    );
  }

  if (!isCulturalSectorSlug(sector)) {
    return NextResponse.json({ error: "Invalid sector." }, { status: 400 });
  }

  if (!isBriefType(briefType)) {
    return NextResponse.json({ error: "Invalid brief_type." }, { status: 400 });
  }

  if (!isParticipationMode(participationMode)) {
    return NextResponse.json({ error: "Invalid participation_mode." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const staff = await requireGalleryStaff(supabase, galleryId);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data, error } = await supabase
    .from("field_briefs")
    .insert({
      gallery_id: galleryId,
      programme_id: body.programme_id || null,
      title,
      description: String(body.description || "").trim() || null,
      sector,
      practices_required: normalizePractices(body.practices_required),
      brief_type: briefType,
      participation_mode: participationMode,
      visibility_state: "draft",
      opens_at: body.opens_at || null,
      closes_at: body.closes_at || null,
      registry_outcome_required: Boolean(body.registry_outcome_required),
      registry_outcome_copy: body.registry_outcome_copy?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ brief: data });
}
