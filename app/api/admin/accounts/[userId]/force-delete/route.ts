import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import { requireAdminApi } from "@/lib/api-admin-auth";
import {
  finaliseAccountDeletion,
  getActorLifecycle,
} from "@/lib/account-lifecycle/lifecycle-service";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { deleteAuthUser } from "@/lib/account-lifecycle/auth-verify";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountPermanentlyDeletedEmail } from "@/lib/emails/account-lifecycle-email";

type Params = { params: Promise<{ userId: string }> };

export async function POST(req: Request, { params }: Params) {
  const admin = await requireAdminApi(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { userId } = await params;
  const lifecycle = await getActorLifecycle(createSupabaseServiceClient(), userId);

  if (!lifecycle || lifecycle.account_status === "deleted") {
    return NextResponse.json({ error: "Account not eligible." }, { status: 400 });
  }

  await finaliseAccountDeletion(userId);

  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: null,
    eventType: "account_deleted",
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
    metadata: { via: "admin_force_delete" },
  });

  const del = await deleteAuthUser(userId);
  if (!del.ok) {
    return NextResponse.json({ error: del.error ?? "Delete failed." }, { status: 500 });
  }

  const email = lifecycle.deletion_notification_email;
  if (email) {
    const mail = buildAccountPermanentlyDeletedEmail();
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
