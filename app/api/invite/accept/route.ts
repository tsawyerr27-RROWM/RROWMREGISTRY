import { NextResponse } from "next/server";

import { getArtistTier } from "@/lib/artist-tier";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

/** Single-use token acceptance: bind invite to the authenticated user (same email). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token =
    body && typeof body === "object"
      ? String(
          (body as { token?: unknown; invite_token?: unknown }).token ??
            (body as { invite_token?: unknown }).invite_token ??
            ""
        ).trim()
      : "";

  if (!token || token.length < 32) {
    return NextResponse.json(
      { error: "Invalid invitation. The link may be incomplete or edited." },
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
      {
        error:
          "Please sign in (or verify your email) before accepting this invitation.",
      },
      { status: 401 }
    );
  }

  const emailLc = user.email?.trim().toLowerCase() ?? "";
  if (!emailLc) {
    return NextResponse.json(
      {
        error:
          "Your session has no verified email claim; sign in again and retry.",
      },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();

  const { data: invite, error: selErr } = await service
    .from("gallery_artist_invites")
    .select(
      "id, artist_email, status, invite_token, token_expires_at, token_used_at, gallery_id"
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (selErr || !invite) {
    return NextResponse.json(
      {
        error:
          "This invitation is not recognised. It may be incorrect, withdrawn, or already completed.",
      },
      { status: 404 }
    );
  }

  if (String(invite.status || "").toLowerCase() !== "pending") {
    return NextResponse.json(
      {
        error:
          "This invitation is no longer active. It may already have been accepted or closed.",
      },
      { status: 410 }
    );
  }

  if (invite.token_used_at != null) {
    return NextResponse.json(
      {
        error:
          "This invitation has already been used. Sign in with your invited email, or request a new invitation from the institution.",
      },
      { status: 410 }
    );
  }

  if (String(invite.invite_token || "") !== token) {
    return NextResponse.json(
      {
        error:
          "This invitation link is no longer valid. Request a fresh invitation from the institution.",
      },
      { status: 410 }
    );
  }

  if (
    invite.token_expires_at &&
    new Date(String(invite.token_expires_at)).getTime() < Date.now()
  ) {
    return NextResponse.json(
      {
        error:
          "This invitation has expired. Ask the institution to send a new invitation from the registry.",
      },
      { status: 410 }
    );
  }

  if (String(invite.artist_email || "").trim().toLowerCase() !== emailLc) {
    return NextResponse.json(
      {
        error:
          "Sign in using the invited email address, or register with exactly that email to continue.",
      },
      { status: 403 }
    );
  }

  const nowIso = new Date().toISOString();

  const { error: updErr } = await service
    .from("gallery_artist_invites")
    .update({
      status: "accepted",
      accepted_at: nowIso,
      accepted_user_id: user.id,
      token_used_at: nowIso,
      invite_token: null,
      visibility_status: "pending",
    })
    .eq("id", invite.id)
    .eq("invite_token", token);

  if (updErr) {
    console.error("[invite/accept] update failed", updErr);
    return NextResponse.json(
      { error: "Could not accept this invitation. Try again in a moment." },
      { status: 500 }
    );
  }

  const { data: artistRow } = await service
    .from("artists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (artistRow) {
    await service
      .from("artists")
      .update({
        gallery_id: invite.gallery_id,
        represented_by_gallery: true,
        shown_on_institutional_public: false,
      })
      .eq("id", user.id);
  }

  const tier = getArtistTier(
    { visibility_status: "pending", status: "accepted" },
    artistRow
      ? { id: user.id, shown_on_institutional_public: false }
      : null
  );

  return NextResponse.json(
    {
      ok: true,
      galleryId: invite.gallery_id,
      tier,
      message:
        "Invitation accepted. Finish artist onboarding. The gallery will be notified once your profile is complete.",
    },
    { status: 200 }
  );
}
