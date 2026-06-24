import { NextResponse } from "next/server";

import {
  buildDealExecutionPanelState,
  findDealLicensingExecution,
  isLicensingDealExecutable,
  mergeLicensingExecutionIntoTerms,
  resolveDealExecution,
  type LicensingExecutionRecord,
} from "@/lib/deal-execution";
import { onDealExecuted } from "@/lib/deal-lifecycle-engine";
import { upsertDealExecutionRecord } from "@/lib/deal-execution-records";
import { otherDealParticipant } from "@/lib/deal-permissions";
import { mapDealRow } from "@/lib/deals";
import {
  findRightsLicenseByDealId,
  insertRightsLicense,
  resolveLicensingParticipants,
  validateLicensingExecutionInput,
} from "@/lib/rights-licenses";
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

async function resolveLicensingExecutionState(args: {
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
  if (
    execution &&
    execution.type !== "licensing" &&
    !("rights_license_id" in execution)
  ) {
    execution = null;
  }

  let registryId: string | null =
    execution?.type === "licensing" ? execution.registry_id : null;
  let artworkTitle: string | null = null;
  let canInitiate = false;
  let reason: string | null = null;

  if (!artworkId) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: execution && "rights_license_id" in execution ? execution : null,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "No linked artwork on this deal.",
      restrictToKind: "licensing",
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
      execution: execution && "rights_license_id" in execution ? execution : null,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "Linked artwork could not be found.",
      restrictToKind: "licensing",
    });
  }

  artworkTitle = String(art.title ?? "").trim() || null;
  registryId = String(art.registry_id ?? "").trim() || registryId;

  const licensingExecution =
    execution && "rights_license_id" in execution ? execution : null;

  if (!licensingExecution) {
    const fallback = await findDealLicensingExecution(service, {
      dealId: deal.id,
      userId,
    });
    if (fallback) {
      execution = fallback;
    }
  }

  const resolvedExecution =
    execution && "rights_license_id" in execution ? execution : null;

  if (!isLicensingDealExecutable(deal)) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: resolvedExecution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "licensing",
    });
  }

  if (resolvedExecution?.rights_license_id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: resolvedExecution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "licensing",
    });
  }

  const participants = await resolveLicensingParticipants(service, deal);
  if (!participants.ok) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution: null,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: participants.reason,
      restrictToKind: "licensing",
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
    restrictToKind: "licensing",
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
  const state = await resolveLicensingExecutionState({
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
    actionKey: "deal_execution_licensing",
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
  if (!isLicensingDealExecutable(deal)) {
    return NextResponse.json(
      { error: "This deal is not eligible for licensing execution." },
      { status: 409 }
    );
  }

  const service = createSupabaseServiceClient();

  const existing = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (existing && "rights_license_id" in existing && existing.rights_license_id) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const prior = await findRightsLicenseByDealId(service, deal.id);
  if (prior?.id) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const resolved = await resolveLicensingParticipants(service, deal);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.reason }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  const validated = validateLicensingExecutionInput(body);
  if (!validated.ok) {
    return badRequest(validated.error);
  }

  const { licensorUserId, licenseeUserId, artworkId } = resolved.participants;

  const inserted = await insertRightsLicense(service, {
    dealId: deal.id,
    artworkId,
    licensorUserId,
    licenseeUserId,
    usageType: validated.value.usageType,
    territory: validated.value.territory,
    exclusivity: validated.value.exclusivity,
    startsAt: validated.value.startsAt,
    endsAt: validated.value.endsAt,
    notes: validated.value.notes,
  });

  if (!inserted?.id) {
    return NextResponse.json(
      { error: "Could not record the rights license." },
      { status: 500 }
    );
  }

  const { data: art } = await service
    .from("artworks")
    .select("registry_id")
    .eq("id", artworkId)
    .maybeSingle();

  const now = new Date().toISOString();
  const registryId = String(art?.registry_id ?? "").trim() || null;
  const execution: LicensingExecutionRecord = {
    type: "licensing",
    rights_license_id: inserted.id,
    registry_id: registryId,
    recorded_at: now,
    recorded_by_user_id: user.id,
    status: "recorded",
  };

  await upsertDealExecutionRecord(service, { dealId, execution });

  const terms = mergeLicensingExecutionIntoTerms(
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
      { error: updateError?.message ?? "License recorded but deal update failed." },
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

  const state = await resolveLicensingExecutionState({
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
