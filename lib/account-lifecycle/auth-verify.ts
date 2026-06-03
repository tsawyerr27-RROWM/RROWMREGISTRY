import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RECENT_AUTH_MAX_AGE_MS } from "@/lib/account-lifecycle/constants";

export function isOAuthOnlyUser(user: User): boolean {
  const providers = user.identities?.map((i) => i.provider) ?? [];
  const hasEmail = providers.includes("email");
  const hasOAuth = providers.some((p) => p !== "email");
  return hasOAuth && !hasEmail;
}

export function getPrimaryAuthProvider(user: User): string {
  const providers = user.identities?.map((i) => i.provider) ?? [];
  if (providers.includes("email")) return "email";
  return providers[0] ?? "email";
}

export function hasRecentAuthentication(user: User): boolean {
  const lastSignIn = user.last_sign_in_at;
  if (!lastSignIn) return false;
  const ts = new Date(lastSignIn).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= RECENT_AUTH_MAX_AGE_MS;
}

export async function verifyPasswordForUser(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Incorrect password." };
  }
  return { ok: true };
}

export async function requireAuthenticatedUser(): Promise<
  | { ok: true; user: User }
  | { ok: false; status: number; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return { ok: false, status: 401, error: "Not authenticated." };
  }

  return { ok: true, user };
}

export async function banAuthUser(userId: string): Promise<void> {
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service-role");
  const service = createSupabaseServiceClient();
  await service.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
    user_metadata: { account_status: "restricted" },
  });
}

export async function unbanAuthUser(userId: string): Promise<void> {
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service-role");
  const service = createSupabaseServiceClient();
  await service.auth.admin.updateUserById(userId, {
    ban_duration: "none",
    user_metadata: { account_status: "active" },
  });
}

export async function deleteAuthUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const { createSupabaseServiceClient } = await import("@/lib/supabase-service-role");
  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
