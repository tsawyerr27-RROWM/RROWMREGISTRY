import { NextResponse } from "next/server";

import {
  canTransitionDealStatus,
  isDealStatus,
  isNegotiableDealStatus,
} from "@/lib/deal-status";
import {
  canActorRespondToDealTerms,
  otherDealParticipant,
} from "@/lib/deal-permissions";
import { mapDealMessageRow, mapDealRevisionRow, mapDealRow } from "@/lib/deals";
import {
  notifyDealMessageReceived,
  notifyDealStatusChanged,
} from "@/lib/notification-hooks/deals";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function previewBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137)}...`;
}

export async function POST(
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

  const summary = o.summary != null ? String(o.summary).trim() : "";
  const nextTerms =
    o.terms && typeof o.terms === "object" && !Array.isArray(o.terms)
      ? (o.terms as Record<string, unknown>)
      : null;

  if (!nextTerms || Object.keys(nextTerms).length === 0) {
    return badRequest("Updated terms are required.");
  }
  if (summary.length > 2000) {
    return badRequest("Revision summary is too long.");
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
      "id, status, type, terms, created_by_user_id, participant_a_user_id, participant_b_user_id, updated_at"
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fromStatus = String((existing as any).status ?? "").trim();
  if (!isDealStatus(fromStatus)) {
    return NextResponse.json({ error: "Deal status is invalid." }, { status: 500 });
  }
  if (!isNegotiableDealStatus(fromStatus)) {
    return NextResponse.json(
      { error: "Counterproposals are not available in the current status." },
      { status: 409 }
    );
  }

  let latestRevisionCreatedByUserId: string | null = null;
  if (fromStatus === "countered") {
    const { data: latestRevision, error: latestRevisionError } = await supabase
      .from("deal_revisions")
      .select("created_by_user_id")
      .eq("deal_id", dealId)
      .order("revision_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestRevisionError) {
      return NextResponse.json({ error: latestRevisionError.message }, { status: 500 });
    }

    latestRevisionCreatedByUserId = String(
      (latestRevision as { created_by_user_id?: string } | null)?.created_by_user_id ??
        ""
    ).trim();
  }

  const createdByUserId = String((existing as { created_by_user_id?: string }).created_by_user_id ?? "");
  if (
    !canActorRespondToDealTerms({
      actorUserId: user.id,
      dealStatus: fromStatus,
      participantAUserId: participantA,
      participantBUserId: participantB,
      createdByUserId,
      latestRevisionCreatedByUserId,
    })
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const toStatus = "countered";
  if (!canTransitionDealStatus(fromStatus, toStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition (${fromStatus} → ${toStatus}).` },
      { status: 409 }
    );
  }

  const currentTerms =
    (existing as any).terms &&
    typeof (existing as any).terms === "object" &&
    !Array.isArray((existing as any).terms)
      ? ((existing as any).terms as Record<string, unknown>)
      : {};

  const { data: latestRevision, error: revisionLoadError } = await supabase
    .from("deal_revisions")
    .select("revision_number")
    .eq("deal_id", dealId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (revisionLoadError) {
    return NextResponse.json({ error: revisionLoadError.message }, { status: 500 });
  }

  const nextRevisionNumber =
    Number((latestRevision as { revision_number?: number } | null)?.revision_number ?? 0) +
    1;

  const now = new Date().toISOString();

  const { data: revisionRow, error: revisionError } = await supabase
    .from("deal_revisions")
    .insert({
      deal_id: dealId,
      revision_number: nextRevisionNumber,
      created_by_user_id: user.id,
      terms: currentTerms,
      summary: summary || null,
      created_at: now,
    })
    .select(
      "id, deal_id, revision_number, created_by_user_id, terms, summary, created_at"
    )
    .single();

  if (revisionError || !revisionRow) {
    return NextResponse.json(
      { error: revisionError?.message ?? "Could not record revision." },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("deals")
    .update({
      terms: nextTerms,
      status: toStatus,
      updated_at: now,
    })
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

  if (fromStatus !== toStatus) {
    void notifyDealStatusChanged({
      dealId,
      actorUserId: user.id,
      fromStatus,
      toStatus,
    });
  }

  let message = null;
  const ledgerBody =
    summary ||
    `Counterproposal recorded as revision ${nextRevisionNumber}.`;

  const { data: messageRow, error: messageError } = await supabase
    .from("deal_messages")
    .insert({
      deal_id: dealId,
      sender_user_id: user.id,
      body: ledgerBody,
      metadata: {
        kind: "counterproposal",
        revision_number: nextRevisionNumber,
      },
    })
    .select("id, deal_id, sender_user_id, body, metadata, created_at")
    .single();

  if (!messageError && messageRow) {
    message = mapDealMessageRow(messageRow as Record<string, unknown>);
    void notifyDealMessageReceived({
      dealId,
      senderUserId: user.id,
      preview: previewBody(ledgerBody),
    });
  }

  return NextResponse.json({
    deal: mapDealRow(updated as Record<string, unknown>),
    revision: mapDealRevisionRow(revisionRow as Record<string, unknown>),
    message,
  });
}
