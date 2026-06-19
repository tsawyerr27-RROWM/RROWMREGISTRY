import { NextResponse } from "next/server";

import {
  acquisitionRecipientUserId,
  buildDealExecutionNote,
  buildDealExecutionPanelState,
  findDealExecutionTransfer,
  isAcquisitionDealExecutable,
  mapProvenanceStatusToExecution,
  mergeExecutionIntoTerms,
  resolveDealExecution,
  resolveUserEmail,
  type DealExecutionRecord,
} from "@/lib/deal-execution";
import { upsertDealExecutionRecord } from "@/lib/deal-execution-records";
import { otherDealParticipant } from "@/lib/deal-permissions";
import { mapDealRow } from "@/lib/deals";
import {
  buildProvenanceContinuationEmail,
  categoryLabelForEmail,
} from "@/lib/emails/provenance-continuation-invite";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { buildRegistryStewardInvitePublicUrl } from "@/lib/registry-steward-invite";
import { getSiteUrl } from "@/lib/site-url";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { logActivityEvent } from "@/lib/log-activity";
import { notifyDealExecutionRecorded } from "@/lib/notification-hooks/deal-execution";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

async function holderLabelForUserId(
  service: ReturnType<typeof createSupabaseServiceClient>,
  userId: string
): Promise<string> {
  const { data: cp } = await service
    .from("collector_profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  const dn = String(cp?.display_name ?? "").trim();
  if (dn) return dn;
  const email = await resolveUserEmail(service, userId);
  if (email) {
    const local = email.split("@")[0];
    if (local) return local;
  }
  return "Recorded custodian";
}

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

async function resolveExecutionState(args: {
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
  if (execution && !("provenance_transfer_id" in execution)) {
    execution = null;
  }
  let registryId: string | null = execution?.registry_id ?? null;
  let artworkTitle: string | null = null;
  let canInitiate = false;
  let reason: string | null = null;

  if (!artworkId) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "No linked artwork on this deal.",
      restrictToKind: "acquisition",
    });
  }

  const { data: art } = await service
    .from("artworks")
    .select("id, title, registry_id, verification_status, current_owner_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: "Linked artwork could not be found.",
      restrictToKind: "acquisition",
    });
  }

  artworkTitle = String(art.title ?? "").trim() || null;
  registryId = String(art.registry_id ?? "").trim() || registryId;

  if (!execution) {
    const transfer = await findDealExecutionTransfer(service, {
      artworkId,
      dealId: deal.id,
    });
    if (transfer) {
      execution = {
        provenance_transfer_id: transfer.id,
        registry_id: transfer.registry_id,
        recorded_at: new Date().toISOString(),
        recorded_by_user_id: userId,
        status: mapProvenanceStatusToExecution(transfer.status),
        recipient_user_id: acquisitionRecipientUserId(deal, userId),
      };
    }
  } else if (execution && "provenance_transfer_id" in execution && execution.provenance_transfer_id) {
    const { data: transfer } = await service
      .from("provenance_transfers")
      .select("id, status")
      .eq("id", execution.provenance_transfer_id)
      .maybeSingle();
    if (transfer?.status) {
      execution = {
        ...execution,
        status: mapProvenanceStatusToExecution(String(transfer.status)),
        registry_id: registryId,
      };
    }
  }

  if (!isAcquisitionDealExecutable(deal)) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "acquisition",
    });
  }

  if (execution && "provenance_transfer_id" in execution && execution.provenance_transfer_id) {
    return buildDealExecutionPanelState({
      deal,
      userId,
      execution,
      registryId,
      artworkTitle,
      canInitiate: false,
      reason: null,
      restrictToKind: "acquisition",
    });
  }

  if (String(art.verification_status ?? "") !== "verified") {
    reason = "The linked work must be verified before stewardship can transfer.";
  } else if (String(art.current_owner_id ?? "") !== userId) {
    reason =
      "Only the recorded custodian for this work may initiate the transfer.";
  } else {
    const recipientUserId = acquisitionRecipientUserId(deal, userId);
    if (!recipientUserId) {
      reason = "Could not resolve the acquiring participant.";
    } else {
      const recipientEmail = await resolveUserEmail(service, recipientUserId);
      if (!recipientEmail) {
        reason = "The acquiring participant must have a contact email on file.";
      } else {
        canInitiate = true;
      }
    }
  }

  return buildDealExecutionPanelState({
    deal,
    userId,
    execution,
    registryId,
    artworkTitle,
    canInitiate,
    reason,
    restrictToKind: "acquisition",
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
  const state = await resolveExecutionState({
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
    actionKey: "deal_execution",
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
  if (!isAcquisitionDealExecutable(deal)) {
    return NextResponse.json(
      { error: "This deal is not eligible for registry execution." },
      { status: 409 }
    );
  }

  const service = createSupabaseServiceClient();
  const existing = await resolveDealExecution(service, {
    dealId: deal.id,
    terms: deal.terms,
  });
  if (existing && "provenance_transfer_id" in existing && existing.provenance_transfer_id) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const artworkId = String(deal.artwork_id ?? "").trim();
  const priorTransfer = await findDealExecutionTransfer(service, {
    artworkId,
    dealId: deal.id,
  });
  if (priorTransfer) {
    return NextResponse.json(
      { error: "Execution already recorded for this deal." },
      { status: 409 }
    );
  }

  const { data: art } = await service
    .from("artworks")
    .select("id, title, registry_id, verification_status, current_owner_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (!art?.id) {
    return NextResponse.json({ error: "Linked artwork not found." }, { status: 404 });
  }
  if (String(art.verification_status ?? "") !== "verified") {
    return NextResponse.json(
      { error: "The linked work must be verified before stewardship can transfer." },
      { status: 400 }
    );
  }
  if (String(art.current_owner_id ?? "") !== user.id) {
    return NextResponse.json(
      {
        error:
          "Only the recorded custodian for this work may initiate the transfer.",
      },
      { status: 403 }
    );
  }

  const recipientUserId = acquisitionRecipientUserId(deal, user.id);
  if (!recipientUserId) {
    return NextResponse.json(
      { error: "Could not resolve the acquiring participant." },
      { status: 400 }
    );
  }

  const recipientEmail = await resolveUserEmail(service, recipientUserId);
  if (!recipientEmail) {
    return NextResponse.json(
      { error: "The acquiring participant must have a contact email on file." },
      { status: 400 }
    );
  }

  const userEmail = String(user.email ?? "").toLowerCase();
  if (recipientEmail === userEmail) {
    return NextResponse.json(
      { error: "Recipient must be a different participant than the custodian." },
      { status: 400 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();
  const note = buildDealExecutionNote(deal.id, deal.title);

  const { data: row, error: insErr } = await service
    .from("provenance_transfers")
    .insert({
      artwork_id: artworkId,
      from_user_id: user.id,
      recipient_email: recipientEmail,
      recipient_user_id: recipientUserId,
      status: "pending_acceptance",
      transfer_type: "sale",
      note,
      invite_token: token,
      token_expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insErr || !row?.id) {
    const code = (insErr as { code?: string } | null)?.code;
    if (code === "23505") {
      return NextResponse.json(
        {
          error:
            "Another continuation invitation is already awaiting a response for this work.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: insErr?.message ?? "Could not record the transfer." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const registryId = String(art.registry_id ?? "").trim() || null;
  const execution: DealExecutionRecord = {
    provenance_transfer_id: String(row.id),
    registry_id: registryId,
    recorded_at: now,
    recorded_by_user_id: user.id,
    status: "pending_acceptance",
    recipient_user_id: recipientUserId,
  };

  await upsertDealExecutionRecord(service, { dealId, execution });

  const terms = mergeExecutionIntoTerms(
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
      { error: updateError?.message ?? "Transfer recorded but deal update failed." },
      { status: 500 }
    );
  }

  const title = String(art.title ?? "").trim() || "Untitled work";

  const fromParticipantLabel = await holderLabelForUserId(service, user.id);
  const acceptLink = buildRegistryStewardInvitePublicUrl(token, getSiteUrl());
  const { subject, html, text } = buildProvenanceContinuationEmail({
    artworkTitle: title,
    registryId: registryId ?? "",
    recipientEmail,
    fromParticipantLabel,
    categoryLabel: categoryLabelForEmail("sale"),
    acceptLink,
  });

  const sent = await sendResendEmail({
    kind: "registry_notification",
    to: recipientEmail,
    subject,
    html,
    text,
  });

  if (!sent.ok) {
    const hint = hintForResendDeliveryError(sent.message);
    console.error("[deals/execution] Resend", sent.status, sent.message, hint);
  }

  await logActivityEvent({
    userId: user.id,
    type: "provenance_transfer_initiated",
    message: `Acquisition deal execution: ${title}${registryId ? ` (${registryId})` : ""}`,
    artworkId,
    metadata: {
      deal_id: dealId,
      registry_id: registryId,
      transfer_id: String(row.id),
      transfer_type: "sale",
      recipient_user_id: recipientUserId,
    },
  });

  await notifyDealExecutionRecorded({
    dealId,
    actorUserId: user.id,
    kind: "acquisition",
    body: `Stewardship transfer initiated for ${title}.`,
    client: service,
  });

  const state = await resolveExecutionState({
    deal: mapDealRow(updated as Record<string, unknown>),
    userId: user.id,
    service,
  });

  return NextResponse.json({
    ok: true,
    execution,
    state,
  });
}
