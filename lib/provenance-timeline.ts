import type { SupabaseClient } from "@supabase/supabase-js";
import { formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";
import { formatOwnershipParty, normalizeVerificationStatus } from "@/lib/ownership-ledger";
import {
  isProvenanceTransferType,
  provenanceTransferTypeLabel,
} from "@/lib/provenance-transfer";
import {
  exhibitionProvenanceDisplayTitle,
  exhibitionProvenanceParticipantLabel,
  parseExhibitionProvenanceMetadata,
} from "@/lib/provenance-evidence-events";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";
import {
  computeRecordCompleteness,
  type RecordCompletenessLevel,
} from "@/lib/record-completeness";

const independentReviewParticipantCopy = "Independent registry review";

export type ArchivalNarrativeKind =
  | "registration"
  | "institutional_confirmation"
  | "artist_confirmation"
  | "certificate"
  | "provenance_continuation"
  | "transfer"
  | "evidence"
  | "dispute_open"
  | "dispute_resolved"
  | "verification_other";

export type ArchivalTimelineEvent = {
  key: string;
  narrativeKind: ArchivalNarrativeKind;
  dateIso: string;
  displayTitle: string;
  participantLabel: string | null;
  verificationLabel: string;
  hasSupportingEvidence: boolean;
  certificateRelated: boolean;
};

export type ArchivalProvenanceBundle = {
  events: ArchivalTimelineEvent[];
  recordCompleteness: RecordCompletenessLevel;
  continuityIndicators: string[];
};

function tryServiceClient(): SupabaseClient | null {
  try {
    return createSupabaseServiceClient();
  } catch {
    return null;
  }
}

function safeDate(d: unknown, fallback: string): string {
  const s = typeof d === "string" ? d : "";
  if (s && !Number.isNaN(new Date(s).getTime())) return s;
  return fallback;
}

function ownershipVerificationPhrase(status: ReturnType<typeof normalizeVerificationStatus>): string {
  switch (status) {
    case "verified":
      return "Participant-confirmed on file";
    case "claimed":
      return "On file · claim";
    default:
      return "On file · recorded";
  }
}

function ownershipChainHasGap(rows: Record<string, unknown>[]): boolean {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(String(a.created_at)).getTime() -
      new Date(String(b.created_at)).getTime()
  );
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const prevTo = String(prev.to_user_id || "").trim();
    const curFrom = String(cur.from_user_id || "").trim();
    if (prevTo && curFrom && prevTo !== curFrom) return true;
    const prevToName = String(prev.to_name || "").trim().toLowerCase();
    const curFromName = String(cur.from_name || "").trim().toLowerCase();
    if (
      prevToName &&
      curFromName &&
      prevToName !== curFromName &&
      !prevTo &&
      !curFrom
    ) {
      return true;
    }
  }
  return false;
}

function hasSupportingStorageInNotes(notes: string): boolean {
  return (
    notes.includes("supporting_storage=") ||
    notes.includes("supporting_storage =")
  );
}

type DisputeRow = {
  id: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
};

async function loadDisputeMilestones(
  service: SupabaseClient,
  artworkId: string
): Promise<{
  disputes: DisputeRow[];
  evidenceFirstByDispute: Map<string, string>;
}> {
  const { data: ownIds } = await service
    .from("ownership_events")
    .select("id")
    .eq("artwork_id", artworkId);

  const ids = (ownIds || []).map((r) => String((r as { id?: string }).id || "")).filter(Boolean);
  if (!ids.length) return { disputes: [], evidenceFirstByDispute: new Map() };

  const { data: disputes } = await service
    .from("disputes")
    .select("id, status, created_at, resolved_at")
    .eq("target_type", "ownership")
    .in("target_id", ids);

  const dRows = (disputes || []) as DisputeRow[];
  const disputeIds = dRows.map((d) => d.id).filter(Boolean);
  const evidenceFirst = new Map<string, string>();

  if (disputeIds.length) {
    const { data: evRows } = await service
      .from("dispute_evidence")
      .select("dispute_id, created_at")
      .in("dispute_id", disputeIds)
      .order("created_at", { ascending: true });

    for (const row of evRows || []) {
      const did = String((row as { dispute_id?: string }).dispute_id || "");
      const ca = String((row as { created_at?: string }).created_at || "");
      if (!did || !ca) continue;
      if (!evidenceFirst.has(did)) evidenceFirst.set(did, ca);
    }
  }

  return { disputes: dRows, evidenceFirstByDispute: evidenceFirst };
}

