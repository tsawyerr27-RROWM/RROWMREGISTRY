import { NextResponse } from "next/server";

import { maskArtistInviteEmail } from "@/lib/mask-email";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export type InvitePreviewPayload = {
  valid: boolean;
  expired: boolean;
  used: boolean;
  galleryName: string;
  maskedEmail: string;
};

function emptyPreview(): InvitePreviewPayload {
  return {
    valid: false,
    expired: false,
    used: false,
    galleryName: "",
    maskedEmail: "",
  };
}

/**
 * Public read of invite context for signup UX. Single JSON shape; `valid` means
 * the token may be used for signup. `used` is true when `token_used_at` is set or status is accepted.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();

  if (token.length < 32) {
    return NextResponse.json(emptyPreview(), { status: 400 });
  }

  const service = createSupabaseServiceClient();

  const { data: invite, error } = await service
    .from("gallery_artist_invites")
    .select(
      "artist_email, status, token_expires_at, token_used_at, gallery_id"
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error) {
    console.error("[invite/preview] select", error);
    return NextResponse.json(emptyPreview(), { status: 500 });
  }

  if (!invite) {
    return NextResponse.json(emptyPreview(), { status: 200 });
  }

  const { data: gal } = await service
    .from("galleries")
    .select("name")
    .eq("id", invite.gallery_id as string)
    .maybeSingle();

  const galleryName = String(gal?.name || "").trim() || "Gallery";
  const maskedEmail = maskArtistInviteEmail(String(invite.artist_email || ""));

  const statusNorm = String(invite.status || "").toLowerCase().trim();

  const used = invite.token_used_at != null;

  const expMs = invite.token_expires_at
    ? new Date(String(invite.token_expires_at)).getTime()
    : null;
  const expired =
    statusNorm === "pending" &&
    !used &&
    expMs != null &&
    Number.isFinite(expMs) &&
    expMs < Date.now();

  const valid = statusNorm === "pending" && !used && !expired;

  const payload: InvitePreviewPayload = {
    valid,
    expired,
    used,
    galleryName,
    maskedEmail,
  };

  if (statusNorm === "declined" || statusNorm === "accepted") {
    payload.valid = false;
    payload.expired = false;
    payload.used = statusNorm === "accepted" || used;
  }

  return NextResponse.json(payload, { status: 200 });
}
