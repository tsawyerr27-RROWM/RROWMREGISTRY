import { NextResponse } from "next/server";

import {
  buildDealExecutionPanelState,
  findDealRepresentationExecution,
  isRepresentationDealExecutable,
  mergeRepresentationExecutionIntoTerms,
  resolveDealExecution,
  type RepresentationExecutionRecord,
} from "@/lib/deal-execution";
import { onDealExecuted } from "@/lib/deal-lifecycle-engine";
import { upsertDealExecutionRecord } from "@/lib/deal-execution-records";
import { otherDealParticipant } from "@/lib/deal-permissions";
import { mapDealRow } from "@/lib/deals";
import {
  insertRepresentationRelationship,
  loadGalleryDisplayName,
  resolveRepresentationParticipants,
  validateRepresentationExecutionInput,
} from "@/lib/representation-relationships";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function loadDealContext(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  dealId: string,
  userId: string
) {
  const { data: dealRow, error } = await supabase
    .from("deals")
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .eq("id", dealId)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 as const };
  if (!dealRow) return { error: "Deal not found.", status: 404 as const };

  const deal = mapDealRow(dealRow as Record<string, unknown>);
  const participantA = String(deal.participant_a_user_id ?? "");
  const participantB = String(deal.participant_b_user_id ?? "");

  const other = otherDealParticipant({
    userId,
    participantAUserId: participantA,
    participantBUserId: participantB,
  });
  if (!other) return { error: "Forbidden", status: 403 as const };

  return { deal };
}

async function resolveRepresentationExecutionState(args: {
  deal: ReturnType<typeof mapDealRow>;
  userId: string;
  service: ReturnType<typeof createSupabaseServiceClient>;
}) {
  const { deal, userId, service } = args;

  let execution = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (execution && execution.type !== "representation" && !("relationship_id" in execution)) {
    execution = null;
  }

  const resolved = await resolveRepresentationParticipants(service, deal);
  let galleryName: string | null = null;
  let canInitiate = false;
  let reason: string | null = null;

  if (!resolved.ok) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution:
        execution && "relationship_id" in execution ? execution : null,
      registryId: null,
      artworkTitle: null,
      canInitiate: false,
      reason: resolved.reason,
      restrictToKind: "representation",
    });
  }

  const { artistUserId, galleryId } = resolved.participants;
  galleryName = await loadGalleryDisplayName(service, galleryId);

  const representationExecution =
    execution && "relationship_id" in execution ? execution : null;

  if (!representationExecution) {
    const fallback = await findDealRepresentationExecution(service, {
      dealId: deal.id,
      artistUserId,
      galleryId,
      userId,
    });
    if (fallback) {
      execution = fallback;
    }
  }

  const finalExecution =
    execution && "relationship_id" in execution ? execution : null;

  if (!isRepresentationDealExecutable(deal)) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: finalExecution,
      registryId: null,
      artworkTitle: galleryName,
      canInitiate: false,
      reason: null,
      restrictToKind: "representation",
    });
  }

  if (finalExecution?.relationship_id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: finalExecution,
      registryId: null,
      artworkTitle: galleryName,
      canInitiate: false,
      reason: null,
      restrictToKind: "representation",
    });
  }

  canInitiate = true;

  return buildDealExecutionPanelState({
    deal,
    userId,
    execution: finalExecution,
    registryId: null,
    artworkTitle: galleryName,
    canInitiate,
    reason,
    restrictToKind: "representation",
  });
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

  const loaded = await loadDealContext(supabase, dealId, user.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const service = createSupabaseServiceClient();
  const state = await resolveRepresentationExecutionState({
    deal: loaded.deal,
    userId: user.id,
    service,
  });

  return NextResponse.json(state);
}

export async function POST(
  req: Request,
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

  const blocked = await guardRegistryMutation(req, {
    actionKey: "deal_execution_representation",
    subjectKey: user.id,
    maxAttempts: 10,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const loaded = await loadDealContext(supabase, dealId, user.id);
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const deal = loaded.deal;
  if (!isRepresentationDealExecutable(deal)) {
    return NextResponse.json(
      { error: "This deal is not eligible for representation execution." },
      { status: 409 }
    );
  }

  const service = createSupabaseServiceClient();

  const existing = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (existing && "relationship_id" in existing && existing.relationship_id) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const resolved = await resolveRepresentationParticipants(service, deal);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.reason }, { status: 400 });
  }

  const { artistUserId, galleryId } = resolved.participants;

  const prior = await findDealRepresentationExecution(service, {
    dealId: deal.id,
    artistUserId,
    galleryId,
    userId: user.id,
  });
  if (prior) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  const validated = validateRepresentationExecutionInput(body);
  if (!validated.ok) {
    return badRequest(validated.error);
  }

  const inserted = await insertRepresentationRelationship(service, {
    artistUserId,
    galleryId,
    dealId: deal.id,
    exclusivity: validated.value.exclusivity,
    territory: validated.value.territory,
    startsAt: validated.value.startsAt,
    endsAt: validated.value.endsAt,
    notes: validated.value.notes,
  });

  if (!inserted?.id) {
    return NextResponse.json(
      {
        error:
          "Could not record the representation relationship. An active relationship may already exist for this artist and organisation.",
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const execution: RepresentationExecutionRecord = {
    type: "representation",
    relationship_id: inserted.id,
    recorded_at: now,
    recorded_by_user_id: user.id,
    status: "recorded",
  };

  await upsertDealExecutionRecord(service, { dealId, execution });

  const terms = mergeRepresentationExecutionIntoTerms(
    deal.terms && typeof deal.terms === "object" && !Array.isArray(deal.terms)
      ? (deal.terms as Record<string, unknown>)
      : {},
    execution
  );

  const { data: updated, error: updateError } = await supabase
    .from("deals")
    .update({ terms, updated_at: now })
    .eq("id", dealId)
    .select(
      "id, created_at, updated_at, type, status, created_by_user_id, participant_a_user_id, participant_b_user_id, artwork_id, gallery_id, title, terms"
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Relationship recorded but deal update failed." },
      { status: 500 }
    );
  }

  const mappedDeal = mapDealRow(updated as Record<string, unknown>);

  await onDealExecuted({
    deal: mappedDeal,
    actorUserId: user.id,
    execution,
    clients: { service, user: supabase },
  });

  const state = await resolveRepresentationExecutionState({
    deal: mappedDeal,
    userId: user.id,
    service,
  });

  return NextResponse.json({
    ok: true,
    execution,
    state,
  });
}
