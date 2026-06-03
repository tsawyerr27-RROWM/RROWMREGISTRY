import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import type { AccountAuditEventType } from "@/lib/account-lifecycle/constants";

export async function logAccountAuditEvent({
  subjectUserId,
  actorUserId = null,
  eventType,
  ip = null,
  userAgent = null,
  metadata = null,
}: {
  subjectUserId: string;
  actorUserId?: string | null;
  eventType: AccountAuditEventType;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<string | null> {
  try {
    const service = createSupabaseServiceClient();
    const { data, error } = await service.rpc("log_account_audit_event", {
      p_subject_user_id: subjectUserId,
      p_actor_user_id: actorUserId,
      p_event_type: eventType,
      p_ip: ip,
      p_user_agent: userAgent,
      p_metadata: metadata,
    });
    if (error) {
      console.error("[logAccountAuditEvent]", eventType, error);
      return null;
    }
    return typeof data === "string" ? data : null;
  } catch (err) {
    console.error("[logAccountAuditEvent]", eventType, err);
    return null;
  }
}
