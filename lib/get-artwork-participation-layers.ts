import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ARTWORK_CONFIRMATION_EVENT_TYPES,
  isArtistConfirmationEventType,
} from "@/lib/artwork-representation";
import {
  CANONICAL_RECORD_PHRASES,
  REPRESENTATION_PHRASES,
} from "@/lib/representation-language";
import { getArtworkDisputeFormContext, isRecordUnderReview } from "@/lib/artwork-dispute-context";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export type ParticipationLayerState = "on_file" | "pending" | "neutral";

export type ParticipationLayer = {
  id: string;
  label: string;
  state: ParticipationLayerState;
};

type VerificationRow = {
  source?: string | null;
  status?: string | null;
  verification_method?: string | null;
};

function isConfirmed(row: VerificationRow): boolean {
  return String(row.status ?? "confirmed").toLowerCase().trim() === "confirmed";
}

function isGalleryEvent(row: VerificationRow): boolean {
  const src = String(row.source ?? row.verification_method ?? "")
    .toLowerCase()
    .trim();
  return src === "gallery";
}

function isArtistEvent(row: VerificationRow): boolean {
  const src = String(row.source ?? row.verification_method ?? "")
    .toLowerCase()
    .trim();
  return src === "artist";
}

/**
 * Derives calm, layered participation lines for public artwork surfaces (Phase A).
 * Uses confirmation chronology (Phase B), verification_events, gallery association,
 * invite visibility, and open disputes.
 */
export async function getArtworkParticipationLayers(
  supabase: SupabaseClient,
  args: {
    artworkId: string;
    artistId: string | null;
    galleryId: string | null;
    artworkVerified: boolean;
    hasLiveCertificate: boolean;
  }
): Promise<ParticipationLayer[]> {
  const layers: ParticipationLayer[] = [];
  const { artworkId, artistId, galleryId, artworkVerified, hasLiveCertificate } =
    args;

  const disputeCtx = await getArtworkDisputeFormContext(supabase, {
    artworkId,
    artistId,
  });
  const underReview = isRecordUnderReview(disputeCtx);

  if (underReview) {
    layers.push({
      id: "record_review",
      label: REPRESENTATION_PHRASES.recordReviewInProgress,
      state: "neutral",
    });
  }

  const svc = createSupabaseServiceClient();

  const { data: pendingAmendment } = await svc
    .from("representation_amendment_requests")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (pendingAmendment?.id) {
    layers.push({
      id: "amendment_pending",
      label: REPRESENTATION_PHRASES.amendmentPendingReview,
      state: "neutral",
    });
  }

  const { data: confirmationRows } = await svc
    .from("artwork_confirmation_events")
    .select("event_type, gallery_id, created_at")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .limit(24);

  type ConfirmationRow = { event_type?: string | null; gallery_id?: string | null };
  const confirmations = (confirmationRows ?? []) as ConfirmationRow[];
  const institutionFiled = confirmations.some(
    (r) =>
      String(r.event_type ?? "").toLowerCase() ===
      ARTWORK_CONFIRMATION_EVENT_TYPES.institutionFiled
  );
  const artistConfirmedByEvent = confirmations.some((r) =>
    isArtistConfirmationEventType(r.event_type)
  );
  const artistDisputed = confirmations.some(
    (r) =>
      String(r.event_type ?? "").toLowerCase() ===
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistDisputedRepresentation
  );
  const representationEndedOnFile = confirmations.some(
    (r) =>
      String(r.event_type ?? "").toLowerCase() ===
      ARTWORK_CONFIRMATION_EVENT_TYPES.representationEnded
  );

  let hasActiveRepresentation = false;
  if (galleryId) {
    const { data: activeRel } = await svc
      .from("artwork_representation_relationships")
      .select("id")
      .eq("artwork_id", artworkId)
      .eq("gallery_id", galleryId)
      .is("ended_at", null)
      .limit(1)
      .maybeSingle();
    hasActiveRepresentation = Boolean(activeRel?.id);
  }

  const historicalRepresentation =
    representationEndedOnFile && !hasActiveRepresentation;

  const { data: vrows } = await supabase
    .from("verification_events")
    .select("source, status, verification_method")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .limit(12);

  const confirmed = ((vrows ?? []) as VerificationRow[]).filter(isConfirmed);
  const galleryConfirmed = confirmed.some(isGalleryEvent);
  const artistConfirmedLegacy = confirmed.some(isArtistEvent);

  const institutionLinked = Boolean(
    galleryId || institutionFiled || galleryConfirmed || artworkVerified
  );

  let inviteConfirmed = false;
  if (artistId && galleryId) {
    const { data: inv } = await svc
      .from("gallery_artist_invites")
      .select("visibility_status, status")
      .eq("gallery_id", galleryId)
      .eq("accepted_user_id", artistId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const vis = String(inv?.visibility_status ?? "").toLowerCase().trim();
    inviteConfirmed =
      vis === "confirmed" || vis === "public" || inv?.status === "accepted";
  }

  const hasAuthorshipContribution = confirmations.some(
    (r) =>
      String(r.event_type ?? "").toLowerCase() ===
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistAuthorshipContribution
  );

  const artistParticipating =
    artistConfirmedByEvent ||
    artistConfirmedLegacy ||
    inviteConfirmed ||
    hasAuthorshipContribution;

  if (artistDisputed) {
    layers.push({
      id: "representation_review",
      label: REPRESENTATION_PHRASES.recordReviewInProgress,
      state: "neutral",
    });
  }

  if (historicalRepresentation) {
    layers.push({
      id: "historical_representation",
      label: REPRESENTATION_PHRASES.historicalRepresentation,
      state: "neutral",
    });
  } else if (institutionLinked) {
    layers.push({
      id: "institution_linked",
      label: REPRESENTATION_PHRASES.institutionLinkedContinuity,
      state: "on_file",
    });
  } else {
    layers.push({
      id: "continuity_recorded",
      label: "Continuity recorded on file",
      state: "on_file",
    });
  }

  if (artistParticipating) {
    layers.push({
      id: "artist_confirmed",
      label: REPRESENTATION_PHRASES.artistConfirmationOnFile,
      state: "on_file",
    });
  } else if (!historicalRepresentation && (galleryId || institutionLinked)) {
    layers.push({
      id: "artist_may_deepen",
      label: artistId
        ? CANONICAL_RECORD_PHRASES.artistAttestationMayDeepen
        : CANONICAL_RECORD_PHRASES.artistAttestationNotYetOnFile,
      state: "neutral",
    });
  }

  const hasChronologyConfirmation = confirmations.some(
    (r) =>
      String(r.event_type ?? "").toLowerCase() ===
      ARTWORK_CONFIRMATION_EVENT_TYPES.artistConfirmedChronology
  );

  if (
    hasLiveCertificate ||
    hasChronologyConfirmation ||
    (institutionFiled && artistParticipating) ||
    (galleryConfirmed && artistParticipating) ||
    confirmed.length >= 2
  ) {
    layers.push({
      id: "participant_chronology",
      label: CANONICAL_RECORD_PHRASES.participantChronologyOnFile,
      state: "on_file",
    });
  }

  if (
    !historicalRepresentation &&
    institutionLinked &&
    artistParticipating &&
    !underReview &&
    layers.every((l) => l.id !== "representation_acknowledged")
  ) {
    layers.push({
      id: "representation_acknowledged",
      label: REPRESENTATION_PHRASES.representationAcknowledged,
      state: "on_file",
    });
  }

  return layers;
}