/**
 * Archival provenance narrative for an artwork (server-only enrichment via service role when configured).
 * Omits valuation/transaction-style value events from the public chronology.
 */
export async function getArchivalProvenanceBundle(args: {
  supabase: SupabaseClient;
  artwork: {
    id: string;
    registry_id: string | null;
    title: string | null;
    artist_id: string | null;
    created_at: string;
    verification_status?: string | null;
  };
  artistName?: string | null;
  /** When available, avoids an extra certificate row read inside this helper. */
  hasLiveCertificate?: boolean;
}): Promise<ArchivalProvenanceBundle> {
  const { supabase, artwork, artistName } = args;
  const artworkVerified = artwork.verification_status === "verified";

  const createdAt = safeDate(artwork.created_at, new Date().toISOString());
  const events: ArchivalTimelineEvent[] = [];

  events.push({
    key: `reg-${artwork.id}`,
    narrativeKind: "registration",
    dateIso: createdAt,
    displayTitle: "Work entered into registry",
    participantLabel: artistName?.trim()
      ? `Attributed to ${artistName.trim()}`
      : "Attributed to registered artist",
    verificationLabel: "Opening facts on file",
    hasSupportingEvidence: false,
    certificateRelated: false,
  });

  const [{ data: vRows }, { data: cert }, { data: ownRows }] = await Promise.all([
    supabase
      .from("verification_events")
      .select("*")
      .eq("artwork_id", artwork.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("certificates")
      .select("issued_at, revoked, revoked_reason")
      .eq("artwork_id", artwork.id)
      .order("issued_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ownership_events")
      .select("*")
      .eq("artwork_id", artwork.id)
      .order("created_at", { ascending: true }),
  ]);

  const ownList = (ownRows || []) as Record<string, unknown>[];
  const hasChainGap = ownershipChainHasGap(ownList);
  let hasSupportingEvidence = ownList.some((ev) =>
    hasSupportingStorageInNotes(String((ev as { notes?: string }).notes || ""))
  );
  let hasContinuation = false;

  for (const r of (vRows || []) as Record<string, unknown>[]) {
    const source = String(r.source || r.verification_method || "system")
      .toLowerCase()
      .trim();
    const status = String(r.status || "").toLowerCase().trim();
    if (status && status !== "confirmed") continue;

    let src = source;
    let sourceName: string | null = null;
    if (src === "gallery") {
      const gid = (r.source_id || r.verified_by_gallery_id) as string | null | undefined;
      if (gid) {
        const { data: g } = await supabase
          .from("galleries")
          .select("name")
          .eq("id", gid)
          .maybeSingle();
        sourceName = g?.name?.trim() || null;
      }
    }

    const date = safeDate(r.created_at, createdAt);

    if (src === "certificate") continue;

    if (src === "gallery") {
      events.push({
        key: `ve-gallery-${String(r.id || date)}`,
        narrativeKind: "institutional_confirmation",
        dateIso: date,
        displayTitle: "Institutional relationship recorded",
        participantLabel: sourceName ? sourceName : "Represented institution",
        verificationLabel: "Participant confirmation on file",
        hasSupportingEvidence: false,
        certificateRelated: false,
      });
      continue;
    }

    if (src === "artist") {
      events.push({
        key: `ve-artist-${String(r.id || date)}`,
        narrativeKind: "artist_confirmation",
        dateIso: date,
        displayTitle: "Participant confirmation added",
        participantLabel: artistName?.trim() || "Attributed artist",
        verificationLabel: "On file · artist attestation",
        hasSupportingEvidence: false,
        certificateRelated: false,
      });
      continue;
    }

    events.push({
      key: `ve-${String(r.id || date)}`,
      narrativeKind: "verification_other",
      dateIso: date,
      displayTitle: "Participant confirmation recorded",
      participantLabel: null,
      verificationLabel: "Confirmation on file",
      hasSupportingEvidence: false,
      certificateRelated: false,
    });
  }

  const certLive = Boolean(cert?.issued_at && !cert.revoked);
  const effectiveLiveCert =
    typeof args.hasLiveCertificate === "boolean"
      ? args.hasLiveCertificate
      : certLive;

  if (cert?.issued_at && !cert.revoked) {
    events.push({
      key: `cert-${artwork.id}`,
      narrativeKind: "certificate",
      dateIso: safeDate(cert.issued_at, createdAt),
      displayTitle: "Certificate documented on file",
      participantLabel: "Issuing authority recorded",
      verificationLabel: "Document on file",
      hasSupportingEvidence: false,
      certificateRelated: true,
    });
  }

  for (const ev of ownList) {
    const date = safeDate((ev as { created_at?: string }).created_at, createdAt);
    const transferType = String((ev as { transfer_type?: string }).transfer_type || "transfer");
    const from = formatOwnershipParty(ev, "from");
    const to = formatOwnershipParty(ev, "to");
    const st = normalizeVerificationStatus((ev as { verification_status?: unknown }).verification_status);
    const notes = String((ev as { notes?: string }).notes || "");
    const isContinuation = notes.includes("provenance_continuation");
    const supportingHere = hasSupportingStorageInNotes(notes);
    if (isContinuation) hasContinuation = true;

    let title = formatOwnershipTransferTypeLabel(transferType);
    if (isContinuation) {
      const m = notes.match(/category=(\w+)/);
      const catKey = m?.[1] || "";
      title =
        catKey && isProvenanceTransferType(catKey)
          ? `Chronology continued · ${provenanceTransferTypeLabel(catKey)} recorded`
          : "Chronology continued · Custodial chapter recorded";
    } else if (
      transferType === "transfer" ||
      transferType === "" ||
      transferType === "sale"
    ) {
      title = "Custody reflected in chronology";
    }

    const subtitle = `From ${from} to ${to}`;

    events.push({
      key: `own-${(ev as { id?: string }).id || `${date}-${title}`}`,
      narrativeKind: isContinuation ? "provenance_continuation" : "transfer",
      dateIso: date,
      displayTitle: title,
      participantLabel: subtitle,
      verificationLabel: ownershipVerificationPhrase(st),
      hasSupportingEvidence: supportingHere,
      certificateRelated: false,
    });
    if (supportingHere) hasSupportingEvidence = true;
  }

  const service = tryServiceClient();
  if (service) {
    try {
      const { data: evidenceRows } = await service
        .from("provenance_events")
        .select("id, occurred_at, metadata, kind")
        .eq("artwork_id", artwork.id)
        .eq("kind", "evidence")
        .order("occurred_at", { ascending: true });

      for (const row of evidenceRows || []) {
        const metadata = parseExhibitionProvenanceMetadata(
          (row as { metadata?: unknown }).metadata
        );
        if (!metadata || metadata.category !== "exhibition") continue;

        const date = safeDate(
          (row as { occurred_at?: string }).occurred_at,
          createdAt
        );

        events.push({
          key: `pe-${String((row as { id?: string }).id || date)}`,
          narrativeKind: "evidence",
          dateIso: date,
          displayTitle: exhibitionProvenanceDisplayTitle(metadata),
          participantLabel: exhibitionProvenanceParticipantLabel(metadata),
          verificationLabel: "On file · recorded",
          hasSupportingEvidence: Boolean(metadata.note),
          certificateRelated: false,
        });
        if (metadata.note) hasSupportingEvidence = true;
      }
    } catch {
      // Provenance evidence events are optional enrichment.
    }
  }

  if (service) {
    try {
      const { disputes, evidenceFirstByDispute } = await loadDisputeMilestones(
        service,
        artwork.id
      );
      for (const d of disputes) {
        events.push({
          key: `disp-open-${d.id}`,
          narrativeKind: "dispute_open",
          dateIso: safeDate(d.created_at, createdAt),
          displayTitle: "Record reviewed · formal channel opened",
          participantLabel: independentReviewParticipantCopy,
          verificationLabel: "Review process on file",
          hasSupportingEvidence: false,
          certificateRelated: false,
        });
        const firstEv = evidenceFirstByDispute.get(d.id);
        if (firstEv) {
          hasSupportingEvidence = true;
          const evAt = safeDate(firstEv, createdAt);
          if (new Date(evAt).getTime() >= new Date(safeDate(d.created_at, createdAt)).getTime()) {
            events.push({
              key: `disp-ev-${d.id}`,
              narrativeKind: "evidence",
              dateIso: evAt,
              displayTitle: "Supporting material attached",
              participantLabel: independentReviewParticipantCopy,
              verificationLabel: "Appended to review file",
              hasSupportingEvidence: true,
              certificateRelated: false,
            });
          }
        }
        const st = String(d.status || "").toLowerCase();
        if ((st === "resolved" || st === "rejected") && d.resolved_at) {
          events.push({
            key: `disp-close-${d.id}`,
            narrativeKind: "dispute_resolved",
            dateIso: safeDate(d.resolved_at, createdAt),
            displayTitle: "Formal review concluded",
            participantLabel: independentReviewParticipantCopy,
            verificationLabel:
              st === "resolved"
                ? "Outcome on file"
                : "Outcome on file · dismissed",
            hasSupportingEvidence: Boolean(evidenceFirstByDispute.get(d.id)),
            certificateRelated: false,
          });
        }
      }
    } catch {
      // Service disputes are optional enrichment.
    }
  }

  events.sort((a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime());

  const hasInstitutionalVerification = events.some(
    (e) => e.narrativeKind === "institutional_confirmation"
  );
  const hasArtistConfirmation = events.some(
    (e) => e.narrativeKind === "artist_confirmation"
  );
  const allOwnershipVerified =
    ownList.length > 0 &&
    ownList.every(
      (ev) => normalizeVerificationStatus((ev as { verification_status?: unknown }).verification_status) === "verified"
    );
  const anyOwnershipVerified = ownList.some(
    (ev) =>
      normalizeVerificationStatus((ev as { verification_status?: unknown }).verification_status) ===
      "verified"
  );

  const recordCompleteness = computeRecordCompleteness({
    artworkVerified,
    hasLiveCertificate: effectiveLiveCert,
    hasOwnershipChainGap: hasChainGap,
    hasSupportingEvidence,
    ownershipEventCount: ownList.length,
    allOwnershipVerified,
    anyOwnershipVerified,
    hasInstitutionalVerification,
    hasArtistConfirmation,
  });

  const hasVerifiedTransferEvent = ownList.some((ev) => {
    const notes = String((ev as { notes?: string }).notes || "");
    if (notes.includes("provenance_continuation")) return false;
    const st = normalizeVerificationStatus(
      (ev as { verification_status?: unknown }).verification_status
    );
    return st === "verified";
  });

  const continuityIndicators: string[] = [];
  if (!hasChainGap && ownList.length > 0) {
    continuityIndicators.push(
      "Chronological custody chain without recorded breaks"
    );
  }
  if (hasVerifiedTransferEvent) {
    continuityIndicators.push(
      "Participant-confirmed custody milestone on file"
    );
  }
  if (hasSupportingEvidence) {
    continuityIndicators.push("Supporting material on file");
  }
  if (
    (hasInstitutionalVerification || hasArtistConfirmation) &&
    anyOwnershipVerified
  ) {
    continuityIndicators.push(
      "Institutional or artist confirmations align with verified custody"
    );
  }
  if (
    hasContinuation &&
    !continuityIndicators.some((c) => c.includes("continuation"))
  ) {
    continuityIndicators.unshift("Chronology continued by recorded participants");
  }

  return {
    events,
    recordCompleteness,
    continuityIndicators,
  };
}

/**
 * @deprecated Use `getArchivalProvenanceBundle` — returns only the ordered events for legacy callers.
 */
export async function getProvenanceTimeline(
  args: Parameters<typeof getArchivalProvenanceBundle>[0]
): Promise<ArchivalTimelineEvent[]> {
  const b = await getArchivalProvenanceBundle(args);
  return b.events;
}
