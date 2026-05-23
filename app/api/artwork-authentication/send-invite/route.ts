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

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const artworkId = String(o.artwork_id ?? o.artworkId ?? "").trim();
  const emailRaw = String(o.artist_email ?? o.artistEmail ?? "").trim();
  const emailStr = emailRaw.toLowerCase();
  const message =
    typeof o.message === "string" ? o.message.trim().slice(0, 2000) : null;
  const artistName =
    typeof o.artist_name === "string" ? o.artist_name.trim().slice(0, 200) : null;

  if (!artworkId) {
    return NextResponse.json({ error: "Missing artwork_id" }, { status: 400 });
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

  const service = createSupabaseServiceClient();

  const { data: art, error: artErr } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, catalogue_artist_name, artist_id, filing_gallery_id"
    )
    .eq("id", artworkId)
    .maybeSingle();

  if (artErr || !art?.id) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  const galleryId = String(art.filing_gallery_id || "");
  if (!galleryId) {
    return NextResponse.json(
      { error: "This work has no institution filing context." },
      { status: 400 }
    );
  }

  const { data: mem } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("gallery_id", galleryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem || (mem.role !== "admin" && mem.role !== "staff")) {
    return NextResponse.json({ error: "Not authorised for this institution" }, { status: 403 });
  }

  const { data: gal } = await service
    .from("galleries")
    .select("name")
    .eq("id", galleryId)
    .maybeSingle();

  const { data: pendingDup } = await supabase
    .from("artwork_authentication_invites")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("status", "pending")
    .ilike("artist_email", emailStr)
    .maybeSingle();

  if (pendingDup?.id) {
    return NextResponse.json(
      {
        error: "A pending authentication invitation already exists for this address on this work.",
        duplicate: true as const,
        invite_id: pendingDup.id,
      },
      { status: 409 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();

  const { data: row, error: insErr } = await supabase
    .from("artwork_authentication_invites")
    .insert({
      artwork_id: artworkId,
      gallery_id: galleryId,
      artist_email: emailStr,
      artist_name: artistName || art.catalogue_artist_name || null,
      invite_token: token,
      message,
      status: "pending",
      token_expires_at: expiresAt,
      created_by_user_id: user.id,
    })
    .select(
      "id, artwork_id, gallery_id, artist_email, artist_name, status, created_at, token_expires_at, invite_token"
    )
    .single();

  if (insErr) {
    const code = String((insErr as { code?: string }).code ?? "");
    if (code === "23505") {
      return NextResponse.json(
        { error: "Duplicate pending invitation.", duplicate: true },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: insErr.message || "Could not record invitation." },
      { status: 400 }
    );
  }

  const siteUrl = getSiteUrl();
  const inviteLink = buildArtworkAuthenticationInviteUrl(siteUrl, token);
  const galleryName = gal?.name?.trim() || "Institution";
  const artworkTitle = String(art.title || "").trim() || "Work on file";
  const registryId = String(art.registry_id || "");

  const { subject, html, text } = buildArtworkAuthenticationInvitationEmail({
    galleryName,
    artworkTitle,
    registryId,
    inviteLink,
    recipientEmail: emailStr,
    personalMessage: message,
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
  if (sent.ok) emailSent = true;

  return NextResponse.json({
    ok: true,
    row,
    emailSent,
    ...(emailSent
      ? {}
      : {
          emailDeliveryError:
            sent.ok === false
              ? hintForResendDeliveryError(sent.message) ||
                INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE
              : INVITE_EMAIL_CREATED_MAIL_FAILED_MESSAGE,
        }),
  });
}
