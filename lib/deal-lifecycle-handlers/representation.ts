import { logActivityEvent } from "@/lib/log-activity";
import { notifyDealExecutionRecorded } from "@/lib/notification-hooks/deal-execution";

import type {
  DealAcceptedContext,
  DealCancelledContext,
  DealCompletedContext,
  DealExecutedContext,
  DealLifecycleHandler,
} from "./types";

async function loadGalleryDisplayName(
  service: DealExecutedContext["clients"]["service"],
  galleryId: string
): Promise<string | null> {
  const { data } = await service
    .from("organisation_profiles")
    .select("display_name")
    .eq("id", galleryId)
    .maybeSingle();
  const name = String((data as { display_name?: string } | null)?.display_name ?? "").trim();
  return name || null;
}

export const representationHandler: DealLifecycleHandler = {
  async onAccepted(_ctx: DealAcceptedContext): Promise<void> {},

  async onExecuted(ctx: DealExecutedContext): Promise<void> {
    if (!("relationship_id" in ctx.execution)) return;

    const service = ctx.clients.service;
    const relationshipId = String(ctx.execution.relationship_id ?? "");
    const galleryId = String(ctx.deal.gallery_id ?? "").trim();
    const galleryName = (galleryId ? await loadGalleryDisplayName(service, galleryId) : null) ?? "Organisation";

    await logActivityEvent({
      userId: ctx.actorUserId,
      type: "representation_relationship_recorded",
      message: `Representation recorded: ${galleryName}`,
      artworkId: ctx.deal.artwork_id,
      metadata: {
        deal_id: ctx.deal.id,
        relationship_id: relationshipId,
        gallery_id: galleryId || null,
      },
    });

    await notifyDealExecutionRecorded({
      dealId: ctx.deal.id,
      actorUserId: ctx.actorUserId,
      kind: "representation",
      body: `Representation with ${galleryName} recorded on file.`,
      client: service,
    });
  },

  async onCompleted(_ctx: DealCompletedContext): Promise<void> {},

  async onCancelled(_ctx: DealCancelledContext): Promise<void> {},
};
