import type { SupabaseClient } from "@supabase/supabase-js";

export type GalleryStaffContext = {
  userId: string;
  galleryId: string;
  role: string;
};

export async function requireGalleryStaff(
  supabase: SupabaseClient,
  galleryId: string
): Promise<
  | { ok: true; staff: GalleryStaffContext }
  | { ok: false; status: 401 | 403; error: string }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("gallery_id", galleryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr || !mem) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return {
    ok: true,
    staff: { userId: user.id, galleryId, role: String(mem.role) },
  };
}

export async function resolveStaffGalleryId(
  supabase: SupabaseClient
): Promise<
  | { ok: true; galleryId: string }
  | { ok: false; status: 401 | 403; error: string }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("gallery_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memErr || !mem?.gallery_id) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, galleryId: String(mem.gallery_id) };
}
