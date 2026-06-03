import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import {
  requireAuthenticatedUser,
  verifyPasswordForUser,
  isOAuthOnlyUser,
  hasRecentAuthentication,
} from "@/lib/account-lifecycle/auth-verify";
import { validateAccountCsrf } from "@/lib/account-lifecycle/csrf";
import { RATE_LIMITS } from "@/lib/account-lifecycle/constants";
import { checkAccountActionRateLimit } from "@/lib/account-lifecycle/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/account-lifecycle/request-meta";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import { buildUserDataExport, buildExportBundle } from "@/lib/account-lifecycle/data-export";
import { getSiteUrl } from "@/lib/site-url";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildDataExportReadyEmail } from "@/lib/emails/account-lifecycle-email";

const EXPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  if (!(await validateAccountCsrf(req))) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const auth = await requireAuthenticatedUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const userId = auth.user.id;
  const email = auth.user.email ?? "";

  const allowed = await checkAccountActionRateLimit(
    "data_export",
    userId,
    RATE_LIMITS.export.max,
    RATE_LIMITS.export.windowSeconds
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many export requests." }, { status: 429 });
  }

  let body: { password?: string } = {};
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    body = {};
  }

  if (!isOAuthOnlyUser(auth.user)) {
    if (!hasRecentAuthentication(auth.user)) {
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
    }
  }

  const service = createSupabaseServiceClient();

  const { data: actor } = await service
    .from("actor_profiles")
    .select("account_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (actor?.account_status === "pending_deletion" || actor?.account_status === "deleted") {
    return NextResponse.json({ error: "Account is not eligible for export." }, { status: 400 });
  }

  const { data: row, error: insErr } = await service
    .from("data_export_requests")
    .insert({ user_id: userId, status: "processing", format: "json" })
    .select("id")
    .single();

  if (insErr || !row?.id) {
    return NextResponse.json({ error: "Could not create export request." }, { status: 500 });
  }

  await logAccountAuditEvent({
    subjectUserId: userId,
    actorUserId: userId,
    eventType: "data_export_requested",
    ip,
    userAgent: ua,
    metadata: { export_id: row.id },
  });

  try {
    const exportData = await buildUserDataExport(service, userId);
    const bundle = buildExportBundle(exportData);
    const expiresAt = new Date(Date.now() + EXPORT_TTL_MS).toISOString();

    await service
      .from("data_export_requests")
      .update({
        status: "ready",
        export_payload: { json: exportData, csv: bundle.csv },
        expires_at: expiresAt,
        completed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    await logAccountAuditEvent({
      subjectUserId: userId,
      actorUserId: userId,
      eventType: "data_export_ready",
      ip,
      userAgent: ua,
      metadata: { export_id: row.id },
    });

    const downloadUrl = `${getSiteUrl()}/api/account/export/${row.id}`;
    if (email) {
      const mail = buildDataExportReadyEmail({ downloadUrl, expiresAt });
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
      exportId: row.id,
      downloadUrl,
      expiresAt,
    });
  } catch (err) {
    console.error("[account/export]", err);
    await service
      .from("data_export_requests")
      .update({ status: "failed", error_message: "Export generation failed." })
      .eq("id", row.id);
    await logAccountAuditEvent({
      subjectUserId: userId,
      actorUserId: userId,
      eventType: "data_export_failed",
      ip,
      userAgent: ua,
      metadata: { export_id: row.id },
    });
    return NextResponse.json({ error: "Export generation failed." }, { status: 500 });
  }
}
