import { NextResponse } from "next/server";

import {
  buildDealExecutionPanelState,
  findDealExhibitionExecution,
  isExhibitionDealExecutable,
  mergeExhibitionExecutionIntoTerms,
  resolveDealExecution,
  type ExhibitionExecutionRecord,
  validateExhibitionExecutionInput,
} from "@/lib/deal-execution";
import { onDealExecuted } from "@/lib/deal-lifecycle-engine";
import { upsertDealExecutionRecord } from "@/lib/deal-execution-records";
import { otherDealParticipant } from "@/lib/deal-permissions";
import { mapDealRow } from "@/lib/deals";
import {
  buildExhibitionProvenanceMetadata,
  insertProvenanceEvidenceEvent,
} from "@/lib/provenance-evidence-events";
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

async function resolveExhibitionExecutionState(args: {
  deal: ReturnType<typeof mapDealRow>;
  userId: string;
  service: ReturnType<typeof createSupabaseServiceClient>;
}) {
  const { deal, userId, service } = args;
  const artworkId = String(deal.artwork_id ?? "").trim();

  let execution = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (execution && execution.type !== "exhibition" && !("provenance_event_id" in execution)) {
    execution = null;
  }

  let registryId: string | null =
    execution?.type === "exhibition" ? execution.registry_id : null;
  let artworkTitle: string | null = null;
  let canInitiate = false;
  let reason: string | null = null;

  if (!artworkId) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: execution && "provenance_event_id" in execution ? execution : null,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "No linked artwork on this deal.",
      restrictToKind: "exhibition",
    });
  }

  const { data: art } = await service
    .from("artworks")
    .select("id, title, registry_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: execution && "provenance_event_id" in execution ? execution : null,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "Linked artwork could not be found.",
      restrictToKind: "exhibition",
    });
  }

  artworkTitle = String(art.title ?? "").trim() || null;
  registryId = String(art.registry_id ?? "").trim() || registryId;

  const exhibitionExecution =
    execution && "provenance_event_id" in execution ? execution : null;

  if (!exhibitionExecution) {
    const fallback = await findDealExhibitionExecution(service, {
      artworkId,
      dealId: deal.id,
      userId,
    });
    if (fallback) {
      execution = fallback;
    }
  }

  const resolvedExecution =
    execution && "provenance_event_id" in execution ? execution : null;

  if (!isExhibitionDealExecutable(deal)) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: resolvedExecution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "exhibition",
    });
  }

  if (resolvedExecution?.provenance_event_id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: resolvedExecution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "exhibition",
    });
  }

  canInitiate = true;

  return buildDealExecutionPanelState({
    deal,
    userId,
    execution: resolvedExecution,
    registryId,
    artworkTitle,
    canInitiate,
    reason,
    restrictToKind: "exhibition",
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
  const state = await resolveExhibitionExecutionState({
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
    actionKey: "deal_execution_exhibition",
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
  if (!isExhibitionDealExecutable(deal)) {
    return NextResponse.json(
      { error: "This deal is not eligible for exhibition execution." },
      { status: 409 }
    );
  }

  const artworkId = String(deal.artwork_id ?? "").trim();
  const service = createSupabaseServiceClient();

  const existing = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (existing && "provenance_event_id" in existing && existing.provenance_event_id) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const prior = await findDealExhibitionExecution(service, {
    artworkId,
    dealId: deal.id,
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

  const validated = validateExhibitionExecutionInput(body);
  if (!validated.ok) {
    return badRequest(validated.error);
  }

  const { data: art } = await service
    .from("artworks")
    .select("id, title, registry_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.id) {
    return NextResponse.json({ error: "Linked artwork not found." }, { status: 404 });
  }

  const metadata = buildExhibitionProvenanceMetadata({
    dealId: deal.id,
    venue: validated.value.venue,
    city: validated.value.city,
    startDate: validated.value.start_date,
    endDate: validated.value.end_date,
    note: validated.value.note,
  });

  const occurredAt = `${validated.value.start_date}T12:00:00.000Z`;

  const inserted = await insertProvenanceEvidenceEvent(service, {
    artworkId,
    recordedByUserId: user.id,
    occurredAt,
    metadata,
  });

  if (!inserted?.id) {
    return NextResponse.json(
      { error: "Could not record the exhibition milestone." },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const registryId = String(art.registry_id ?? "").trim() || null;
  const execution: ExhibitionExecutionRecord = {
    type: "exhibition",
    provenance_event_id: inserted.id,
    registry_id: registryId,
    recorded_at: now,
    recorded_by_user_id: user.id,
    status: "recorded",
  };

  await upsertDealExecutionRecord(service, { dealId, execution });

  const terms = mergeExhibitionExecutionIntoTerms(
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
      { error: updateError?.message ?? "Exhibition recorded but deal update failed." },
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

  const state = await resolveExhibitionExecutionState({
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
