import { NextResponse } from "next/server";

import { getArtistTier } from "@/lib/artist-tier";
import { buildArtistVerifiedGalleryEmail } from "@/lib/emails/artist-verified-gallery-notify";
import { sendResendEmail } from "@/lib/emails/send-email";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

async function galleryAdminEmails(
  service: ReturnType<typeof createSupabaseServiceClient>,
  galleryId: string
): Promise<{ userId: string; email: string }[]> {
  const { data: rows } = await service
    .from("gallery_users")
    .select("user_id")
    .eq("gallery_id", galleryId)
    .in("role", ["admin"]);

  const ids = [...new Set((rows || []).map((r: { user_id: string }) => r.user_id))];
  const out: { userId: string; email: string }[] = [];
  for (const uid of ids) {
    const { data, error } = await service.auth.admin.getUserById(uid);
    if (error || !data?.user?.email) continue;
    out.push({ userId: uid, email: data.user.email });
  }
  return out;
}

/**
 * Marks invite visibility as confirmed after artist onboarding completes and notifies gallery admins.
 * Idempotent: safe to POST multiple times while already confirmed/public.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actor } = await supabase
    .from("actor_profiles")
    .select("role, onboarding_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!actor || actor.role !== "artist") {
    return NextResponse.json(
      { error: "Artist profile required." },
      { status: 403 }
    );
  }

  if (!actor.onboarding_complete) {
    return NextResponse.json(
      { error: "Finish onboarding before completing verification notification." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();

  const { data: inviteRows } = await service
    .from("gallery_artist_invites")
    .select(
      "id, gallery_id, accepted_user_id, status, visibility_status, artist_email, accepted_at"
    )
    .eq("accepted_user_id", user.id)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false })
    .limit(1);

  const invite = inviteRows?.[0] ?? null;

  if (!invite) {
    return NextResponse.json({
      ok: true,
      skipped: true as const,
      reason: "No accepted gallery invitation for this account.",
    });
  }

  const { data: artistVisRow } = await service
    .from("artists")
    .select("shown_on_institutional_public")
    .eq("id", user.id)
    .maybeSingle();

  const artistTierInput = {
    id: user.id,
    shown_on_institutional_public: artistVisRow?.shown_on_institutional_public,
  };

  const prevVis = String(invite.visibility_status || "").toLowerCase();
  if (prevVis === "confirmed" || prevVis === "public") {
    return NextResponse.json({
      ok: true,
      skipped: true as const,
      visibility: prevVis as "confirmed" | "public",
      tier: getArtistTier(invite, artistTierInput),
    });
  }

  if (prevVis !== "pending") {
    return NextResponse.json({
      ok: true,
      skipped: true as const,
      reason: `Unexpected visibility (${invite.visibility_status}).`,
      tier: getArtistTier(invite, artistTierInput),
    });
  }

  await service.from("gallery_artist_invites").update({ visibility_status: "confirmed" }).eq("id", invite.id);

  await service
    .from("artists")
    .update({ shown_on_institutional_public: false })
    .eq("id", user.id);

  const { data: gal } = await service
    .from("galleries")
    .select("id, name, slug")
    .eq("id", invite.gallery_id)
    .maybeSingle();

  const galleryName = gal?.name?.trim() || "Institution";

  const { data: artistRow } = await service
    .from("artists")
    .select("display_name, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const artistDisp =
    artistRow?.display_name?.trim() ||
    artistRow?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Artist";

  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/studio/organisation`;

  const admins = await galleryAdminEmails(service, invite.gallery_id);

  let galleryNotified = false;
  if (admins.length > 0) {
    const { subject, html, text } = buildArtistVerifiedGalleryEmail({
      galleryName,
      artistDisplayName: artistDisp,
      dashboardUrl,
      recipientEmails: admins.map((a) => a.email),
    });

    const sent = await sendResendEmail({
      kind: "registry_notification",
      to: admins.map((a) => a.email),
      subject,
      html,
      text,
    });
    galleryNotified = sent.ok;
    if (!sent.ok) {
      console.error(
        "[invite/complete-verification] Resend",
        sent.status,
        sent.message
      );
    }
  }

  const firstAdmin = admins[0];
  if (firstAdmin) {
    const { error: logErr } = await service.rpc("log_activity_event", {
      p_user_id: firstAdmin.userId,
      p_type: "gallery_invite_artist_onboarded",
      p_message: `${artistDisp} completed registry onboarding for ${galleryName}.`,
      p_artwork_id: null,
      p_metadata: {
        artist_user_id: user.id,
        gallery_id: invite.gallery_id,
        invite_id: invite.id,
      },
    });
    if (logErr) {
      console.warn("[invite/complete-verification] log_activity_event", logErr);
    }
  }

  return NextResponse.json({
    ok: true,
    visibility: "confirmed" as const,
    galleryNotified,
    tier: getArtistTier(
      { visibility_status: "confirmed", status: invite.status },
      { id: user.id, shown_on_institutional_public: false }
    ),
  });
}
