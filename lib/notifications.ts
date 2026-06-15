import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

/** v1 notification types — opportunities and registry filing events. */
export const NOTIFICATION_TYPES = [
  "opportunity_application_received",
  "opportunity_shortlisted",
  "opportunity_selected",
  "opportunity_rejected",
  "registry_verification_approved",
  "registry_certificate_issued",
  "registry_amendment_requested",
  "registry_transfer_recorded",
  "registry_authorship_invite_received",
  "registry_custody_invite_received",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationMetadata = Record<string, unknown>;

export type NotificationRow = {
  id: string;
  recipient_user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: NotificationMetadata;
  read_at: string | null;
  created_at: string;
};

export type CreateNotificationInput = {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: NotificationMetadata | null;
};

export type CreateNotificationResult =
  | { ok: true; notification: NotificationRow }
  | { ok: false; error: string };

export type MarkNotificationReadResult =
  | { ok: true; notification: NotificationRow }
  | { ok: false; error: string };

export type MarkAllNotificationsReadResult =
  | { ok: true; updatedCount: number }
  | { ok: false; error: string };

export type ListNotificationsResult =
  | { ok: true; notifications: NotificationRow[]; unreadCount: number }
  | { ok: false; error: string };

export const NOTIFICATIONS_DEFAULT_LIMIT = 30;
export const NOTIFICATIONS_MAX_LIMIT = 100;

export const NOTIFICATIONS_SCHEMA_UNAVAILABLE =
  "Notifications are not available on this environment yet.";

const NOTIFICATION_TYPE_SET = new Set<string>(NOTIFICATION_TYPES);

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === "string" && NOTIFICATION_TYPE_SET.has(value);
}

function normalizeNotificationText(
  value: unknown,
  maxLength: number
): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return null;
  return trimmed;
}

function normalizeRecipientUserId(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

function normalizeMetadata(
  value: NotificationMetadata | null | undefined
): NotificationMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function mapNotificationRow(row: Record<string, unknown>): NotificationRow | null {
  const type = row.type;
  if (!isNotificationType(type)) return null;

  return {
    id: String(row.id ?? ""),
    recipient_user_id: String(row.recipient_user_id ?? ""),
    type,
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    metadata: normalizeMetadata(row.metadata as NotificationMetadata),
    read_at: row.read_at ? String(row.read_at) : null,
    created_at: String(row.created_at ?? ""),
  };
}

/**
 * Server-only: insert an inbox item for a participant.
 * Uses the service-role client so event hooks can notify across tenancy boundaries.
 */
export async function createNotification(
  input: CreateNotificationInput,
  client?: SupabaseClient
): Promise<CreateNotificationResult> {
  const recipientUserId = normalizeRecipientUserId(input.recipientUserId);
  if (!recipientUserId) {
    return { ok: false, error: "recipientUserId is required." };
  }

  if (!isNotificationType(input.type)) {
    return { ok: false, error: "Invalid notification type." };
  }

  const title = normalizeNotificationText(input.title, 240);
  const body = normalizeNotificationText(input.body, 4000);
  if (!title || !body) {
    return { ok: false, error: "Title and body are required." };
  }

  try {
    const supabase = client ?? createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        recipient_user_id: recipientUserId,
        type: input.type,
        title,
        body,
        metadata: normalizeMetadata(input.metadata),
      })
      .select(
        "id, recipient_user_id, type, title, body, metadata, read_at, created_at"
      )
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Could not create notification." };
    }

    const notification = mapNotificationRow(data as Record<string, unknown>);
    if (!notification) {
      return { ok: false, error: "Notification row could not be parsed." };
    }

    return { ok: true, notification };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create notification.";
    console.error("[createNotification]", input.type, err);
    return { ok: false, error: message };
  }
}

/**
 * Mark one inbox item read for the signed-in recipient.
 * Pass the authenticated server Supabase client (RLS enforces ownership).
 */
export async function markNotificationRead(
  supabase: SupabaseClient,
  args: { userId: string; notificationId: string }
): Promise<MarkNotificationReadResult> {
  const userId = normalizeRecipientUserId(args.userId);
  const notificationId = String(args.notificationId ?? "").trim();
  if (!userId || !notificationId) {
    return { ok: false, error: "userId and notificationId are required." };
  }

  const readAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", notificationId)
    .eq("recipient_user_id", userId)
    .is("read_at", null)
    .select(
      "id, recipient_user_id, type, title, body, metadata, read_at, created_at"
    )
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    const { data: existing, error: existingError } = await supabase
      .from("notifications")
      .select(
        "id, recipient_user_id, type, title, body, metadata, read_at, created_at"
      )
      .eq("id", notificationId)
      .eq("recipient_user_id", userId)
      .maybeSingle();

    if (existingError || !existing) {
      return { ok: false, error: "Notification not found." };
    }

    const notification = mapNotificationRow(existing as Record<string, unknown>);
    if (!notification) {
      return { ok: false, error: "Notification row could not be parsed." };
    }

    return { ok: true, notification };
  }

  const notification = mapNotificationRow(data as Record<string, unknown>);
  if (!notification) {
    return { ok: false, error: "Notification row could not be parsed." };
  }

  return { ok: true, notification };
}

