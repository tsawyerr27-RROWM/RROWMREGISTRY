import { NextResponse } from "next/server";

import {
  normalizeOpportunityApplicationStatement,
  type OpportunityApplicationRow,
} from "@/lib/field-opportunity-applications";
import { isOpportunityAcceptingResponses } from "@/lib/field-opportunity-params";
import { requireCreativeAccount } from "@/lib/require-creative-account";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type ApplyBody = {
  statement_text?: string;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const opportunityId = String(id || "").trim();
  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunity id." }, { status: 400 });
  }

  let body: ApplyBody;
  try {
    body = (await req.json()) as ApplyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const statementText = normalizeOpportunityApplicationStatement(
    body.statement_text
  );
  if (!statementText) {
    return NextResponse.json(
      { error: "Statement of interest is required." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const creative = await requireCreativeAccount(supabase);
  if (!creative.ok) {
    return NextResponse.json({ error: creative.error }, { status: creative.status });
  }

  const { data: brief, error: briefError } = await supabase
    .from("field_briefs")
    .select(
      "id, visibility_state, participation_mode, opens_at, closes_at, galleries(verified)"
    )
    .eq("id", opportunityId)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const gallery = brief.galleries as { verified?: boolean } | null;
  if (
    brief.visibility_state !== "published" ||
    brief.participation_mode !== "open" ||
    !gallery?.verified
  ) {
    return NextResponse.json(
      { error: "This opportunity is not accepting applications." },
      { status: 403 }
    );
  }

  if (
    !isOpportunityAcceptingResponses({
      opensAt: brief.opens_at,
      closesAt: brief.closes_at,
    })
  ) {
    return NextResponse.json(
      { error: "This opportunity is closed." },
      { status: 403 }
    );
  }

  const { data: existing } = await supabase
    .from("field_opportunity_applications")
    .select("id")
    .eq("opportunity_id", opportunityId)
    .eq("applicant_user_id", creative.creative.user.id)
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json(
      { error: "You have already applied to this opportunity." },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("field_opportunity_applications")
    .insert({
      opportunity_id: opportunityId,
      applicant_user_id: creative.creative.user.id,
      applicant_actor_id: creative.creative.user.id,
      status: "submitted",
      statement_text: statementText,
    })
    .select("id, status, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already applied to this opportunity." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    application: data as Pick<
      OpportunityApplicationRow,
      "id" | "status" | "created_at" | "updated_at"
    >,
  });
}
