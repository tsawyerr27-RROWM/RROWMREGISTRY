import type { AcquisitionExecutionRecord } from "@/lib/deal-execution";
import { resolveUserEmail } from "@/lib/deal-execution";
import {
  mergeAcquisitionLifecycleIntoTerms,
  type AcquisitionLifecycleSnapshot,
} from "@/lib/acquisition-lifecycle";
import {
  buildBuyerStewardshipClaimEmail,
  buildSellerTransferConfirmationEmail,
} from "@/lib/emails/acquisition-ownership-loop";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { logActivityEvent } from "@/lib/log-activity";
import { notifyDealExecutionRecorded } from "@/lib/notification-hooks/deal-execution";
import {
  notifyOwnershipClaimRequired,
  notifyOwnershipConfirmationRequired,
  notifyOwnershipTransferCompleted,
} from "@/lib/notification-hooks/ownership-loop";
import { notifyRegistryTransferRecorded } from "@/lib/notification-hooks/registry";
import { buildAcquisitionAcceptPublicUrl } from "@/lib/acquisition-transfer-nav";
import { completeAcquisitionOwnershipLoop } from "@/lib/acquisition-ownership-loop";
import { getSiteUrl } from "@/lib/site-url";
import { recordAcquisitionDealValue } from "@/lib/deal-acquisition-value";

import type {
  DealAcceptedContext,
  DealCancelledContext,
  DealCompletedContext,
  DealExecutedContext,
  DealLifecycleHandler,
} from "./types";