/**
 * Mark all unread inbox items read for the signed-in recipient.
 */
export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<MarkAllNotificationsReadResult> {
  const recipientUserId = normalizeRecipientUserId(userId);
  if (!recipientUserId) {
    return { ok: false, error: "userId is required." };
  }

  const readAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("recipient_user_id", recipientUserId)
    .is("read_at", null)
    .select("id");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, updatedCount: data?.length ?? 0 };
}

function isNotificationsSchemaError(error: { message?: string; code?: string }): boolean {
  const message = String(error.message ?? "").toLowerCase();
  const code = String(error.code ?? "");
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("notifications") &&
      (message.includes("does not exist") || message.includes("schema cache")))
  );
}

/**
 * List inbox items for the signed-in recipient, newest first.
 */
export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  options?: { limit?: number }
): Promise<ListNotificationsResult> {
  const recipientUserId = normalizeRecipientUserId(userId);
  if (!recipientUserId) {
    return { ok: false, error: "userId is required." };
  }

  const limit = Math.min(
    Math.max(options?.limit ?? NOTIFICATIONS_DEFAULT_LIMIT, 1),
    NOTIFICATIONS_MAX_LIMIT
  );

  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, recipient_user_id, type, title, body, metadata, read_at, created_at"
    )
    .eq("recipient_user_id", recipientUserId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isNotificationsSchemaError(error)) {
      return { ok: true, notifications: [], unreadCount: 0 };
    }
    return { ok: false, error: error.message };
  }

  const notifications = (data ?? [])
    .map((row) => mapNotificationRow(row as Record<string, unknown>))
    .filter((row): row is NotificationRow => row !== null);

  const unreadCount = await getUnreadNotificationCount(supabase, recipientUserId);

  return {
    ok: true,
    notifications,
    unreadCount: unreadCount.ok ? unreadCount.count : 0,
  };
}

export type UnreadNotificationCountResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function getUnreadNotificationCount(
  supabase: SupabaseClient,
  userId: string
): Promise<UnreadNotificationCountResult> {
  const recipientUserId = normalizeRecipientUserId(userId);
  if (!recipientUserId) {
    return { ok: false, error: "userId is required." };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_user_id", recipientUserId)
    .is("read_at", null);

  if (error) {
    if (isNotificationsSchemaError(error)) {
      return { ok: true, count: 0 };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, count: count ?? 0 };
}

function metadataString(
  metadata: NotificationMetadata,
  key: string
): string | null {
  const value = metadata[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/** Resolve a quiet deep link from notification metadata and type. */
export function resolveNotificationHref(notification: NotificationRow): string | null {
  const href = metadataString(notification.metadata, "href");
  if (href?.startsWith("/")) return href;

  const opportunityId = metadataString(notification.metadata, "opportunity_id");
  const registryId = metadataString(notification.metadata, "registry_id");

  switch (notification.type) {
    case "opportunity_application_received":
      return "/studio/organisation";
    case "opportunity_shortlisted":
    case "opportunity_selected":
    case "opportunity_rejected":
      return opportunityId
        ? `/field/opportunities/${encodeURIComponent(opportunityId)}`
        : "/studio/creative";
    case "registry_verification_approved":
    case "registry_certificate_issued":
    case "registry_amendment_requested":
    case "registry_transfer_recorded":
      return registryId
        ? `/registry/${encodeURIComponent(registryId)}/ledger`
        : null;
    case "registry_authorship_invite_received":
    case "registry_custody_invite_received":
      return href;
    default:
      return null;
  }
}

export function isNotificationUnread(notification: NotificationRow): boolean {
  return notification.read_at === null;
}

/** Suggested metadata keys for deep links in PR-N2/N3 hooks. */
export type NotificationMetadataHints = {
  opportunityId?: string;
  applicationId?: string;
  amendmentId?: string;
  artworkId?: string;
  registryId?: string;
  inviteId?: string;
  inviteKind?: string;
  href?: string;
};

export function notificationMetadata(
  hints: NotificationMetadataHints
): NotificationMetadata {
  const metadata: NotificationMetadata = {};
  if (hints.opportunityId) metadata.opportunity_id = hints.opportunityId;
  if (hints.applicationId) metadata.application_id = hints.applicationId;
  if (hints.amendmentId) metadata.amendment_id = hints.amendmentId;
  if (hints.artworkId) metadata.artwork_id = hints.artworkId;
  if (hints.registryId) metadata.registry_id = hints.registryId;
  if (hints.inviteId) metadata.invite_id = hints.inviteId;
  if (hints.inviteKind) metadata.invite_kind = hints.inviteKind;
  if (hints.href) metadata.href = hints.href;
  return metadata;
}
