import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TestUserRole = "artist" | "collector" | "gallery";

async function rollbackUser(service: SupabaseClient, uid: string) {
  await service.from("gallery_users").delete().eq("user_id", uid);
  await service.from("collector_profiles").delete().eq("user_id", uid);
  await service.from("artists").delete().eq("id", uid);
  await service.from("actor_profiles").delete().eq("user_id", uid);
  await service.auth.admin.deleteUser(uid);
}

/**
 * Server-only: creates a tagged test account (is_test) via service role.
 * Used by /api/admin/test/create-user.
 */
export async function createTestUser(
  service: SupabaseClient,
  role: TestUserRole
): Promise<
  | { ok: true; email: string; password: string; userId: string }
  | { ok: false; error: string }
> {
  const password = randomBytes(18).toString("base64url").slice(0, 24);
  const email = `test-${role}-${Date.now()}@test.rrowm.local`;
  const displayName =
    role === "artist"
      ? "Test Artist"
      : role === "collector"
        ? "Test Collector"
        : "Test Gallery";

  const { data: authData, error: authErr } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { is_test: true },
      user_metadata: { full_name: displayName },
    });

  if (authErr || !authData.user) {
    return {
      ok: false,
      error: authErr?.message || "Could not create auth user",
    };
  }

  const uid = authData.user.id;

  const { error: apErr } = await service.from("actor_profiles").insert({
    user_id: uid,
    role,
    display_name: displayName,
    is_test: true,
    onboarding_complete: true,
  });
  if (apErr) {
    await rollbackUser(service, uid);
    return { ok: false, error: apErr.message };
  }

  if (role === "artist") {
    const slug = `test-artist-${uid.replace(/-/g, "").slice(0, 12)}`;
    const { error: artErr } = await service.from("artists").insert({
      id: uid,
      full_name: displayName,
      display_name: displayName,
      slug,
      is_test: true,
    });
    if (artErr) {
      await rollbackUser(service, uid);
      return { ok: false, error: artErr.message };
    }
  }

  if (role === "collector") {
    const slug = `test-collector-${uid.replace(/-/g, "").slice(0, 12)}`;
    const { error: cpErr } = await service.from("collector_profiles").insert({
      user_id: uid,
      display_name: displayName,
      slug,
      is_public: false,
      is_test: true,
    });
    if (cpErr) {
      const msg = cpErr.message || "";
      if (!msg.toLowerCase().includes("does not exist")) {
        await rollbackUser(service, uid);
        return { ok: false, error: cpErr.message };
      }
    }
  }

  if (role === "gallery") {
    const slug = `test-gallery-${uid.replace(/-/g, "").slice(0, 10)}`;
    let gIns = await service
      .from("galleries")
      .insert({
        name: `${displayName} Org`,
        slug,
        verified: false,
        subscription_status: "grace",
        is_test: true,
      })
      .select("id")
      .single();

    if (gIns.error) {
      gIns = await service
        .from("galleries")
        .insert({
          name: `${displayName} Org`,
          slug: `${slug}-${randomBytes(2).toString("hex")}`,
          verified: false,
          is_test: true,
        })
        .select("id")
        .single();
    }

    if (gIns.error || !gIns.data?.id) {
      await rollbackUser(service, uid);
      return {
        ok: false,
        error: gIns.error?.message || "Gallery insert failed",
      };
    }

    const { error: guErr } = await service.from("gallery_users").insert({
      gallery_id: gIns.data.id,
      user_id: uid,
      role: "admin",
      is_test: true,
    });
    if (guErr) {
      await service.from("galleries").delete().eq("id", gIns.data.id);
      await rollbackUser(service, uid);
      return { ok: false, error: guErr.message };
    }
  }

  return { ok: true, email, password, userId: uid };
}
