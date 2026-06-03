import { DELETED_USER_LABEL } from "@/lib/account-lifecycle/constants";
import type { AccountStatus } from "@/lib/account-lifecycle/constants";

export function resolveParticipantDisplayName(input: {
  userId?: string | null;
  displayName?: string | null;
  accountStatus?: AccountStatus | string | null;
}): string | null {
  if (!input.userId) return null;
  const status = input.accountStatus;
  if (status === "deleted" || status === "pending_deletion" || status === "deactivated") {
    return DELETED_USER_LABEL;
  }
  const name = input.displayName?.trim();
  if (!name || name === "[deleted]" || name === DELETED_USER_LABEL) {
    return DELETED_USER_LABEL;
  }
  return name;
}
