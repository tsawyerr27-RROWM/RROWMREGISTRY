import { CANONICAL_RECORD_PHRASES } from "@/lib/representation-language";

export type ArtworkAuthenticationInviteStatus =
  | "pending"
  | "authenticated"
  | "expired"
  | "cancelled";

export type ArtworkAuthenticationInviteRow = {
  id: string;
  artwork_id: string;
  gallery_id: string;
  artist_email: string;
  artist_name: string | null;
  invite_token: string | null;
  message: string | null;
  status: ArtworkAuthenticationInviteStatus;
  authenticated_user_id: string | null;
  authenticated_at: string | null;
  token_expires_at: string | null;
  created_at: string;
  artworks?: {
    title?: string | null;
    registry_id?: string | null;
    image_url?: string | null;
    catalogue_artist_name?: string | null;
    artist_id?: string | null;
  } | null;
};

export function artworkAuthenticationInviteStatusLabel(
  row: Pick<
    ArtworkAuthenticationInviteRow,
    "status" | "token_expires_at"
  >
): string {
  const st = String(row.status || "").toLowerCase();
  if (st === "authenticated") return "Authorship authenticated";
  if (st === "cancelled") return "Withdrawn";
  if (st === "expired") return "Expired";
  if (st === "pending" && row.token_expires_at) {
    const t = new Date(row.token_expires_at).getTime();
    if (Number.isFinite(t) && t < Date.now()) return "Expired";
  }
  return "Awaiting authentication";
}

export function buildArtworkAuthenticationInviteUrl(
  siteUrl: string,
  token: string
): string {
  const base = String(siteUrl || "").replace(/\/$/, "");
  return `${base}/authenticate-record?token=${encodeURIComponent(token)}`;
}

export const ARTWORK_AUTH_INVITE_COPY = {
  modalTitle: "Invite artist to authenticate",
  modalLead:
    "This artwork record is already on file within the registry. Invite the artist to authenticate authorship, deepen chronology, and contribute artist-authored detail.",
  modalOutcome:
    "The artist will receive a continuity invitation linked to this artwork specifically.",
  ctaSend: "Send continuity invitation",
  representationSectionTitle: "Representation invitations",
  representationSectionDesc:
    "Invite artists to join under your institution generally — separate from artwork-specific authentication.",
  artworkSectionTitle: "Artwork authentication invitations",
  artworkSectionDesc: `Continuity history for specific canonical records. ${CANONICAL_RECORD_PHRASES.notApprovalWorkflow}`,
} as const;

export type ArtworkAuthenticationAcceptMode =
  | "invite_token"
  | "studio_confirm";

export type ArtworkAuthenticationInvitePreview = {
  valid: boolean;
  expired: boolean;
  completed: boolean;
  cancelled: boolean;
  artworkId: string;
  artworkTitle: string;
  registryId: string;
  imageUrl: string | null;
  artistNameOnFile: string;
  galleryName: string;
  institutionOnFile: boolean;
  artistAttestationOnFile: boolean;
  personalMessage: string | null;
  maskedRecipientEmail: string;
  requiresAuth: boolean;
  /** How the client should complete authentication */
  acceptMode?: ArtworkAuthenticationAcceptMode;
  /** Present when acceptMode is invite_token and invite is pending */
  inviteToken?: string | null;
};
