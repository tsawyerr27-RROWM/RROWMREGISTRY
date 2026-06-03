export const DELETED_USER_LABEL = "Deleted User";

export const ACCOUNT_STATUSES = [
  "active",
  "deactivated",
  "pending_deletion",
  "deleted",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const DELETION_GRACE_DAYS = 30;

export const DELETION_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export const DELETION_GRACE_MS = DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;

export const RECENT_AUTH_MAX_AGE_MS = 15 * 60 * 1000;

export const ACCOUNT_AUDIT_EVENTS = [
  "account_created",
  "account_updated",
  "account_deactivated",
  "account_reactivated",
  "deletion_requested",
  "deletion_cancelled",
  "deletion_extended",
  "account_deleted",
  "data_export_requested",
  "data_export_ready",
  "data_export_failed",
] as const;

export type AccountAuditEventType = (typeof ACCOUNT_AUDIT_EVENTS)[number];

export const RATE_LIMITS = {
  deletionRequest: { max: 3, windowSeconds: 86400 },
  deactivate: { max: 5, windowSeconds: 3600 },
  export: { max: 3, windowSeconds: 86400 },
  reauth: { max: 10, windowSeconds: 3600 },
} as const;
