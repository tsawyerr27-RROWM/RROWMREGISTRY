import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

async function loadGalleryStaffUserIds(
  galleryId: string,
  excludeUserId?: string
): Promise<string[]> {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("gallery_users")
    .select("user_id")
    .eq("gallery_id", galleryId);

  if (error) {
    console.error("[logActivityForGalleryStaff] gallery_users", error);
    return [];
  }

  return (data ?? [])
    .map((row) => String(row.user_id ?? "").trim())
    .filter((userId) => userId && userId !== excludeUserId);
}

/** Log the same catalogue activity event for every staff member on an organisation account. */
export async function logActivityForGalleryStaff({
  galleryId,
  type,
  message,
  artworkId = null,
  metadata = null,
  excludeUserId,
}: {
  galleryId: string;
  type: string;
  message: string;
  artworkId?: string | null;
  metadata?: Record<string, unknown> | null;
  excludeUserId?: string;
}): Promise<void> {
  const staffIds = await loadGalleryStaffUserIds(galleryId, excludeUserId);
  if (staffIds.length === 0) return;

  await Promise.all(
    staffIds.map((userId) =>
      logActivityEvent({
        userId,
        type,
        message,
        artworkId,
        metadata,
      })
    )
  );
}

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
