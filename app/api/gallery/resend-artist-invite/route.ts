import { NextResponse } from "next/server";

import { INVITE_EMAIL_UPDATED_MAIL_FAILED_MESSAGE } from "@/lib/email-config";
import { buildArtistInvitationEmail } from "@/lib/emails/artist-gallery-invitation";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { getArtistTier } from "@/lib/artist-tier";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function redactInviteTokenInUrl(url: string): string {
  return url.replace(/([?&]invite_token=)[^&]*/i, "$1<redacted>");
}

function parseInviteId(body: Record<string, unknown>): string {
  const camel =
    typeof body.inviteId === "string" ? body.inviteId.trim() : "";
  const snake =
    typeof body.invite_id === "string" ? body.invite_id.trim() : "";
  return camel || snake;
}

/**
 * Re-issue a pending gallery invite on the same row: new CSPRNG token (see
 * generateInviteToken), reset expiry, clear used-at, refresh created_at, resend email.
 * Input is invite id only; gallery is resolved server-side. Response omits invite_token.
 */
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

  const iid = parseInviteId(body as Record<string, unknown>);
  if (!iid) {
    return NextResponse.json(
      { error: "Missing invite_id or inviteId." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();

  const { data: existing, error: selErr } = await service
    .from("gallery_artist_invites")
    .select("id, gallery_id, artist_email, status")
    .eq("id", iid)
    .maybeSingle();

  if (selErr || !existing?.gallery_id) {
    return NextResponse.json(
      { error: "Invitation not found." },
      { status: 404 }
    );
  }

  const gid = String(existing.gallery_id);

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("gallery_id", gid)
    .maybeSingle();

  if (memErr || !mem || mem.role !== "admin") {
    return NextResponse.json(
      { error: "Only gallery administrators can resend invitations." },
      { status: 403 }
    );
  }

  if (String(existing.status || "").toLowerCase() !== "pending") {
    return NextResponse.json(
      {
        error:
          "Only pending invitations can be reissued. Accepted or declined rows cannot be resent.",
      },
      { status: 400 }
    );
  }

  const { data: gal, error: galErr } = await service
    .from("galleries")
    .select("id, name, slug")
    .eq("id", gid)
    .maybeSingle();

  if (galErr || !gal?.id) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  const galleryName = gal.name?.trim() || "Gallery";
  const slugTrim = gal.slug?.trim() || "";
  const emailStr = String(existing.artist_email || "").trim().toLowerCase();

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();
  const nowIso = new Date().toISOString();

  const { data: row, error: updErr } = await service
    .from("gallery_artist_invites")
    .update({
      invite_token: token,
      token_expires_at: expiresAt,
      token_used_at: null,
      created_at: nowIso,
    })
    .eq("id", iid)
    .eq("gallery_id", gid)
    .eq("status", "pending")
    .select(
      "id, artist_email, status, created_at, visibility_status, token_expires_at"
    )
    .single();

  if (updErr || !row) {
    console.error("[gallery-invite-resend] update failed", updErr);
    return NextResponse.json(
      { error: updErr?.message || "Could not reissue invitation." },
      { status: 400 }
    );
  }

  const tier = getArtistTier(row, null);

  const siteUrl = getSiteUrl();
  const inviteLink = `${siteUrl}/signup?invite_token=${encodeURIComponent(token)}`;
  const galleryPublicPageUrl =
    slugTrim.length > 0 ? `${siteUrl}/gallery/${slugTrim}` : undefined;

  console.info("[gallery-invite-resend]", {
    galleryName,
    inviteLink: redactInviteTokenInUrl(inviteLink),
    invite_id: iid,
  });

  const { subject, html, text } = buildArtistInvitationEmail({
    galleryName,
    inviteLink,
    galleryPublicPageUrl,
    recipientEmail: emailStr,
  });

  const replyTo =
    typeof user.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
      ? user.email.trim()
      : undefined;

  let emailSent = false;
  const sent = await sendResendEmail({
    kind: "invitation",
    to: emailStr,
    subject,
    html,
    text,
    replyTo,
  });

  if (sent.ok) {
    emailSent = true;
  } else {
    const hint = hintForResendDeliveryError(sent.message);
    if (sent.message.includes("RESEND_API_KEY")) {
      console.info(
        "[gallery-invite-resend] Email not configured (missing RESEND_API_KEY)",
        { gallery_id: gid, invite_id: iid, artist_email: emailStr }
      );
    } else {
      console.error(
        "[gallery-invite-resend] Resend error",
        sent.status,
        sent.message,
        hint
      );
    }
  }

  return NextResponse.json(
    {
      ok: true,
      row: { ...row, tier },
      tier,
      emailSent,
      ...(emailSent
        ? {}
        : { emailDeliveryError: INVITE_EMAIL_UPDATED_MAIL_FAILED_MESSAGE }),
    },
    { status: 200 }
  );
}
