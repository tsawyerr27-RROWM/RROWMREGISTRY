import type { ProvenanceTransferType } from "@/lib/provenance-transfer";
import { getSiteUrl } from "@/lib/site-url";

export const REGISTRY_STEWARD_INVITE_KINDS = ["authorship", "custody"] as const;

export type RegistryStewardInviteKind = (typeof REGISTRY_STEWARD_INVITE_KINDS)[number];

export type RegistryStewardInviteStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "cancelled";

export type RegistryStewardInviteRow = {
  id: string;
  artwork_id: string;
  invite_kind: RegistryStewardInviteKind;
  recipient_email: string;
  recipient_name: string | null;
  invite_token: string | null;
  personal_message: string | null;
  status: RegistryStewardInviteStatus;
  custody_transfer_type: ProvenanceTransferType | null;
  token_expires_at: string | null;
  token_used_at: string | null;
  accepted_user_id: string | null;
  accepted_at: string | null;
  created_by_user_id: string;
  filing_gallery_id: string | null;
  source_table: string | null;
  source_id: string | null;
  created_at: string;
};

export type RegistryStewardInviteArtwork = {
  id: string;
  title: string | null;
  registry_id: string;
  catalogue_artist_name: string | null;
  artist_id: string | null;
  verification_status: string | null;
  /** Cache only — custody checks use canonical ownership engine. */
  current_owner_id?: string | null;
  filing_gallery_id: string | null;
};

export type RegistryStewardAuthorshipEligibility = {
  kind: "authorship";
  artistNameOnFile: string;
  institutionName: string;
  defaultEmail: string | null;
  artistLinked: boolean;
};

export type RegistryStewardCustodyEligibility = {
  kind: "custody";
  transferTypes: ProvenanceTransferType[];
};

export type RegistryStewardInviteEligibility = {
  artwork: {
    id: string;
    title: string;
    registry_id: string;
  };
  kinds: RegistryStewardInviteKind[];
  authorship: RegistryStewardAuthorshipEligibility | null;
  custody: RegistryStewardCustodyEligibility | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidInviteEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim().toLowerCase());
}

export function normalizeInviteEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function buildRegistryStewardInviteLandingUrl(
  _kind: RegistryStewardInviteKind,
  token: string,
  origin?: string
): string {
  return buildRegistryStewardInvitePublicUrl(token, origin);
}

export function buildRegistryStewardInvitePublicUrl(
  token: string,
  origin?: string
): string {
  const base = (origin ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}${buildRegistryStewardInviteAcceptHref(token)}`;
}

export function buildRegistryStewardInviteAcceptHref(token: string): string {
  return `/accept-steward-invite?token=${encodeURIComponent(token)}`;
}

export function registryStewardInviteKindLabel(kind: RegistryStewardInviteKind): string {
  switch (kind) {
    case "authorship":
      return "Authorship steward";
    case "custody":
      return "Custody steward";
    default:
      return "Record steward";
  }
}

export function registryStewardInviteStatusLabel(
  row: Pick<RegistryStewardInviteRow, "status" | "token_expires_at">
): string {
  const status = String(row.status || "").toLowerCase();
  if (status === "accepted") return "Accepted";
  if (status === "cancelled") return "Withdrawn";
  if (status === "expired") return "Expired";
  if (status === "pending" && row.token_expires_at) {
    const expires = new Date(row.token_expires_at).getTime();
    if (Number.isFinite(expires) && expires < Date.now()) return "Expired";
  }
  return "Awaiting response";
}
