import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import {
  unbanAuthUser,
  requireAuthenticatedUser,
} from "@/lib/account-lifecycle/auth-verify";
import { validateAccountCsrf } from "@/lib/account-lifecycle/csrf";
import {
  cancelAccountDeletion,
  getActorLifecycle,
} from "@/lib/account-lifecycle/lifecycle-service";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountRestoredEmail } from "@/lib/emails/account-lifecycle-email";

export async function POST(req: Request) {
  if (!(await validateAccountCsrf(req))) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;
  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, userId);

  if (lifecycle?.account_status !== "pending_deletion") {
    return NextResponse.json({ error: "No pending deletion to cancel." }, { status: 400 });
  }

  await cancelAccountDeletion(userId);
  await unbanAuthUser(userId);

  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: userId,
    eventType: "deletion_cancelled",
    ip,
    userAgent: ua,
  });

  const email = auth.user.email;
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
