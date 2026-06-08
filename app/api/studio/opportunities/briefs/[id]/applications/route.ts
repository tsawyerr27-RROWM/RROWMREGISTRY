import { NextResponse } from "next/server";

import type { OrganisationOpportunityApplicationListItem } from "@/lib/field-opportunity-applications";
import { requireGalleryStaff } from "@/lib/gallery-staff-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const briefId = String(id || "").trim();
  if (!briefId) {
    return NextResponse.json({ error: "Missing brief id." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: brief, error: briefError } = await supabase
    .from("field_briefs")
    .select("id, gallery_id")
    .eq("id", briefId)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const staff = await requireGalleryStaff(supabase, brief.gallery_id);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const service = createSupabaseServiceClient();
  const { data: rows, error } = await service
    .from("field_opportunity_applications")
    .select("id, status, created_at, applicant_user_id")
    .eq("opportunity_id", briefId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const applicantIds = [...new Set((rows ?? []).map((row) => row.applicant_user_id))];
  const actorByUserId = new Map<
    string,
    { display_name: string | null; role: string | null }
  >();

  if (applicantIds.length > 0) {
    const { data: actors, error: actorsError } = await service
      .from("actor_profiles")
      .select("user_id, display_name, role")
      .in("user_id", applicantIds);

    if (actorsError) {
      return NextResponse.json({ error: actorsError.message }, { status: 500 });
    }

    for (const actor of actors ?? []) {
      actorByUserId.set(actor.user_id, {
        display_name:
          typeof actor.display_name === "string" ? actor.display_name : null,
        role: typeof actor.role === "string" ? actor.role : null,
      });
    }
  }

  const applications: OrganisationOpportunityApplicationListItem[] = (rows ?? []).map(
    (row) => {
      const actor = actorByUserId.get(row.applicant_user_id);
      const name = String(actor?.display_name || "").trim() || "Applicant";
      return {
        id: row.id,
        applicant_name: name,
        applicant_role: String(actor?.role || "artist"),
        status: row.status as OrganisationOpportunityApplicationListItem["status"],
        created_at: row.created_at,
      };
    }
  );

  return NextResponse.json({ applications });
}
