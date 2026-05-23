import { NextResponse } from "next/server";

import { INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE } from "@/lib/email-config";
import { buildArtistInvitationEmail } from "@/lib/emails/artist-gallery-invitation";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { getArtistTier } from "@/lib/artist-tier";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function redactInviteTokenInUrl(url: string): string {
  return url.replace(/([?&]invite_token=)[^&]*/i, "$1<redacted>");
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

  const { data: gal, error: galErr } = await supabase
    .from("galleries")
    .select("id, name, slug")
    .eq("id", gid)
    .maybeSingle();

  if (galErr) {
    console.error("[gallery-invite] galleries lookup", galErr);
    return NextResponse.json(
      { error: "Could not load gallery." },
      { status: 500 }
    );
  }

  if (!gal?.id) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  const galleryName = gal.name?.trim() || "Gallery";
  const slugTrim = gal.slug?.trim() || "";

  const { data: pendingDup, error: dupErr } = await supabase
    .from("gallery_artist_invites")
    .select("id")
    .eq("gallery_id", gid)
    .eq("status", "pending")
    .ilike("artist_email", emailStr)
    .maybeSingle();

  if (dupErr) {
    console.error("[gallery-invite] duplicate lookup", dupErr);
    return NextResponse.json(
      { error: "Could not verify invitation state." },
      { status: 500 }
    );
  }

  if (pendingDup?.id) {
    return NextResponse.json(
      {
        error: "This artist has already been invited.",
        duplicate: true as const,
        invite_id: pendingDup.id,
      },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();

  const { data: row, error: insErr } = await supabase
    .from("gallery_artist_invites")
    .insert({
      gallery_id: gid,
      artist_email: emailStr,
      status: "pending",
      visibility_status: "pending",
      invite_token: token,
      token_expires_at: expiresAt,
    })
    .select(
      "id, artist_email, status, created_at, visibility_status, invite_token, token_expires_at"
    )
    .single();

  if (insErr) {
    const code = (insErr as { code?: string }).code;
    if (code === "23505") {
      const { data: raceDup } = await supabase
        .from("gallery_artist_invites")
        .select("id")
        .eq("gallery_id", gid)
        .eq("status", "pending")
        .ilike("artist_email", emailStr)
        .maybeSingle();
      return NextResponse.json(
        {
          error: "This artist has already been invited.",
          duplicate: true as const,
          ...(raceDup?.id ? { invite_id: raceDup.id } : {}),
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: insErr.message || "Could not record invite." },
      { status: 400 }
    );
  }

  if (!row) {
    return NextResponse.json({ error: "Could not record invite." }, { status: 400 });
  }

  const tier = getArtistTier(row, null);

  const siteUrl = getSiteUrl();
  const inviteLink = `${siteUrl}/signup?invite_token=${encodeURIComponent(token)}`;
  const galleryPublicPageUrl =
    slugTrim.length > 0 ? `${siteUrl}/gallery/${slugTrim}` : undefined;

  console.info("[gallery-invite]", {
    galleryName,
    inviteLink: redactInviteTokenInUrl(inviteLink),
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
        "[gallery-invite] Email not configured (missing RESEND_API_KEY)",
        {
          gallery_id: gid,
          artist_email: emailStr,
        }
      );
    } else {
      console.error(
        "[gallery-invite] Resend error",
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
        : { emailDeliveryError: INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE }),
    },
    { status: 200 }
  );
}
