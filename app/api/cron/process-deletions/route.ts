import { NextResponse } from "next/server";
import { logAccountAuditEvent } from "@/lib/account-lifecycle/audit-log";
import { deleteAuthUser } from "@/lib/account-lifecycle/auth-verify";
import {
  finaliseAccountDeletion,
  listExpiredPendingDeletions,
} from "@/lib/account-lifecycle/lifecycle-service";
import { sendResendEmail } from "@/lib/emails/send-email";
import { buildAccountPermanentlyDeletedEmail } from "@/lib/emails/account-lifecycle-email";
import { authorizeCronRequest } from "@/lib/cron-auth";

export async function POST(req: Request) {
  if (!authorizeCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await listExpiredPendingDeletions();
  const results: Array<{ userId: string; ok: boolean; error?: string }> = [];

  for (const row of expired) {
    const userId = row.user_id;
    try {
      await finaliseAccountDeletion(userId);

      await logAccountAuditEvent({
        subjectUserId: userId,
        actorUserId: null,
        eventType: "account_deleted",
        metadata: { via: "cron" },
      });

      const del = await deleteAuthUser(userId);
      if (!del.ok) {
        results.push({ userId, ok: false, error: del.error });
        continue;
      }

      const email = row.deletion_notification_email;
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

      results.push({ userId, ok: true });
    } catch (err) {
      console.error("[cron/process-deletions]", userId, err);
      results.push({
        userId,
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}

export async function GET(req: Request) {
  return POST(req);
}
