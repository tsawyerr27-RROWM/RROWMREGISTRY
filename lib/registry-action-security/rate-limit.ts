import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

/** Reuses account_action_rate_limits + check_account_action_rate_limit RPC. */
export async function checkRegistryActionRateLimit(
  actionKey: string,
  subjectKey: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const service = createSupabaseServiceClient();
    const { data, error } = await service.rpc("check_account_action_rate_limit", {
      p_action_key: `registry:${actionKey}`,
      p_subject_key: subjectKey,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[registry-rate-limit]", actionKey, error);
      return true;
    }
    return data === true;
  } catch {
    return true;
  }
}
