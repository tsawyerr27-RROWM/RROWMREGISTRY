import type { NotificationRow, NotificationType } from "@/lib/notifications";

export const NOTIFICATION_INBOX_SECTIONS = [
  "transfers",
  "certifications",
  "deals",
  "activity",
] as const;

export type NotificationInboxSection = (typeof NOTIFICATION_INBOX_SECTIONS)[number];

export const NOTIFICATION_INBOX_SECTION_LABEL_KEYS = {
  transfers: "notifications.inbox.section.transfers",
  certifications: "notifications.inbox.section.certifications",
  deals: "notifications.inbox.section.deals",
  activity: "notifications.inbox.section.activity",
} as const satisfies Record<NotificationInboxSection, string>;

export function notificationInboxSection(type: NotificationType): NotificationInboxSection {
  switch (type) {
    case "registry_transfer_recorded":
    case "ownership_claim_required":
    case "ownership_confirmation_required":
    case "ownership_transfer_completed":
    case "registry_custody_invite_received":
      return "transfers";
    case "registry_verification_approved":
    case "registry_certificate_issued":
    case "registry_amendment_requested":
    case "registry_authorship_invite_received":
    case "representation_relationship_activated":
      return "certifications";
    case "deal_message_received":
    case "deal_status_changed":
    case "deal_execution_recorded":
      return "deals";
    default:
      return "activity";
  }
}

export function groupNotificationsByInboxSection(
  notifications: NotificationRow[]
): Record<NotificationInboxSection, NotificationRow[]> {
  const groups: Record<NotificationInboxSection, NotificationRow[]> = {
    transfers: [],
    certifications: [],
    deals: [],
    activity: [],
  };

  for (const notification of notifications) {
    groups[notificationInboxSection(notification.type)].push(notification);
  }

  return groups;
}
