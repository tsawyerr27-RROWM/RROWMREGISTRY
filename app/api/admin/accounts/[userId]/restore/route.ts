import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import { requireAdminApi } from "@/lib/api-admin-auth";
import {
  cancelAccountDeletion,
  getActorLifecycle,
} from "@/lib/account-lifecycle/lifecycle-service";
import { unbanAuthUser } from "@/lib/account-lifecycle/auth-verify";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountRestoredEmail } from "@/lib/emails/account-lifecycle-email";

type Params = { params: Promise<{ userId: string }> };

export async function POST(req: Request, { params }: Params) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { userId } = await params;
  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, userId);

  if (
    lifecycle?.account_status !== "pending_deletion" &&
    lifecycle?.account_status !== "deactivated"
  ) {
    return NextResponse.json({ error: "Account not restorable." }, { status: 400 });
  }

  await cancelAccountDeletion(userId);
  await unbanAuthUser(userId);

  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: null,
    eventType: "deletion_cancelled",
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    metadata: { via: "admin_restore" },
  });

  const email = lifecycle?.deletion_notification_email;
  if (email) {
    const mail = buildAccountRestoredEmail();
    await sendResendEmail({
      kind: "transactional",
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }

  return NextResponse.json({ ok: true });
}