async function holderLabelForUserId(
  service: DealExecutedContext["clients"]["service"],
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

async function updateAcquisitionLifecycle(
  clients: DealAcceptedContext["clients"],
  deal: DealAcceptedContext["deal"],
  snapshot: AcquisitionLifecycleSnapshot
): Promise<void> {
  const client = clients.user ?? clients.service;
  const terms = mergeAcquisitionLifecycleIntoTerms(deal.terms, snapshot);
  await client
    .from("deals")
    .update({ terms, updated_at: snapshot.updated_at })
    .eq("id", deal.id);
}

export const acquisitionHandler: DealLifecycleHandler = {
  async onAccepted(ctx: DealAcceptedContext): Promise<void> {
    const now = new Date().toISOString();
    await updateAcquisitionLifecycle(ctx.clients, ctx.deal, {
      state: "accepted",
      updated_at: now,
      deal_id: ctx.deal.id,
    });
  },

  async onExecuted(ctx: DealExecutedContext): Promise<void> {
    if (!("provenance_transfer_id" in ctx.execution)) return;

    const execution = ctx.execution as AcquisitionExecutionRecord;
    const service = ctx.clients.service;
    const artworkId = String(ctx.deal.artwork_id ?? "").trim();
    const now = new Date().toISOString();

    await updateAcquisitionLifecycle(ctx.clients, ctx.deal, {
      state: "pending_transfer",
      updated_at: now,
      deal_id: ctx.deal.id,
      provenance_transfer_id: execution.provenance_transfer_id,
    });

    const { data: art } = await service
      .from("artworks")
      .select("title, registry_id")
      .eq("id", artworkId)
      .maybeSingle();

    const title = String(art?.title ?? "").trim() || "Untitled work";
    const registryId = String(art?.registry_id ?? "").trim() || null;
    const recipientUserId = String(execution.recipient_user_id ?? "").trim();

    const { data: transfer } = await service
      .from("provenance_transfers")
      .select("invite_token")
      .eq("id", execution.provenance_transfer_id)
      .maybeSingle();

    const token = String((transfer as { invite_token?: string } | null)?.invite_token ?? "");
    const acceptLink = buildAcquisitionAcceptPublicUrl(token, getSiteUrl());
    const dealsHref = `/studio/deals?deal=${encodeURIComponent(ctx.deal.id)}`;

    const recipientEmail = recipientUserId
      ? await resolveUserEmail(service, recipientUserId)
      : null;

    if (recipientEmail) {
      const fromParticipantLabel = await holderLabelForUserId(service, ctx.actorUserId);
      const buyerEmailContent = buildBuyerStewardshipClaimEmail({
        artworkTitle: title,
        registryId: registryId ?? "",
        recipientEmail,
        counterpartyLabel: fromParticipantLabel,
        actionHref: acceptLink,
      });

      const buyerSent = await sendResendEmail({
        kind: "registry_notification",
        to: recipientEmail,
        subject: buyerEmailContent.subject,
        html: buyerEmailContent.html,
        text: buyerEmailContent.text,
      });

      if (!buyerSent.ok) {
        const hint = hintForResendDeliveryError(buyerSent.message);
        console.error(
          "[deal-lifecycle/acquisition] buyer email",
          buyerSent.status,
          buyerSent.message,
          hint
        );
      }
    }

    const sellerEmail = await resolveUserEmail(service, ctx.actorUserId);
    if (sellerEmail && recipientUserId) {
      const recipientLabel = await holderLabelForUserId(service, recipientUserId);
      const sellerEmailContent = buildSellerTransferConfirmationEmail({
        artworkTitle: title,
        registryId: registryId ?? "",
        recipientEmail: sellerEmail,
        counterpartyLabel: recipientLabel,
        actionHref: `${getSiteUrl()}${dealsHref}`,
      });

      const sellerSent = await sendResendEmail({
        kind: "registry_notification",
        to: sellerEmail,
        subject: sellerEmailContent.subject,
        html: sellerEmailContent.html,
        text: sellerEmailContent.text,
      });

      if (!sellerSent.ok) {
        const hint = hintForResendDeliveryError(sellerSent.message);
        console.error(
          "[deal-lifecycle/acquisition] seller email",
          sellerSent.status,
          sellerSent.message,
          hint
        );
      }
    }

    await logActivityEvent({
      userId: ctx.actorUserId,
      type: "provenance_transfer_initiated",
      message: `Acquisition deal execution: ${title}${registryId ? ` (${registryId})` : ""}`,
      artworkId,
      metadata: {
        deal_id: ctx.deal.id,
        registry_id: registryId,
        transfer_id: execution.provenance_transfer_id,
        transfer_type: "sale",
        recipient_user_id: recipientUserId,
      },
    });

    await notifyDealExecutionRecorded({
      dealId: ctx.deal.id,
      actorUserId: ctx.actorUserId,
      kind: "acquisition",
      body: `Stewardship transfer initiated for ${title}.`,
      client: service,
    });

    if (recipientUserId) {
      await notifyOwnershipClaimRequired({
        recipientUserId,
        artworkId,
        dealId: ctx.deal.id,
        acceptHref: acceptLink,
        client: service,
      });

      await notifyOwnershipConfirmationRequired({
        recipientUserId: ctx.actorUserId,
        artworkId,
        dealId: ctx.deal.id,
        client: service,
      });
    }
  },

  async onCompleted(ctx: DealCompletedContext): Promise<void> {
    if (!("provenance_transfer_id" in ctx.execution)) return;

    const execution = ctx.execution as AcquisitionExecutionRecord;
    const service = ctx.clients.service;
    const artworkId = String(ctx.deal.artwork_id ?? "").trim();
    const now = new Date().toISOString();
    const buyerUserId = String(execution.recipient_user_id ?? ctx.actorUserId).trim();
    const sellerUserId = String(execution.recorded_by_user_id ?? "").trim();

    await completeAcquisitionOwnershipLoop(service, {
      provenanceTransferId: execution.provenance_transfer_id,
      artworkId,
      fromUserId: sellerUserId,
      toUserId: buyerUserId,
    });

    try {
      await recordAcquisitionDealValue(service, {
        deal: ctx.deal,
        artworkId,
        ownershipEventId: ctx.ownershipEventId ?? null,
        sellerUserId: sellerUserId,
        buyerUserId: buyerUserId,
        completedAt: now,
      });
    } catch (valueError) {
      console.error("[provenance accept] deal_value_failed", {
        deal_id: ctx.deal.id,
        artwork_id: artworkId,
        ownership_event_id: ctx.ownershipEventId ?? null,
        message:
          valueError instanceof Error ? valueError.message : String(valueError),
      });
    }

    const terms = mergeAcquisitionLifecycleIntoTerms(ctx.deal.terms, {
      state: "completed",
      updated_at: now,
      deal_id: ctx.deal.id,
      provenance_transfer_id: execution.provenance_transfer_id,
      ownership_event_id: ctx.ownershipEventId ?? null,
    });

    await service
      .from("deals")
      .update({ terms, updated_at: now })
      .eq("id", ctx.deal.id);

    const { data: art } = await service
      .from("artworks")
      .select("title, registry_id")
      .eq("id", artworkId)
      .maybeSingle();

    const title = String(art?.title ?? "").trim() || "Artwork";
    const reg = art?.registry_id ? ` (${art.registry_id})` : "";

    await logActivityEvent({
      userId: buyerUserId,
      type: "provenance_transfer_accepted",
      message: `Accepted continuity transfer: ${title}${reg}`,
      artworkId,
      metadata: {
        registry_id: art?.registry_id ?? null,
        ownership_event_id: ctx.ownershipEventId ?? null,
      },
    });

    if (sellerUserId) {
      await logActivityEvent({
        userId: sellerUserId,
        type: "provenance_transfer_completed",
        message: `Continuity transfer completed: ${title}${reg}`,
        artworkId,
        metadata: {
          registry_id: art?.registry_id ?? null,
          accepted_by: buyerUserId,
        },
      });
    }

    void notifyRegistryTransferRecorded({
      artworkId,
      fromUserId: sellerUserId,
      toUserId: buyerUserId,
    });

    if (sellerUserId) {
      void notifyOwnershipTransferCompleted({
        buyerUserId,
        sellerUserId,
        artworkId,
        dealId: ctx.deal.id,
        client: service,
      });
    }
  },

  async onCancelled(ctx: DealCancelledContext): Promise<void> {
    const now = new Date().toISOString();
    await updateAcquisitionLifecycle(ctx.clients, ctx.deal, {
      state: "proposed",
      updated_at: now,
      deal_id: ctx.deal.id,
    });
  },
};
