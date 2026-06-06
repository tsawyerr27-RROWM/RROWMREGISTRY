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

type BriefPatchBody = {
  title?: string;
  description?: string | null;
  sector?: string;
  practices_required?: string[];
  brief_type?: BriefType;
  participation_mode?: ParticipationMode;
  programme_id?: string | null;
  opens_at?: string | null;
  closes_at?: string | null;
  registry_outcome_required?: boolean;
  registry_outcome_copy?: string | null;
};

function normalizePractices(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((v) => String(v).trim()).filter(isPracticeSlug))];
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const briefId = String(id || "").trim();
  if (!briefId) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  let body: BriefPatchBody;
  try {
    body = (await req.json()) as BriefPatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

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

  const patch: Record<string, unknown> = {};

  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.description !== undefined) {
    patch.description = body.description ? String(body.description).trim() : null;
  }
  if (body.sector !== undefined) {
    const sector = String(body.sector).trim();
    if (!isCulturalSectorSlug(sector)) {
      return NextResponse.json({ error: "Invalid sector." }, { status: 400 });
    }
    patch.sector = sector;
  }
  if (body.practices_required !== undefined) {
    patch.practices_required = normalizePractices(body.practices_required);
  }
  if (body.brief_type !== undefined) {
    if (!isBriefType(body.brief_type)) {
      return NextResponse.json({ error: "Invalid brief_type." }, { status: 400 });
    }
    patch.brief_type = body.brief_type;
  }
  if (body.participation_mode !== undefined) {
    if (!isParticipationMode(body.participation_mode)) {
      return NextResponse.json({ error: "Invalid participation_mode." }, { status: 400 });
    }
    patch.participation_mode = body.participation_mode;
  }
  if (body.programme_id !== undefined) patch.programme_id = body.programme_id;
  if (body.opens_at !== undefined) patch.opens_at = body.opens_at;
  if (body.closes_at !== undefined) patch.closes_at = body.closes_at;
  if (body.registry_outcome_required !== undefined) {
    patch.registry_outcome_required = Boolean(body.registry_outcome_required);
  }
  if (body.registry_outcome_copy !== undefined) {
    patch.registry_outcome_copy = body.registry_outcome_copy?.trim() || null;
  }

  const { data, error } = await supabase
    .from("field_briefs")
    .update(patch)
    .eq("id", briefId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ brief: data });
}

export async function DELETE(_req: Request, context: RouteContext) {
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

  const { error } = await supabase.from("field_briefs").delete().eq("id", briefId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
