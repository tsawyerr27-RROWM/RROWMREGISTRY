import { NextResponse } from "next/server";

import { canTransitionDealStatus, isDealStatus } from "@/lib/deal-status";
import {
  canActorAcceptDealTerms,
  canActorRespondToDealTerms,
  otherDealParticipant,
} from "@/lib/deal-permissions";
import { mapDealMessageRow, mapDealRevisionRow, mapDealRow } from "@/lib/deals";
import { notifyDealStatusChanged } from "@/lib/notification-hooks/deals";
import {
  onDealAccepted,
  onDealCancelled,
} from "@/lib/deal-lifecycle-engine";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const dealId = String(id ?? "").trim();
  if (!dealId) return badRequest("Missing deal id.");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: dealRow, error: dealError } = await supabase
    .from("deals")
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .eq("id", dealId)
    .maybeSingle();

  if (dealError) {
    return NextResponse.json({ error: dealError.message }, { status: 500 });
  }
  if (!dealRow) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  // Messages are optional; this endpoint returns both so the engine can be wired later.
  const { data: msgRows, error: msgError } = await supabase
    .from("deal_messages")
    .select("id, deal_id, sender_user_id, body, metadata, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  const { data: revisionRows, error: revisionError } = await supabase
    .from("deal_revisions")
    .select(
      "id, deal_id, revision_number, created_by_user_id, terms, summary, created_at"
    )
    .eq("deal_id", dealId)
    .order("revision_number", { ascending: false })
    .limit(50);

  if (revisionError) {
    return NextResponse.json({ error: revisionError.message }, { status: 500 });
  }

  return NextResponse.json({
    deal: mapDealRow(dealRow as Record<string, unknown>),
    messages: (msgRows ?? []).map((r) => mapDealMessageRow(r as Record<string, unknown>)),
    revisions: (revisionRows ?? []).map((r) =>
      mapDealRevisionRow(r as Record<string, unknown>)
    ),
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const dealId = String(id ?? "").trim();
  if (!dealId) return badRequest("Missing deal id.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  if (!body || typeof body !== "object") return badRequest("Invalid body");
  const o = body as Record<string, unknown>;

  const nextStatusRaw = o.status ?? o.next_status ?? o.nextStatus;
  const nextStatus = String(nextStatusRaw ?? "").trim();
  if (!nextStatus) return badRequest("Missing status.");
  if (!isDealStatus(nextStatus)) return badRequest("Invalid deal status.");

  // Explicitly disallow participant edits via this route.
  if (
    o.participant_a_user_id != null ||
    o.participant_b_user_id != null ||
    o.participantAUserId != null ||
    o.participantBUserId != null ||
    o.type != null
  ) {
    return badRequest("Participant/type changes are not supported.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: loadError } = await supabase
    .from("deals")
    .select(
      "id, status, created_by_user_id, participant_a_user_id, participant_b_user_id, updated_at"
    )
    .eq("id", dealId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const participantA = String((existing as any).participant_a_user_id ?? "");
  const participantB = String((existing as any).participant_b_user_id ?? "");

  const other = otherDealParticipant({
    userId: user.id,
    participantAUserId: participantA,
    participantBUserId: participantB,
  });
  if (!other) {
    // RLS should prevent this, but keep a clearer response.
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fromStatus = String((existing as any).status ?? "").trim();
  if (!isDealStatus(fromStatus)) {
    return NextResponse.json({ error: "Deal status is invalid." }, { status: 500 });
  }

  if (!canTransitionDealStatus(fromStatus, nextStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition (${fromStatus} → ${nextStatus}).` },
      { status: 409 }
    );
  }

  if (nextStatus === "accepted" || nextStatus === "rejected") {
    let latestRevisionCreatedByUserId: string | null = null;
    if (fromStatus === "countered") {
      const { data: latestRevision, error: revisionError } = await supabase
        .from("deal_revisions")
        .select("created_by_user_id")
        .eq("deal_id", dealId)
        .order("revision_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (revisionError) {
        return NextResponse.json({ error: revisionError.message }, { status: 500 });
      }

      latestRevisionCreatedByUserId = String(
        (latestRevision as { created_by_user_id?: string } | null)?.created_by_user_id ??
          ""
      ).trim();
    }

    const createdByUserId = String((existing as { created_by_user_id?: string }).created_by_user_id ?? "");
    const authArgs = {
      actorUserId: user.id,
      dealStatus: fromStatus,
      participantAUserId: participantA,
      participantBUserId: participantB,
      createdByUserId,
      latestRevisionCreatedByUserId,
    };

    const allowed =
      nextStatus === "accepted"
        ? canActorAcceptDealTerms(authArgs)
        : canActorRespondToDealTerms(authArgs);

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("deals")
    .update({ status: nextStatus, updated_at: now })
    .eq("id", dealId)
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Could not update deal." },
      { status: 400 }
    );
  }

  void notifyDealStatusChanged({
    dealId,
    actorUserId: user.id,
    fromStatus,
    toStatus: nextStatus,
  });

  const mappedDeal = mapDealRow(updated as Record<string, unknown>);
  const service = createSupabaseServiceClient();

  if (nextStatus === "accepted") {
    void onDealAccepted({
      deal: mappedDeal,
      actorUserId: user.id,
      fromStatus,
      clients: { service, user: supabase },
    });
  }

  if (nextStatus === "cancelled") {
    void onDealCancelled({
      deal: mappedDeal,
      actorUserId: user.id,
      fromStatus,
      clients: { service, user: supabase },
    });
  }

  return NextResponse.json({ deal: mappedDeal });
}

