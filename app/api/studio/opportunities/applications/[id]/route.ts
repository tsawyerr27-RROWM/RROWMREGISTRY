import { NextResponse } from "next/server";

import {
  isOpportunityApplicationStatus,
  type OpportunityApplicationStatus,
} from "@/lib/field-opportunity-applications";
import { requireGalleryStaff } from "@/lib/gallery-staff-auth";
import { notifyOpportunityApplicationStatusChange } from "@/lib/notification-hooks/opportunities";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type PatchBody = {
  status?: OpportunityApplicationStatus;
};

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const applicationId = String(id || "").trim();
  if (!applicationId) {
    return NextResponse.json({ error: "Missing application id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextStatus = body.status;
  if (!nextStatus || !isOpportunityApplicationStatus(nextStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: application, error: applicationError } = await supabase
    .from("field_opportunity_applications")
    .select("id, opportunity_id, applicant_user_id, status")
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError) {
    return NextResponse.json({ error: applicationError.message }, { status: 500 });
  }

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const { data: brief, error: briefError } = await supabase
    .from("field_briefs")
    .select("gallery_id, title")
    .eq("id", application.opportunity_id)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief?.gallery_id) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const staff = await requireGalleryStaff(supabase, brief.gallery_id);
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const previousStatus = String(application.status ?? "submitted");

  const reviewedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("field_opportunity_applications")
    .update({
      status: nextStatus,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
    })
    .eq("id", applicationId)
    .select("id, status, reviewed_at, reviewed_by, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  void notifyOpportunityApplicationStatusChange({
    applicantUserId: String(application.applicant_user_id),
    opportunityId: String(application.opportunity_id),
    applicationId: String(application.id),
    opportunityTitle: String(brief.title ?? ""),
    previousStatus,
    nextStatus,
  });

  return NextResponse.json({ application: data });
}
