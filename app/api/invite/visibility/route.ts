import { NextResponse } from "next/server";

import { getArtistTier, withDisputeOverride } from "@/lib/artist-tier";
import { hasActiveDispute } from "@/lib/disputes";
import { parsePublicPresence } from "@/lib/public-presence";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

/** Artist: read invite visibility + opt-in flags for account UI */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createSupabaseServiceClient();

  const { data: rows } = await service
    .from("gallery_artist_invites")
    .select("id, visibility_status, status, gallery_id, artist_email, accepted_at")
    .eq("accepted_user_id", user.id)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .limit(1);

  const invite = rows?.[0];
  if (!invite) {
    return NextResponse.json({ invite: null }, { status: 200 });
  }

  const { data: artistRow } = await service
    .from("artists")
    .select("shown_on_institutional_public")
    .eq("id", user.id)
    .maybeSingle();

  const vis = String(invite.visibility_status || "").toLowerCase();
  const artistOptIn = Boolean(artistRow?.shown_on_institutional_public);
  const galleryPublished = vis === "public";
  const publiclyListed = galleryPublished && artistOptIn;
  const canSetArtistOptIn =
    vis === "confirmed" || vis === "public";

  const baseTier = getArtistTier(invite, {
    id: user.id,
    shown_on_institutional_public: artistRow?.shown_on_institutional_public,
  });
  const [artistDisputed, inviteDisputed] = await Promise.all([
    hasActiveDispute(service, "artist", user.id),
    hasActiveDispute(service, "gallery_relationship", invite.id),
  ]);
  const hasActiveDisputeFlag = artistDisputed || inviteDisputed;
  const tier = withDisputeOverride(baseTier, hasActiveDisputeFlag);

  return NextResponse.json({
    invite: {
      id: invite.id,
      galleryId: invite.gallery_id,
      visibilityStatus: invite.visibility_status,
      artistOptIn,
      galleryPublished,
      publiclyListed,
      canSetArtistOptIn,
      canTogglePublic: canSetArtistOptIn,
      hasActiveDispute: hasActiveDisputeFlag,
      tier,
    },
  });
}

/**
 * Gallery admin: set invite.visibility_status to `public` or back to `confirmed`.
 * Publishing to `public` requires the invite to be `confirmed` and the artist to have
 * opted in via PATCH /api/artist/public-visibility.
 */
export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const inviteId =
    typeof rec.invite_id === "string"
      ? rec.invite_id.trim()
      : typeof rec.inviteId === "string"
        ? rec.inviteId.trim()
        : "";
  const nextRaw = typeof rec.visibility_status === "string" ? rec.visibility_status.trim().toLowerCase() : "";
  if (!inviteId || (nextRaw !== "public" && nextRaw !== "confirmed")) {
    return NextResponse.json(
      { error: "Provide invite_id and visibility_status: public | confirmed." },
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

  const { data: invite, error: invErr } = await service
    .from("gallery_artist_invites")
    .select(
      "id, gallery_id, status, visibility_status, accepted_user_id, artist_email"
    )
    .eq("id", inviteId)
    .maybeSingle();

  if (invErr || !invite?.gallery_id) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  const { data: mem, error: memErr } = await supabase
    .from("gallery_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("gallery_id", invite.gallery_id)
    .maybeSingle();

  if (memErr || !mem || mem.role !== "admin") {
    return NextResponse.json(
      { error: "Only gallery administrators can change roster visibility." },
      { status: 403 }
    );
  }

  if (String(invite.status || "").toLowerCase() !== "accepted") {
    return NextResponse.json(
      { error: "Only accepted invitations can be updated." },
      { status: 400 }
    );
  }

  const prevVis = String(invite.visibility_status || "").toLowerCase();

  if (nextRaw === "public") {
    if (prevVis !== "confirmed") {
      return NextResponse.json(
        {
          error:
            "The artist must complete registry onboarding before the roster can be published.",
        },
        { status: 400 }
      );
    }

    const artistId = invite.accepted_user_id as string | null;
    if (!artistId) {
      return NextResponse.json(
        { error: "This invitation is not linked to an accepted account." },
        { status: 400 }
      );
    }

    const { data: artistRow } = await service
      .from("artists")
      .select("shown_on_institutional_public, public_presence")
      .eq("id", artistId)
      .maybeSingle();

    if (!artistRow?.shown_on_institutional_public) {
      return NextResponse.json(
        {
          error:
            "The artist has not enabled “Show my profile on institutional pages” in Account settings. They must opt in before publication.",
        },
        { status: 400 }
      );
    }

    if (!parsePublicPresence(artistRow.public_presence).profile) {
      return NextResponse.json(
        {
          error:
            "The artist must enable a public profile before they can appear on your institutional page.",
        },
        { status: 400 }
      );
    }

    const { data: gal } = await service
      .from("galleries")
      .select("public_presence")
      .eq("id", invite.gallery_id)
      .maybeSingle();
    if (!gal || !parsePublicPresence(gal.public_presence).profile) {
      return NextResponse.json(
        {
          error:
            "Publish your gallery’s public profile before adding artists to the public roster.",
        },
        { status: 400 }
      );
    }
  }

  const { error: updErr } = await service
    .from("gallery_artist_invites")
    .update({ visibility_status: nextRaw })
    .eq("id", inviteId)
    .eq("gallery_id", invite.gallery_id);

  if (updErr) {
    console.error("[invite/visibility] gallery update", updErr);
    return NextResponse.json({ error: "Could not update visibility." }, { status: 500 });
  }

  const linkedArtistId = invite.accepted_user_id as string | null;
  let shownOn: boolean | null | undefined;
  if (linkedArtistId) {
    const { data: arTier } = await service
      .from("artists")
      .select("shown_on_institutional_public")
      .eq("id", linkedArtistId)
      .maybeSingle();
    shownOn = arTier?.shown_on_institutional_public ?? undefined;
  }

  const baseTier = getArtistTier(
    { visibility_status: nextRaw, status: invite.status },
    linkedArtistId ? { id: linkedArtistId, shown_on_institutional_public: shownOn } : null
  );
  const [artistDisputed, inviteDisputed] = await Promise.all([
    linkedArtistId
      ? hasActiveDispute(service, "artist", linkedArtistId)
      : Promise.resolve(false),
    hasActiveDispute(service, "gallery_relationship", inviteId),
  ]);
  const tier = withDisputeOverride(baseTier, artistDisputed || inviteDisputed);

  return NextResponse.json({
    ok: true,
    visibilityStatus: nextRaw,
    tier,
  });
}
