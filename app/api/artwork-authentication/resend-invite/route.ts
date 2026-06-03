import { NextResponse } from "next/server";

import { buildArtworkAuthenticationInvitationEmail } from "@/lib/emails/artwork-authentication-invitation";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { buildArtworkAuthenticationInviteUrl } from "@/lib/artwork-authentication-invite";
import { galleryApiError } from "@/lib/gallery-api-errors-i18n";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { resolveRequestLocale } from "@/lib/request-locale";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.invalidJson", "en") },
      { status: 400 }
    );
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const lang = resolveRequestLocale(
    req.headers.get("accept-language"),
    url.searchParams.get("lang"),
    o.lang
  );

  const inviteId = String(o.invite_id ?? o.inviteId ?? "").trim();

  if (!inviteId) {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.missingInviteId", lang) },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.unauthorized", lang) },
      { status: 401 }
    );
  }

  const { data: inv, error: invErr } = await supabase
    .from("artwork_authentication_invites")
    .select("id, gallery_id, artwork_id, artist_email, message, status")
    .eq("id", inviteId)
    .maybeSingle();

  if (invErr || !inv?.id) {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.inviteNotFound", lang) },
      { status: 404 }
    );
  }

  const { data: mem } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("gallery_id", inv.gallery_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem || mem.role !== "admin") {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.resendAdminOnly", lang) },
      { status: 403 }
    );
  }

  if (String(inv.status) === "authenticated") {
    return NextResponse.json(
      { error: galleryApiError("gallery.api.artworkAuthAlreadyCompleted", lang) },
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
      {
        error:
          upErr?.message || galleryApiError("gallery.api.couldNotRecordInvite", lang),
      },
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
    lang,
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
            galleryApiError("gallery.api.emailUpdatedFailed", lang),
        }),
  });
}
