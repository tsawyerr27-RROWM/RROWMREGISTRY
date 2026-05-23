import type { RepresentationStatus } from "@/lib/representation-language";

export const ARTWORK_CONFIRMATION_EVENT_TYPES = {
  institutionFiled: "institution_filed",
  artistConfirmedAuthorship: "artist_confirmed_authorship",
  artistConfirmedRepresentation: "artist_confirmed_representation",
  artistConfirmedChronology: "artist_confirmed_chronology",
  artistAuthorshipContribution: "artist_authorship_contribution",
  representationEnded: "representation_ended",
  amendmentRequested: "representation_amendment_requested",
  artistDisputedRepresentation: "artist_disputed_representation",
} as const;

export type ArtworkConfirmationEventType =
  (typeof ARTWORK_CONFIRMATION_EVENT_TYPES)[keyof typeof ARTWORK_CONFIRMATION_EVENT_TYPES];

export type GalleryRepresentationSummary = {
  catalogue_works: number;
  institution_filed: number;
  artist_confirmed: number;
  participation_pending: number;
  roster_invites_pending: number;
  amendments_pending: number;
};

export function parseGalleryRepresentationSummary(
  raw: unknown
): GalleryRepresentationSummary {
  const o =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const n = (k: string) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.max(0, v) : 0;
  };
  return {
    catalogue_works: n("catalogue_works"),
    institution_filed: n("institution_filed"),
    artist_confirmed: n("artist_confirmed"),
    participation_pending: n("participation_pending"),
    roster_invites_pending: n("roster_invites_pending"),
    amendments_pending: n("amendments_pending"),
  };
}

export function isArtistConfirmationEventType(
  eventType: string | null | undefined
): boolean {
  const t = String(eventType ?? "").toLowerCase().trim();
  return (
    t === ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedAuthorship ||
    t === ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedRepresentation ||
    t === ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedChronology
  );
}

export type ArtistRepresentationState = {
  has_institution: boolean;
  active: boolean;
  historical: boolean;
  represented_by_gallery: boolean;
  gallery_id: string | null;
  active_works: number;
  ended_works: number;
};

export function parseArtistRepresentationState(raw: unknown): ArtistRepresentationState {
  const o =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const b = (k: string) => o[k] === true;
  const n = (k: string) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  };
  return {
    has_institution: b("has_institution"),
    active: b("active"),
    historical: b("historical"),
    represented_by_gallery: b("represented_by_gallery"),
    gallery_id:
      o.gallery_id != null && String(o.gallery_id).trim()
        ? String(o.gallery_id)
        : null,
    active_works: n("active_works"),
    ended_works: n("ended_works"),
  };
}

export function relationshipStatusFromRow(
  status: string | null | undefined
): RepresentationStatus {
  const s = String(status ?? "").toLowerCase().trim();
  if (s === "artist_confirmed") return "artist_confirmed";
  if (s === "invited_pending_artist") return "invited_pending_artist";
  if (s === "artist_disputed") return "artist_disputed";
  if (s === "representation_ended") return "representation_ended";
  return "institution_only";
}
