import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import { unbanAuthUser } from "@/lib/account-lifecycle/auth-verify";
import {
  restoreAccountByToken,
  getActorLifecycle,
} from "@/lib/account-lifecycle/lifecycle-service";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountRestoredEmail } from "@/lib/emails/account-lifecycle-email";

export async function POST(req: Request) {
  let body: { token?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Missing recovery token." }, { status: 400 });
  }

  const userId = await restoreAccountByToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired recovery link." }, { status: 400 });
  }

  await unbanAuthUser(userId);

  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: userId,
    eventType: "deletion_cancelled",
    ip,
    userAgent: ua,
    metadata: { via: "recovery_token" },
  });

  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, userId);
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

  return NextResponse.json({ ok: true, userId });
}
