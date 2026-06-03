import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/account-lifecycle/auth-verify";
import { getActorLifecycle } from "@/lib/account-lifecycle/lifecycle-service";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, auth.user.id);

  return NextResponse.json({
    accountStatus: lifecycle?.account_status ?? "active",
    deletionScheduledAt: lifecycle?.deletion_scheduled_at ?? null,
    deactivatedAt: lifecycle?.deactivated_at ?? null,
    email: auth.user.email ?? null,
    authProvider:
      auth.user.identities?.[0]?.provider ??
      (auth.user.app_metadata?.provider as string | undefined) ??
      "email",
  });
}
