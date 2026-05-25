import { NextResponse } from "next/server";

import { INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE } from "@/lib/email-config";
import { buildArtworkAuthenticationInvitationEmail } from "@/lib/emails/artwork-authentication-invitation";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { buildArtworkAuthenticationInviteUrl } from "@/lib/artwork-authentication-invite";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const inviteId = String(
    (body as { invite_id?: string; inviteId?: string })?.invite_id ??
      (body as { inviteId?: string })?.inviteId ??
      ""
  ).trim();

  if (!inviteId) {
    return NextResponse.json({ error: "Missing invite_id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: inv, error: invErr } = await supabase
    .from("artwork_authentication_invites")
    .select("id, gallery_id, artwork_id, artist_email, message, status")
    .eq("id", inviteId)
    .maybeSingle();

  if (invErr || !inv?.id) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const { data: mem } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("gallery_id", inv.gallery_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem || mem.role !== "admin") {
    return NextResponse.json(
      { error: "Only gallery administrators can resend invitations." },
      { status: 403 }
    );
  }

  if (String(inv.status) === "authenticated") {
    return NextResponse.json(
      { error: "This invitation is already completed on file." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();
  const { data: art } = await service
    .from("artworks")
    .select("title, registry_id")
    .eq("id", inv.artwork_id)
    .maybeSingle();
  const { data: gal } = await service
    .from("galleries")
    .select("name")
    .eq("id", inv.gallery_id)
    .maybeSingle();

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();

  const { data: row, error: upErr } = await service
    .from("artwork_authentication_invites")
    .update({
      invite_token: token,
      token_expires_at: expiresAt,
      status: "pending",
      token_used_at: null,
    })
    .eq("id", inviteId)
    .select(
      "id, artwork_id, gallery_id, artist_email, artist_name, status, created_at, token_expires_at, invite_token"
    )
    .single();

  if (upErr || !row) {
    return NextResponse.json(
      { error: upErr?.message || "Could not refresh invitation." },
      { status: 400 }
    );
  }

  const emailStr = String(inv.artist_email).toLowerCase();
  const inviteLink = buildArtworkAuthenticationInviteUrl(getSiteUrl(), token);
  const { subject, html, text } = buildArtworkAuthenticationInvitationEmail({
    galleryName: gal?.name?.trim() || "Institution",
    artworkTitle: String(art?.title || "").trim() || "Work on file",
    registryId: String(art?.registry_id || ""),
    inviteLink,
    recipientEmail: emailStr,
    personalMessage: inv.message,
  });

  const sent = await sendResendEmail({
    kind: "invitation",
    to: emailStr,
    subject,
    html,
    text,
  });

  return NextResponse.json({
    ok: true,
    row,
    emailSent: sent.ok,
    ...(sent.ok
      ? {}
      : {
          emailDeliveryError:
            hintForResendDeliveryError(sent.message) ||
            INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE,
        }),
  });
}
