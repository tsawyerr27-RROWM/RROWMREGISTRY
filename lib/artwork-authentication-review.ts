import type { ArtworkAuthenticationInvitePreview } from "@/lib/artwork-authentication-invite";
import { maskArtistInviteEmail } from "@/lib/mask-email";
import { ARTWORK_CONFIRMATION_EVENT_TYPES } from "@/lib/artwork-representation";

export const ARTIST_CONFIRM_EVENT_TYPES = [
  ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedAuthorship,
  ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedRepresentation,
  ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedChronology,
  ARTWORK_CONFIRMATION_EVENT_TYPES.artistAuthorshipContribution,
] as const;

export function emptyArtworkReviewPreview(): ArtworkAuthenticationInvitePreview {
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
    acceptMode: "studio_confirm",
    inviteToken: null,
  };
}

type ArtworkRow = {
  id: string;
  title?: string | null;
  registry_id?: string | null;
  image_url?: string | null;
  catalogue_artist_name?: string | null;
  artist_id?: string | null;
  pending_artist_email?: string | null;
  filing_gallery_id?: string | null;
};

type InviteRow = {
  id: string;
  status: string;
  artwork_id: string;
  gallery_id: string;
  artist_email: string;
  message?: string | null;
  token_expires_at?: string | null;
  invite_token?: string | null;
};

export function inviteExpiryState(inv: Pick<InviteRow, "status" | "token_expires_at">): {
  expired: boolean;
  completed: boolean;
  cancelled: boolean;
  valid: boolean;
} {
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
  return { expired, completed, cancelled, valid };
}

export async function loadArtistAttestationOnFile(
  service: ReturnType<
    typeof import("@/lib/supabase-service-role").createSupabaseServiceClient
  >,
  artworkId: string
): Promise<boolean> {
  const { data: artistEv } = await service
    .from("artwork_confirmation_events")
    .select("id")
    .eq("artwork_id", artworkId)
    .in("event_type", [...ARTIST_CONFIRM_EVENT_TYPES])
    .limit(1)
    .maybeSingle();
  return Boolean(artistEv?.id);
}

export async function loadInstitutionOnFile(
  service: ReturnType<
    typeof import("@/lib/supabase-service-role").createSupabaseServiceClient
  >,
  artworkId: string
): Promise<boolean> {
  const { data: filed } = await service
    .from("artwork_confirmation_events")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("event_type", ARTWORK_CONFIRMATION_EVENT_TYPES.institutionFiled)
    .limit(1)
    .maybeSingle();
  return Boolean(filed?.id);
}

export async function resolveArtistNameOnFile(
  service: ReturnType<
    typeof import("@/lib/supabase-service-role").createSupabaseServiceClient
  >,
  art: ArtworkRow,
  fallbackEmail?: string
): Promise<string> {
  let name =
    art.catalogue_artist_name?.trim() ||
    fallbackEmail?.split("@")[0] ||
    "Artist on file";
  if (art.artist_id) {
    const { data: ar } = await service
      .from("artists")
      .select("display_name, full_name")
      .eq("id", art.artist_id)
      .maybeSingle();
    const dn = ar?.display_name?.trim() || ar?.full_name?.trim();
    if (dn) name = dn;
  }
  return name;
}

export function buildPreviewFromInviteAndArtwork(params: {
  inv: InviteRow;
  art: ArtworkRow | null;
  galleryName: string;
  requiresAuth: boolean;
  artistAttestationOnFile: boolean;
  institutionOnFile?: boolean;
}): ArtworkAuthenticationInvitePreview {
  const {
    inv,
    art,
    galleryName,
    requiresAuth,
    artistAttestationOnFile,
    institutionOnFile = true,
  } = params;
  const { expired, completed, cancelled, valid } = inviteExpiryState(inv);
  const artistNameOnFile =
    art?.catalogue_artist_name?.trim() ||
    inv.artist_email?.split("@")[0] ||
    "Artist on file";

  return {
    valid,
    expired,
    completed,
    cancelled,
    artworkId: String(art?.id || inv.artwork_id),
    artworkTitle: String(art?.title || "").trim() || "Work on file",
    registryId: String(art?.registry_id || ""),
    imageUrl: art?.image_url ? String(art.image_url) : null,
    artistNameOnFile,
    galleryName,
    institutionOnFile,
    artistAttestationOnFile: artistAttestationOnFile || completed,
    personalMessage: inv.message ? String(inv.message) : null,
    maskedRecipientEmail: maskArtistInviteEmail(String(inv.artist_email)),
    requiresAuth,
    acceptMode: "invite_token",
    inviteToken: valid && inv.invite_token ? String(inv.invite_token) : null,
  };
}

export function buildPreviewFromArtwork(params: {
  art: ArtworkRow;
  galleryName: string;
  requiresAuth: boolean;
  artistAttestationOnFile: boolean;
  institutionOnFile: boolean;
  personalMessage?: string | null;
  maskedRecipientEmail?: string;
  inviteToken?: string | null;
  acceptMode: "invite_token" | "studio_confirm";
  valid?: boolean;
}): ArtworkAuthenticationInvitePreview {
  const {
    art,
    galleryName,
    requiresAuth,
    artistAttestationOnFile,
    institutionOnFile,
    personalMessage = null,
    maskedRecipientEmail = "",
    inviteToken = null,
    acceptMode,
    valid = true,
  } = params;

  return {
    valid: valid && !artistAttestationOnFile,
    expired: false,
    completed: artistAttestationOnFile,
    cancelled: false,
    artworkId: String(art.id),
    artworkTitle: String(art.title || "").trim() || "Work on file",
    registryId: String(art.registry_id || ""),
    imageUrl: art.image_url ? String(art.image_url) : null,
    artistNameOnFile:
      art.catalogue_artist_name?.trim() || maskedRecipientEmail || "Artist on file",
    galleryName,
    institutionOnFile,
    artistAttestationOnFile,
    personalMessage,
    maskedRecipientEmail,
    requiresAuth,
    acceptMode,
    inviteToken,
  };
}

export function artistMayReviewArtwork(
  art: ArtworkRow,
  userId: string,
  userEmail: string
): boolean {
  if (art.artist_id && String(art.artist_id) === userId) return true;
  const email = userEmail.trim().toLowerCase();
  return (
    email.length > 0 &&
    Boolean(art.pending_artist_email) &&
    art.pending_artist_email!.trim().toLowerCase() === email
  );
}
