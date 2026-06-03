import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import {
  banAuthUser,
  hasRecentAuthentication,
  isOAuthOnlyUser,
  requireAuthenticatedUser,
  verifyPasswordForUser,
} from "@/lib/account-lifecycle/auth-verify";
import { validateAccountCsrf } from "@/lib/account-lifecycle/csrf";
import {
  DELETION_CONFIRMATION_PHRASE,
  RATE_LIMITS,
} from "@/lib/account-lifecycle/constants";
import {
  getActorLifecycle,
  scheduleAccountDeletion,
} from "@/lib/account-lifecycle/lifecycle-service";
import { checkAccountActionRateLimit } from "@/lib/account-lifecycle/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { getSiteUrl } from "@/lib/site-url";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildDeletionScheduledEmail } from "@/lib/emails/account-lifecycle-email";
import { logActivityEvent } from "@/lib/log-activity";

export async function POST(req: Request) {
  if (!(await validateAccountCsrf(req))) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;
  const email = auth.user.email ?? "unknown";

  const allowed = await checkAccountActionRateLimit(
    "deletion_request",
    userId,
    RATE_LIMITS.deletionRequest.max,
    RATE_LIMITS.deletionRequest.windowSeconds
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many deletion requests." }, { status: 429 });
  }

  let body: {
    password?: string;
    confirmation?: string;
    acknowledged?: boolean;
    reason?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const confirmation = String(body.confirmation ?? "").trim();
  if (confirmation !== DELETION_CONFIRMATION_PHRASE) {
    return NextResponse.json(
      {
        error: `Confirmation must be exactly "${DELETION_CONFIRMATION_PHRASE}".`,
      },
      { status: 400 }
    );
  }

  if (!body.acknowledged) {
    return NextResponse.json(
      { error: "You must acknowledge the consequences." },
      { status: 400 }
    );
  }

  if (!isOAuthOnlyUser(auth.user)) {
    const password = String(body.password ?? "");
    if (!password) {
      return NextResponse.json(
        { error: "Password confirmation required.", requiresPassword: true },
        { status: 401 }
      );
    }
    const verified = await verifyPasswordForUser(email, password);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: 401 });
    }
  } else if (!hasRecentAuthentication(auth.user)) {
    return NextResponse.json(
      { error: "Recent sign-in required. Please sign out and sign in again." },
      { status: 401 }
    );
  }

  const service = createSupabaseServiceClient();
  const lifecycle = await getActorLifecycle(service, userId);
  if (lifecycle?.account_status === "pending_deletion") {
    return NextResponse.json({
      ok: true,
      alreadyScheduled: true,
      deletionScheduledAt: lifecycle.deletion_scheduled_at,
    });
  }

  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  await logActivityEvent({
    userId,
    type: "account_deletion_requested",
    message: `Account deletion requested for ${email}`,
    metadata: { email },
  });

  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: userId,
    eventType: "deletion_requested",
    ip,
    userAgent: ua,
    metadata: { reason: body.reason ?? null },
  });

  const { scheduledAt, recoveryToken } = await scheduleAccountDeletion({
    userId,
    actorUserId: userId,
    email,
    reason: body.reason ?? null,
  });

  await banAuthUser(userId);

  const restoreUrl = `${getSiteUrl()}/account/restore?token=${encodeURIComponent(recoveryToken)}`;

  if (email && email !== "unknown") {
    const mail = buildDeletionScheduledEmail({ scheduledAt, restoreUrl });
    await sendResendEmail({
      kind: "transactional",
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }

  return NextResponse.json({
    ok: true,
    deletionScheduledAt: scheduledAt,
    signOutRequired: true,
  });
}
