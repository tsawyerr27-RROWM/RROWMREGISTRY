import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createNotification,
  notificationMetadata,
  type NotificationType,
} from "@/lib/notifications";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type DealParticipants = {
  dealId: string;
  title: string;
  participantAUserId: string;
  participantBUserId: string;
};

type ExecutionNotificationKind =
  | "acquisition"
  | "exhibition"
  | "representation"
  | "licensing";

const EXECUTION_NOTIFICATION_TYPE: Record<
  ExecutionNotificationKind,
  NotificationType
> = {
  acquisition: "deal_execution_recorded",
  exhibition: "provenance_exhibition_recorded",
  representation: "representation_relationship_activated",
  licensing: "deal_execution_recorded",
};

const EXECUTION_NOTIFICATION_TITLE: Record<ExecutionNotificationKind, string> =
  {
    acquisition: "Deal execution recorded",
    exhibition: "Exhibition recorded on file",
    representation: "Representation activated",
    licensing: "License activated",
  };

async function loadDealParticipants(
  service: SupabaseClient,
  dealId: string
): Promise<DealParticipants | null> {
  const { data, error } = await service
    .from("deals")
    .select("id, title, participant_a_user_id, participant_b_user_id")
    .eq("id", dealId)
    .maybeSingle();

  if (error || !data?.id) {
    console.error("[notification-hooks/deal-execution] deals", error);
    return null;
  }

  return {
    dealId: String(data.id),
    title: String((data as { title?: string }).title ?? "").trim() || "Deal",
    participantAUserId: String((data as any).participant_a_user_id ?? ""),
    participantBUserId: String((data as any).participant_b_user_id ?? ""),
  };
}

function defaultExecutionBody(
  kind: ExecutionNotificationKind,
  dealTitle: string,
  detail?: string | null
): string {
  const trimmedDetail = String(detail ?? "").trim();
  if (trimmedDetail) return trimmedDetail;

  switch (kind) {
    case "acquisition":
      return `Stewardship transfer recorded for ${dealTitle}.`;
    case "exhibition":
      return `An exhibition milestone was filed for ${dealTitle}.`;
    case "representation":
      return `Artist–organisation representation was recorded for ${dealTitle}.`;
    case "licensing":
      return `A rights license was activated for ${dealTitle}.`;
    default:
      return `Execution was recorded for ${dealTitle}.`;
  }
}

export async function notifyDealExecutionRecorded(args: {
  dealId: string;
  actorUserId: string;
  kind: ExecutionNotificationKind;
  body?: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const ctx = await loadDealParticipants(service, args.dealId);
    if (!ctx) return;

    const recipients = [ctx.participantAUserId, ctx.participantBUserId].filter(
      (id) => id && id !== args.actorUserId
    );
    if (recipients.length === 0) return;

    const type = EXECUTION_NOTIFICATION_TYPE[args.kind];
    const title = EXECUTION_NOTIFICATION_TITLE[args.kind];
    const body = defaultExecutionBody(args.kind, ctx.title, args.body);
    const metadata = notificationMetadata({ dealId: ctx.dealId });

    await Promise.all(
      recipients.map((recipientUserId) =>
        createNotification(
          {
            recipientUserId,
            type,
            title,
            body,
            metadata,
          },
          service
        )
      )
    );
  } catch (err) {
    console.error("[notifyDealExecutionRecorded]", err);
  }
}
