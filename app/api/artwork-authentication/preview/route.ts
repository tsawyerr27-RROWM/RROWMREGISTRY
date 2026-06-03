import { NextResponse } from "next/server";

import {
  type ArtworkAuthenticationInvitePreview,
} from "@/lib/artwork-authentication-invite";
import { getArtworkAuthInviteCopy, resolveArtworkAuthInviteLang } from "@/lib/artwork-auth-invite-copy-i18n";
import { maskArtistInviteEmail } from "@/lib/mask-email";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { ARTWORK_CONFIRMATION_EVENT_TYPES } from "@/lib/artwork-representation";
import { clientIpFromRequest } from "@/lib/registry-action-security/client-ip";
import { guardRegistryPreview } from "@/lib/registry-action-security/guards";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function empty(): ArtworkAuthenticationInvitePreview {
  return {
    valid: false,
    expired: false,
    completed: false,
    cancelled: false,
    artworkId: "",
    artworkTitle: "",
    registryId: "",
    imageUrl: null,
    artistNameOnFile: "",
    galleryName: "",
    institutionOnFile: false,
    artistAttestationOnFile: false,
    personalMessage: null,
    maskedRecipientEmail: "",
    requiresAuth: false,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  if (token.length < 32) {
    return NextResponse.json(empty(), { status: 400 });
  }

  const previewBlocked = await guardRegistryPreview(
    req,
    "artwork_auth_preview",
    clientIpFromRequest(req)
  );
  if (previewBlocked) return previewBlocked;

  const service = createSupabaseServiceClient();
  const { data: inv, error } = await service
    .from("artwork_authentication_invites")
    .select(
      "id, status, artwork_id, gallery_id, artist_email, message, token_expires_at, authenticated_user_id"
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error || !inv?.id) {
    return NextResponse.json(empty(), { status: 200 });
  }

  const status = String(inv.status || "").toLowerCase();
  const expMs = inv.token_expires_at
    ? new Date(String(inv.token_expires_at)).getTime()
    : null;
  const expired =
    status === "pending" &&
    expMs != null &&
    Number.isFinite(expMs) &&
    expMs < Date.now();
  const completed = status === "authenticated";
  const cancelled = status === "cancelled";
  const valid = status === "pending" && !expired && !completed && !cancelled;

  const { data: art } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, catalogue_artist_name, artist_id"
    )
    .eq("id", inv.artwork_id)
    .maybeSingle();

  const { data: gal } = await service
    .from("galleries")
    .select("name")
    .eq("id", inv.gallery_id)
    .maybeSingle();

  let artistNameOnFile =
    art?.catalogue_artist_name?.trim() || inv.artist_email?.split("@")[0] || "Artist";
  if (art?.artist_id) {
    const { data: ar } = await service
      .from("artists")
      .select("display_name")
      .eq("id", art.artist_id)
      .maybeSingle();
    if (ar?.display_name?.trim()) artistNameOnFile = ar.display_name.trim();
  }

  const { data: filed } = await service
    .from("artwork_confirmation_events")
    .select("id")
    .eq("artwork_id", inv.artwork_id)
    .eq("event_type", ARTWORK_CONFIRMATION_EVENT_TYPES.institutionFiled)
    .limit(1)
    .maybeSingle();

  const artistConfirmTypes = [
    ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedAuthorship,
    ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedRepresentation,
    ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedChronology,
    ARTWORK_CONFIRMATION_EVENT_TYPES.artistAuthorshipContribution,
  ];

  const { data: artistEv } = await service
    .from("artwork_confirmation_events")
    .select("id")
    .eq("artwork_id", inv.artwork_id)
    .in("event_type", artistConfirmTypes)
    .limit(1)
    .maybeSingle();

  let requiresAuth = false;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) requiresAuth = true;

  const preview: ArtworkAuthenticationInvitePreview = {
    valid,
    expired,
    completed,
    cancelled,
    artworkId: String(art?.id || inv.artwork_id),
    artworkTitle: String(art?.title || "").trim() || "Work on file",
    registryId: String(art?.registry_id || ""),
    imageUrl: art?.image_url ? String(art.image_url) : null,
    artistNameOnFile,
    galleryName: gal?.name?.trim() || "Institution",
    institutionOnFile: Boolean(filed?.id),
    artistAttestationOnFile: Boolean(artistEv?.id) || completed,
    personalMessage: inv.message ? String(inv.message) : null,
    maskedRecipientEmail: maskArtistInviteEmail(String(inv.artist_email)),
    requiresAuth,
  };

  return NextResponse.json({
    ...preview,
    copy: getArtworkAuthInviteCopy(
      resolveArtworkAuthInviteLang(
        req.headers.get("accept-language"),
        url.searchParams.get("lang")
      )
    ),
    phrases: CANONICAL_RECORD_PHRASES,
  });
}
