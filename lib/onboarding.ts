import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns `/onboarding` when the user must finish registry onboarding.
 * Returns `null` when the user may access role home (caller still routes by role).
 */
export async function getOnboardingRedirectPath(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: actor, error } = await supabase
    .from("actor_profiles")
    .select("role, onboarding_complete")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !actor?.role) {
    return "/onboarding";
  }

  const role = actor.role as string;
  const oc = Boolean(
    (actor as { onboarding_complete?: boolean }).onboarding_complete
  );

  if (role === "artist") {
    const { data: ar } = await supabase
      .from("artists")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (!ar || !oc) return "/onboarding";
    return null;
  }

  if (role === "collector") {
    const { data: cp } = await supabase
      .from("collector_profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!cp || !oc) return "/onboarding";
    return null;
  }

  if (role === "gallery") {
    const { data: gu } = await supabase
      .from("gallery_users")
      .select("gallery_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (!gu?.gallery_id || !oc) return "/onboarding";
    return null;
  }

  return "/onboarding";
}

/** Home route for a fully onboarded role (no onboarding redirect). */
export function homePathForRole(
  role: string | null | undefined
): string | null {
  switch (role) {
    case "gallery":
      return "/studio/organisation";
    case "collector":
      return "/studio/collector";
    case "artist":
      return "/studio/creative";
    default:
      return null;
  }
}
