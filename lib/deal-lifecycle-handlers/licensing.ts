import { usageTypeLabel } from "@/lib/rights-licenses";
import { logActivityEvent } from "@/lib/log-activity";
import { notifyDealExecutionRecorded } from "@/lib/notification-hooks/deal-execution";

import type {
  DealAcceptedContext,
  DealCancelledContext,
  DealCompletedContext,
  DealExecutedContext,
  DealLifecycleHandler,
} from "./types";

export const licensingHandler: DealLifecycleHandler = {
  async onAccepted(_ctx: DealAcceptedContext): Promise<void> {},

  async onExecuted(ctx: DealExecutedContext): Promise<void> {
    if (!("rights_license_id" in ctx.execution)) return;

    const service = ctx.clients.service;
    const artworkId = String(ctx.deal.artwork_id ?? "").trim();
    const licenseId = String(ctx.execution.rights_license_id ?? "");
    const title = String(ctx.deal.title ?? "").trim() || "Licensing deal";

    const { data: license } = await service
      .from("rights_licenses")
      .select("usage_type, territory")
      .eq("id", licenseId)
      .maybeSingle();

    const usageType = String(
      (license as { usage_type?: string } | null)?.usage_type ?? "other"
    ) as Parameters<typeof usageTypeLabel>[0];

    await logActivityEvent({
      userId: ctx.actorUserId,
      type: "rights_license_activated",
      message: `License activated: ${title} · ${usageTypeLabel(usageType)}`,
      artworkId,
      metadata: {
        deal_id: ctx.deal.id,
        rights_license_id: licenseId,
        usage_type: usageType,
        territory: (license as { territory?: string } | null)?.territory ?? null,
      },
    });

    await notifyDealExecutionRecorded({
      dealId: ctx.deal.id,
      actorUserId: ctx.actorUserId,
      kind: "licensing",
      body: `${usageTypeLabel(usageType)} license activated for ${title}.`,
      client: service,
    });
  },

  async onCompleted(_ctx: DealCompletedContext): Promise<void> {},

  async onCancelled(_ctx: DealCancelledContext): Promise<void> {},
};
