/**
 * Central Resend delivery for RROWM transactional mail.
 * Do not log full HTML bodies or invite URLs — subject + recipient count only.
 */

import { EMAIL_FROM } from "@/lib/email-config";
import { readResendApiKey } from "@/lib/resend-env";

export type ResendEmailKind =
  | "invitation"
  | "registry_notification"
  | "transactional";

/**
 * Resolve From header by purpose.
 * RESEND_FROM_INVITATIONS / RESEND_FROM_REGISTRY override the mailbox only;
 * fallback is always EMAIL_FROM (no-reply@email.rrowm.io).
 */
export function resolveResendFrom(kind: ResendEmailKind): string {
  const invitations = process.env.RESEND_FROM_INVITATIONS?.trim();
  const registry = process.env.RESEND_FROM_REGISTRY?.trim();

  switch (kind) {
    case "invitation":
      return invitations || EMAIL_FROM;
    case "registry_notification":
      return registry || EMAIL_FROM;
    case "transactional":
    default:
      return registry || EMAIL_FROM;
  }
}

export async function readResendErrorDetail(res: Response): Promise<string> {
  const raw = (await res.text().catch(() => "")).trim();
  if (!raw) return `HTTP ${res.status}`;
  try {
    const j = JSON.parse(raw) as { message?: unknown };
    const msg =
      typeof j.message === "string"
        ? j.message.trim()
        : Array.isArray(j.message)
          ? j.message
              .map((x) => (typeof x === "string" ? x : ""))
              .filter(Boolean)
              .join("; ")
          : "";
    if (msg) return msg.slice(0, 400);
  } catch {
    /* not JSON */
  }
  return raw.slice(0, 400);
}

export function hintForResendDeliveryError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("domain") || m.includes("verify") || m.includes("not allowed"))
    return " In Resend, verify email.rrowm.io and use RESEND_FROM_* addresses on that domain.";
  if (m.includes("from") || m.includes("sender"))
    return " Check RESEND_FROM_INVITATIONS / RESEND_FROM_REGISTRY match a verified mailbox on email.rrowm.io (fallback: EMAIL_FROM in lib/email-config.ts).";
  if (
    m.includes("api key") ||
    m.includes("unauthorized") ||
    m.includes("invalid key") ||
    m.includes("invalid api")
  ) {
    return " In Resend → API Keys, set RESEND_API_KEY in .env.local (starts with re_). Restart Next after saving.";
  }
  return "";
}

export type SendResendEmailParams = {
  kind: ResendEmailKind;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendResendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; status: number; message: string };

export async function sendResendEmail(
  params: SendResendEmailParams
): Promise<SendResendEmailResult> {
  const key = readResendApiKey();
  if (!key) {
    return { ok: false, status: 0, message: "RESEND_API_KEY not configured" };
  }

  const from = resolveResendFrom(params.kind);
  const toList = Array.isArray(params.to) ? params.to : [params.to];

  const payload: Record<string, unknown> = {
    from,
    to: toList,
    subject: params.subject,
    html: params.html,
    text: params.text,
  };
  if (params.replyTo) payload.reply_to = params.replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await readResendErrorDetail(res);
    console.error(`[resend:${params.kind}] delivery failed`, {
      status: res.status,
      message,
      toCount: toList.length,
    });
    return { ok: false, status: res.status, message };
  }

  let id: string | undefined;
  try {
    const j = (await res.json()) as { id?: string };
    if (typeof j.id === "string") id = j.id;
  } catch {
    /* ignore */
  }

  console.info(`[resend:${params.kind}] sent`, {
    toCount: toList.length,
    subjectSnippet: params.subject.slice(0, 96),
    ...(id ? { id } : {}),
  });

  return { ok: true, id };
}
