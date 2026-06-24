import type { SupabaseClient } from "@supabase/supabase-js";

import { createNotification, notificationMetadata } from "@/lib/notifications";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type DealParticipants = {
  dealId: string;
  participantAUserId: string;
  participantBUserId: string;
};

async function loadDealParticipants(
  service: SupabaseClient,
  dealId: string
): Promise<DealParticipants | null> {
  const { data, error } = await service
    .from("deals")
    .select("id, participant_a_user_id, participant_b_user_id")
    .eq("id", dealId)
    .maybeSingle();

  if (error || !data?.id) {
    console.error("[notification-hooks/deals] deals", error);
    return null;
  }

  return {
    dealId: String(data.id),
    participantAUserId: String((data as any).participant_a_user_id ?? ""),
    participantBUserId: String((data as any).participant_b_user_id ?? ""),
  };
}

function dealMeta(dealId: string) {
  return notificationMetadata({ dealId });
}

export async function notifyDealMessageReceived(args: {
  dealId: string;
  senderUserId: string;
  preview?: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const ctx = await loadDealParticipants(service, args.dealId);
    if (!ctx) return;

    const recipients = [ctx.participantAUserId, ctx.participantBUserId].filter(
      (id) => id && id !== args.senderUserId
    );
    if (recipients.length === 0) return;

    const preview = String(args.preview ?? "").trim();
    const body = preview ? preview : "You have a new deal message.";

    await Promise.all(
      recipients.map((recipientUserId) =>
        createNotification(
          {
            recipientUserId,
            type: "deal_message_received",
            title: "New deal message",
            body,
            metadata: dealMeta(ctx.dealId),
          },
          service
        )
      )
    );
  } catch (err) {
    console.error("[notifyDealMessageReceived]", err);
  }
}

export async function notifyDealStatusChanged(args: {
  dealId: string;
  actorUserId: string;
  fromStatus: string;
  toStatus: string;
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

    const body = `Deal status changed: ${args.fromStatus} → ${args.toStatus}.`;

    await Promise.all(
      recipients.map((recipientUserId) =>
        createNotification(
          {
            recipientUserId,
            type: "deal_status_changed",
            title: "Deal updated",
            body,
            metadata: dealMeta(ctx.dealId),
          },
          service
        )
      )
    );
  } catch (err) {
    console.error("[notifyDealStatusChanged]", err);
  }
}

