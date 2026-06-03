import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import { requireAdminApi } from "@/lib/api-admin-auth";
import { getActorLifecycle } from "@/lib/account-lifecycle/lifecycle-service";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type Params = { params: Promise<{ userId: string }> };

export async function POST(req: Request, { params }: Params) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { userId } = await params;
  let body: { days?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const days = Math.min(Math.max(Number(body.days) || 30, 1), 90);
  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, userId);

  if (lifecycle?.account_status !== "pending_deletion") {
    return NextResponse.json({ error: "Account is not pending deletion." }, { status: 400 });
  }

  const scheduledAt = new Date(Date.now() + days * 86400000).toISOString();

  await service
    .from("actor_profiles")
    .update({
      deletion_scheduled_at: scheduledAt,
      recovery_token_expires_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: null,
    eventType: "deletion_extended",
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    metadata: { days, scheduledAt, via: "admin" },
  });

  return NextResponse.json({ ok: true, deletionScheduledAt: scheduledAt });
}
