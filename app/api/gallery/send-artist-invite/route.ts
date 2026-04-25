import { NextResponse } from "next/server";

import { escapeHtml } from "@/lib/html-escape";
import { readResendApiKey } from "@/lib/resend-env";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function resolvePublicOrigin(req: Request): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "").trim();
  if (explicit) return explicit;

  try {
    const fromReq = new URL(req.url).origin;
    if (fromReq && fromReq !== "null") return fromReq;
  } catch {
    /* ignore */
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const v = vercel.replace(/^https?:\/\//, "");
    return `https://${v}`;
  }
  const forwarded = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (forwarded) return `${proto}://${forwarded}`;
  return "";
}

function resendResOk(res: Response) {
  return res.ok;
}

async function readResendErrorDetail(res: Response): Promise<string> {
  const raw = (await res.text().catch(() => "")).trim();
  if (!raw) return `HTTP ${res.status}`;
  try {
    const j = JSON.parse(raw) as { message?: unknown; name?: unknown };
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

function hintForResendError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("domain") || m.includes("verify") || m.includes("not allowed"))
    return " In Resend, verify the domain you send from, or use Resend’s test sender onboarding@resend.dev until DNS is ready.";
  if (m.includes("from") || m.includes("sender"))
    return " Check GALLERY_INVITE_EMAIL_FROM / CONTACT_EMAIL_FROM matches a verified domain in Resend.";
  if (
    m.includes("api key") ||
    m.includes("unauthorized") ||
    m.includes("invalid key") ||
    m.includes("invalid api")
  ) {
    return " In Resend → API Keys, create a new key and paste the full value into RESEND_API_KEY in .env.local (it normally starts with re_). No quotes around the value. Restart next dev after saving.";
  }
  return "";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { gallery_id, artist_email } = body as Record<string, unknown>;
  const gid = typeof gallery_id === "string" ? gallery_id.trim() : "";
  const emailRaw = typeof artist_email === "string" ? artist_email.trim() : "";
  const emailStr = emailRaw.toLowerCase();

  if (!gid) {
    return NextResponse.json({ error: "Missing gallery_id" }, { status: 400 });
  }
  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return NextResponse.json({ error: "Invalid artist_email" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("gallery_id", gid)
    .maybeSingle();

  if (memErr || !mem || mem.role !== "admin") {
    return NextResponse.json(
      { error: "Only gallery administrators can send invitations." },
      { status: 403 }
    );
  }

  const { data: row, error: insErr } = await supabase
    .from("gallery_artist_invites")
    .insert({
      gallery_id: gid,
      artist_email: emailStr,
      status: "pending",
    })
    .select("id, artist_email, status, created_at")
    .single();

  if (insErr || !row) {
    return NextResponse.json(
      { error: insErr?.message || "Could not record invite." },
      { status: 400 }
    );
  }

  const { data: gal } = await supabase
    .from("galleries")
    .select("name, slug")
    .eq("id", gid)
    .maybeSingle();

  const galleryName = gal?.name?.trim() || "A gallery";
  const slug = gal?.slug?.trim() || "";
  const origin = resolvePublicOrigin(req);
  const base = origin.replace(/\/$/, "");
  const signupLink = base
    ? `${base}/signup?role=artist&email=${encodeURIComponent(emailStr)}`
    : "";
  const galleryPage =
    base && slug
      ? `${base}/institutional-studio/${encodeURIComponent(slug)}`
      : "";

  const resendKey = readResendApiKey();
  const from =
    process.env.GALLERY_INVITE_EMAIL_FROM?.trim() ||
    process.env.CONTACT_EMAIL_FROM?.trim();

  let emailSent = false;

  if (resendKey && from) {
    if (!signupLink) {
      console.error(
        "[gallery-invite] Cannot build absolute links (set NEXT_PUBLIC_APP_URL)"
      );
      return NextResponse.json(
        {
          ok: true,
          row,
          emailSent: false,
          emailDeliveryError:
            "Invite was saved, but email was skipped: set NEXT_PUBLIC_APP_URL to a public https URL so invitation links are valid.",
        },
        { status: 200 }
      );
    }

    const subject = `${galleryName} invited you to join the RROWM Registry`;
    const safeName = escapeHtml(galleryName);
    const safeEmail = escapeHtml(emailStr);
    const safeSignupLink = escapeHtml(signupLink);
    const safeGalleryPage = galleryPage ? escapeHtml(galleryPage) : "";
    const textLines = [
      `${galleryName} invited you to join the RROWM Registry as a represented artist.`,
      "",
      "To accept the invitation:",
      `1) Open: ${signupLink}`,
      "2) Create your account with this email address",
      "3) Complete artist setup (your profile will link to the gallery automatically)",
      ...(galleryPage ? ["", `Gallery page: ${galleryPage}`] : []),
      "",
      `This email was sent to ${emailStr}. If you were not expecting it, you can ignore it.`,
    ];
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#171717;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">
          <strong>${safeName}</strong> invited you to join the <strong>RROWM Registry</strong> as a represented artist.
        </p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#404040;">
          Use the button below to create your account with this email address. After you complete artist setup, your profile will be linked to the gallery automatically.
        </p>
        <p style="margin:0 0 14px;">
          <a href="${safeSignupLink}" style="display:inline-block;padding:10px 18px;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">Accept invitation</a>
        </p>
        ${
          safeGalleryPage
            ? `<p style="margin:0 0 6px;font-size:13px;line-height:1.55;color:#525252;">Prefer to review first? <a href="${safeGalleryPage}" style="color:#171717;text-decoration:underline;text-underline-offset:3px;">View the gallery page</a>.</p>`
            : ""
        }
        <div style="margin:14px 0 0;padding:14px 14px 12px;border:1px solid #e7e5e4;border-radius:12px;background:#fafaf9;">
          <p style="margin:0 0 6px;font-size:12px;color:#525252;font-weight:600;">What happens next</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.55;color:#404040;">
            <li>Create your account using this email address</li>
            <li>Complete artist setup</li>
            <li>Your artist profile will appear in the gallery roster</li>
          </ul>
        </div>
        <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#525252;">
          If you were not expecting this email, you can ignore it.
        </p>
      </div>
      <hr style="margin:28px 0;border:none;border-top:1px solid #e5e5e5;" />
      <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#737373;">To: ${safeEmail}</p>
    `;

    const replyTo =
      typeof user.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
        ? user.email.trim()
        : undefined;

    const payload: Record<string, unknown> = {
      from,
      to: [emailStr],
      subject,
      html,
      text: textLines.join("\n"),
    };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resendResOk(res)) {
      const detail = await readResendErrorDetail(res);
      console.error("[gallery-invite] Resend error", res.status, detail);
      const hint = hintForResendError(detail);
      return NextResponse.json(
        {
          ok: true,
          row,
          emailSent: false,
          emailDeliveryError: `Resend could not send the message (${detail}).${hint}`,
        },
        { status: 200 }
      );
    }
    emailSent = true;
  } else {
    console.info("[gallery-invite] Email not configured (missing RESEND_API_KEY or from address)", {
      gallery_id: gid,
      artist_email: emailStr,
    });
  }

  return NextResponse.json({ ok: true, row, emailSent }, { status: 200 });
}
