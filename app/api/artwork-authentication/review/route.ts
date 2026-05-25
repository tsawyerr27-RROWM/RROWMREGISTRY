import { NextResponse } from "next/server";

import {
  buildPreviewFromArtwork,
  buildPreviewFromInviteAndArtwork,
  emptyArtworkReviewPreview,
  inviteExpiryState,
  loadArtistAttestationOnFile,
  loadInstitutionOnFile,
  artistMayReviewArtwork,
  resolveArtistNameOnFile,
} from "@/lib/artwork-authentication-review";
import {
  ARTWORK_AUTH_INVITE_COPY,
  type ArtworkAuthenticationInvitePreview,
} from "@/lib/artwork-authentication-invite";
import { maskArtistInviteEmail } from "@/lib/mask-email";
import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

async function previewByToken(
  token: string
): Promise<ArtworkAuthenticationInvitePreview> {
  const service = createSupabaseServiceClient();
  const { data: inv, error } = await service
    .from("artwork_authentication_invites")
    .select(
      "id, status, artwork_id, gallery_id, artist_email, message, token_expires_at, invite_token"
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error || !inv?.id) {
    return emptyArtworkReviewPreview();
  }

  const { data: art } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, catalogue_artist_name, artist_id, pending_artist_email, filing_gallery_id"
    )
    .eq("id", inv.artwork_id)
    .maybeSingle();

  const { data: gal } = await service
    .from("galleries")
    .select("name")
    .eq("id", inv.gallery_id)
    .maybeSingle();

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    /* unauthenticated — fine */
  }

  const artistAttestationOnFile =
    (await loadArtistAttestationOnFile(service, inv.artwork_id)) ||
    inviteExpiryState(inv).completed;
  const institutionOnFile = await loadInstitutionOnFile(
    service,
    inv.artwork_id
  );

  return buildPreviewFromInviteAndArtwork({
    inv,
    art: art || null,
    galleryName: gal?.name?.trim() || "Institution",
    requiresAuth: !user,
    artistAttestationOnFile,
    institutionOnFile,
  });
}

async function previewByArtworkId(
  artworkId: string
): Promise<ArtworkAuthenticationInvitePreview> {
  const service = createSupabaseServiceClient();

  const { data: art, error: artErr } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, image_url, catalogue_artist_name, artist_id, pending_artist_email, filing_gallery_id"
    )
    .eq("id", artworkId)
    .maybeSingle();

  if (artErr || !art?.id) {
    return emptyArtworkReviewPreview();
  }

  const galleryId = String(art.filing_gallery_id || "");
  const { data: gal } = galleryId
    ? await service
        .from("galleries")
        .select("name")
        .eq("id", galleryId)
        .maybeSingle()
    : { data: null };

  const institutionOnFile = await loadInstitutionOnFile(service, art.id);
  const artistAttestationOnFile = await loadArtistAttestationOnFile(
    service,
    art.id
  );

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    /* unauthenticated */
  }

  if (!user) {
    const masked = art.pending_artist_email
      ? maskArtistInviteEmail(String(art.pending_artist_email))
      : "";
    return buildPreviewFromArtwork({
      art,
      galleryName: gal?.name?.trim() || "Institution",
      requiresAuth: true,
      artistAttestationOnFile,
      institutionOnFile,
      maskedRecipientEmail: masked,
      acceptMode: "studio_confirm",
      valid: institutionOnFile && !artistAttestationOnFile,
    });
  }

  const userEmail = String(user.email || "").toLowerCase();
  const { data: artistRow } = await service
    .from("artists")
    .select("display_name, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const displayName =
    artistRow?.display_name?.trim() || artistRow?.full_name?.trim() || "";

  if (!artistMayReviewArtwork(art, user.id, userEmail, displayName)) {
    return emptyArtworkReviewPreview();
  }

  const { data: pendingInv } = await service
    .from("artwork_authentication_invites")
    .select(
      "id, status, artwork_id, gallery_id, artist_email, message, token_expires_at, invite_token"
    )
    .eq("artwork_id", artworkId)
    .eq("status", "pending")
    .ilike("artist_email", userEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingInv?.id && pendingInv.invite_token) {
    const state = inviteExpiryState(pendingInv);
    if (state.valid) {
      return buildPreviewFromInviteAndArtwork({
        inv: pendingInv,
        art,
        galleryName: gal?.name?.trim() || "Institution",
        requiresAuth: false,
        artistAttestationOnFile,
        institutionOnFile,
      });
    }
  }

  const artistNameOnFile = await resolveArtistNameOnFile(
    service,
    art,
    userEmail
  );

  return buildPreviewFromArtwork({
    art: { ...art, catalogue_artist_name: artistNameOnFile },
    galleryName: gal?.name?.trim() || "Institution",
    requiresAuth: false,
    artistAttestationOnFile,
    institutionOnFile,
    maskedRecipientEmail: maskArtistInviteEmail(userEmail),
    acceptMode: "studio_confirm",
    valid: institutionOnFile && !artistAttestationOnFile,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  const artworkId = String(url.searchParams.get("artwork_id") || "").trim();

  let preview: ArtworkAuthenticationInvitePreview;

  try {
    if (token.length >= 32) {
      preview = await previewByToken(token);
    } else if (artworkId) {
      preview = await previewByArtworkId(artworkId);
    } else {
      return NextResponse.json(emptyArtworkReviewPreview(), { status: 400 });
    }
  } catch (e) {
    console.error("[artwork-authentication/review] unhandled error:", e);
    return NextResponse.json(emptyArtworkReviewPreview(), { status: 500 });
  }

  return NextResponse.json({
    ...preview,
    copy: ARTWORK_AUTH_INVITE_COPY,
    phrases: CANONICAL_RECORD_PHRASES,
  });
}
