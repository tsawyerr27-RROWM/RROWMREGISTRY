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
import { RATE_LIMITS } from "@/lib/account-lifecycle/constants";
import { deactivateAccount, getActorLifecycle } from "@/lib/account-lifecycle/lifecycle-service";
import { checkAccountActionRateLimit } from "@/lib/account-lifecycle/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountDeactivatedEmail } from "@/lib/emails/account-lifecycle-email";

export async function POST(req: Request) {
  if (!(await validateAccountCsrf(req))) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.user.id;
  const email = auth.user.email ?? "";

  const allowed = await checkAccountActionRateLimit(
    "deactivate",
    userId,
    RATE_LIMITS.deactivate.max,
    RATE_LIMITS.deactivate.windowSeconds
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  let body: { password?: string } = {};
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    body = {};
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
    return NextResponse.json(
      { error: "Cancel pending deletion before deactivating." },
      { status: 400 }
    );
  }
  if (lifecycle?.account_status === "deactivated") {
    return NextResponse.json({ ok: true, alreadyDeactivated: true });
  }

  await deactivateAccount(userId);
  await banAuthUser(userId);

  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: userId,
    eventType: "account_deactivated",
    ip,
    userAgent: ua,
  });

  if (email) {
    const mail = buildAccountDeactivatedEmail();
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
