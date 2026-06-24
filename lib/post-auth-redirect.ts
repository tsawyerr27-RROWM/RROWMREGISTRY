import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveArtworkAuthenticationReturnPath } from "@/lib/accept-artwork-auth-invite-client";
import { sanitizeAuthReturnPath } from "@/lib/auth-return-path";
import {
  getOnboardingRedirectPath,
  homePathForRole,
} from "@/lib/onboarding";

/**
 * Where to send the user immediately after sign-in or signup session is established.
 */
export async function resolvePostAuthRedirectPath(
  supabase: SupabaseClient,
  userId: string,
  options?: { explicitNext?: string | null }
): Promise<string> {
  const safeNext = sanitizeAuthReturnPath(options?.explicitNext);
  if (safeNext === "/reset-password") return safeNext;

  const needOnboarding = await getOnboardingRedirectPath(supabase, userId);
  if (needOnboarding) return needOnboarding;

  const artworkAuth = resolveArtworkAuthenticationReturnPath(
    options?.explicitNext
  );
  if (artworkAuth) return artworkAuth;

  if (safeNext) return safeNext;

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return homePathForRole(actor?.role) || "/studio/creative";
}
