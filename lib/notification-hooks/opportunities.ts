import type { SupabaseClient } from "@supabase/supabase-js";

import type { OpportunityApplicationStatus } from "@/lib/field-opportunity-applications";
import {
  createNotification,
  notificationMetadata,
  type NotificationType,
} from "@/lib/notifications";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type OpportunityStatusNotificationType = Extract<
  NotificationType,
  | "opportunity_shortlisted"
  | "opportunity_selected"
  | "opportunity_rejected"
>;

const STATUS_NOTIFICATION_TYPE: Partial<
  Record<OpportunityApplicationStatus, OpportunityStatusNotificationType>
> = {
  shortlisted: "opportunity_shortlisted",
  selected: "opportunity_selected",
  rejected: "opportunity_rejected",
};

function opportunityTitleLabel(title: string | null | undefined): string {
  const trimmed = String(title ?? "").trim();
  return trimmed || "this opportunity";
}

function applicantLabel(displayName: string | null | undefined): string {
  const trimmed = String(displayName ?? "").trim();
  return trimmed || "A creative";
}

function statusNotificationCopy(
  type: OpportunityStatusNotificationType,
  opportunityTitle: string
): { title: string; body: string } {
  const label = opportunityTitleLabel(opportunityTitle);
  switch (type) {
    case "opportunity_shortlisted":
      return {
        title: "Shortlisted",
        body: `Your application to ${label} has been shortlisted for further review.`,
      };
    case "opportunity_selected":
      return {
        title: "Selected",
        body: `You have been selected for ${label}.`,
      };
    case "opportunity_rejected":
      return {
        title: "Application update",
        body: `Your application to ${label} was not advanced on this occasion.`,
      };
    default:
      return { title: "Application update", body: `There is an update on ${label}.` };
  }
}

async function loadGalleryStaffUserIds(
  service: SupabaseClient,
  galleryId: string,
  excludeUserId?: string
): Promise<string[]> {
  const { data, error } = await service
    .from("gallery_users")
    .select("user_id")
    .eq("gallery_id", galleryId);

  if (error) {
    console.error("[notification-hooks/opportunities] gallery_users", error);
    return [];
  }

  return (data ?? [])
    .map((row) => String(row.user_id ?? "").trim())
    .filter((userId) => userId && userId !== excludeUserId);
}

/**
 * Notify organisation staff when a creative submits an application.
 * Fire-and-forget: errors are logged, never thrown.
 */
export async function notifyOpportunityApplicationReceived(args: {
  galleryId: string;
  opportunityId: string;
  applicationId: string;
  opportunityTitle: string;
  applicantDisplayName: string | null;
  applicantUserId: string;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const staffUserIds = await loadGalleryStaffUserIds(
      service,
      args.galleryId,
      args.applicantUserId
    );

    if (staffUserIds.length === 0) return;

    const title = "Application received";
    const body = `${applicantLabel(args.applicantDisplayName)} applied to ${opportunityTitleLabel(args.opportunityTitle)}.`;
    const metadata = notificationMetadata({
      opportunityId: args.opportunityId,
      applicationId: args.applicationId,
      href: "/studio/organisation",
    });

    await Promise.all(
      staffUserIds.map((recipientUserId) =>
        createNotification(
          {
            recipientUserId,
            type: "opportunity_application_received",
            title,
            body,
            metadata,
          },
          service
        )
      )
    );
  } catch (err) {
    console.error("[notifyOpportunityApplicationReceived]", err);
  }
}

/**
 * Notify the applicant when review status advances to shortlisted, selected, or rejected.
 */
export async function notifyOpportunityApplicationStatusChange(args: {
  applicantUserId: string;
  opportunityId: string;
  applicationId: string;
  opportunityTitle: string;
  previousStatus: OpportunityApplicationStatus | string;
  nextStatus: OpportunityApplicationStatus;
  client?: SupabaseClient;
}): Promise<void> {
  if (args.previousStatus === args.nextStatus) return;

  const type = STATUS_NOTIFICATION_TYPE[args.nextStatus];
  if (!type) return;

  try {
    const service = args.client ?? createSupabaseServiceClient();
    const copy = statusNotificationCopy(type, args.opportunityTitle);

    await createNotification(
      {
        recipientUserId: args.applicantUserId,
        type,
        title: copy.title,
        body: copy.body,
        metadata: notificationMetadata({
          opportunityId: args.opportunityId,
          applicationId: args.applicationId,
          href: `/field/opportunities/${encodeURIComponent(args.opportunityId)}`,
        }),
      },
      service
    );
  } catch (err) {
    console.error("[notifyOpportunityApplicationStatusChange]", args.nextStatus, err);
  }
}
