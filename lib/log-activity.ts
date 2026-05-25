import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

/**
 * Log an activity event using the service-role client.
 * Silently swallows errors so callers don't need try/catch.
 */
export async function logActivityEvent({
  userId,
  type,
  message,
  artworkId = null,
  metadata = null,
}: {
  userId: string;
  type: string;
  message: string;
  artworkId?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const service = createSupabaseServiceClient();
    await service.rpc("log_activity_event", {
      p_user_id: userId,
      p_type: type,
      p_message: message,
      p_artwork_id: artworkId,
      p_metadata: metadata,
    });
  } catch (err) {
    console.error("[logActivityEvent]", type, err);
  }
}
