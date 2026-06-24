import { logActivityEvent } from "@/lib/log-activity";
import { notifyDealExecutionRecorded } from "@/lib/notification-hooks/deal-execution";

import type {
  DealAcceptedContext,
  DealCancelledContext,
  DealCompletedContext,
  DealExecutedContext,
  DealLifecycleHandler,
} from "./types";

export const exhibitionHandler: DealLifecycleHandler = {
  async onAccepted(_ctx: DealAcceptedContext): Promise<void> {
    // No provenance mutation until execution.
  },

  async onExecuted(ctx: DealExecutedContext): Promise<void> {
    if (!("provenance_event_id" in ctx.execution)) return;

    const service = ctx.clients.service;
    const artworkId = String(ctx.deal.artwork_id ?? "").trim();
    const eventId = String(ctx.execution.provenance_event_id ?? "");

    const { data: art } = await service
      .from("artworks")
      .select("title, registry_id")
      .eq("id", artworkId)
      .maybeSingle();

    const title = String(art?.title ?? "").trim() || "Untitled work";
    const registryId = String(art?.registry_id ?? "").trim() || null;

    await logActivityEvent({
      userId: ctx.actorUserId,
      type: "provenance_evidence_recorded",
      message: `Exhibition recorded: ${title}${registryId ? ` (${registryId})` : ""}`,
      artworkId,
      metadata: {
        deal_id: ctx.deal.id,
        registry_id: registryId,
        provenance_event_id: eventId,
        category: "exhibition",
      },
    });

    await notifyDealExecutionRecorded({
      dealId: ctx.deal.id,
      actorUserId: ctx.actorUserId,
      kind: "exhibition",
      body: `Exhibition milestone recorded for ${title}.`,
      client: service,
    });
  },

  async onCompleted(_ctx: DealCompletedContext): Promise<void> {
    // Exhibition execution is complete on record.
  },

  async onCancelled(_ctx: DealCancelledContext): Promise<void> {},
};
