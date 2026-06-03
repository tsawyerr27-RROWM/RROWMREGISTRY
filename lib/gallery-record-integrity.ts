/**
 * Gallery dashboard — provenance integrity & completeness (derived only; no new tables).
 *
 * Status precedence: incomplete → needs_attention → complete.
 * Keep this intentionally small and aligned with the existing system’s sources of truth.
 */

import type {
  IntegrityReasonCode,
  OpsActionLabelKey,
} from "@/lib/gallery-ops-i18n";

export type RecordIntegrityStatus = "complete" | "needs_attention" | "incomplete";

export type IntegrityAction =
  | { kind: "link"; href: string; labelKey: OpsActionLabelKey }
  | { kind: "roster"; labelKey: OpsActionLabelKey }
  | { kind: "verify"; labelKey: OpsActionLabelKey }
  | { kind: "issue_certificate"; labelKey: OpsActionLabelKey };

export type RecordIntegrityResult = {
  status: RecordIntegrityStatus;
  /** Short, human-readable reasons (1–2 for UI). */
  reasonCodes: IntegrityReasonCode[];
  action: IntegrityAction | null;
};

export type IntegrityArtworkFields = {
  id: string;
  title: string | null;
  registry_id: string | null;
  artist_id: string | null;
  metadata_hash: string | null;
  image_url: string | null;
  current_owner_id?: string | null;
  year?: string | number | null;
};

type IntegritySignals = {
  ownershipEventCount: number;
  ownershipLastToUserId: string | null;
  hasAnyValueEvent: boolean;
  hasGalleryVerification: boolean;
  hasLiveCertificate: boolean;
  hasRevokedCertificate: boolean;
  galleryIsVerified: boolean;
};

function displayTitle(artwork: IntegrityArtworkFields): string {
  const t = (artwork.title || "").trim() || "Untitled";
  const y = artwork.year != null && String(artwork.year).trim();
  return y ? `${t} (${String(artwork.year).trim()})` : t;
}

function safeRegistryHref(registryId: string | null | undefined): string | null {
  const rid = (registryId || "").trim();
  if (!rid) return null;
  return `/registry/${encodeURIComponent(rid)}`;
}

function safeArtworkEditHref(registryId: string | null | undefined): string | null {
  const rid = (registryId || "").trim();
  if (!rid) return null;
  return `/artwork/${encodeURIComponent(rid)}`;
}

function resolveIntegrityAction(
  top: IntegrityReasonCode[],
  registryHref: string | null,
  editHref: string | null
): IntegrityAction | null {
  if (top.includes("missing_declared_value") && registryHref) {
    return {
      kind: "link",
      href: registryHref,
      labelKey: "gallery.ops.action.addValue",
    };
  }
  if (
    (top.includes("missing_title") ||
      top.includes("missing_image") ||
      top.includes("missing_metadata_fingerprint")) &&
    editHref
  ) {
    return {
      kind: "link",
      href: editHref,
      labelKey: "gallery.ops.action.completeDetails",
    };
  }
  if (top.includes("missing_verification")) {
    return { kind: "verify", labelKey: "gallery.ops.action.verifyRecord" };
  }
  if (top.includes("no_certificate_on_file") && registryHref) {
    return {
      kind: "issue_certificate",
      labelKey: "gallery.ops.action.issueCertificate",
    };
  }
  if (registryHref) {
    return { kind: "link", href: registryHref, labelKey: "gallery.ops.action.viewRecord" };
  }
  return null;
}

/**
 * Derive integrity status for one artwork using only allowed sources:
 * artworks, ownership_events, value_events, verification_events, certificates, galleries.
 */
export function computeRecordIntegrity(
  artwork: IntegrityArtworkFields,
  s: IntegritySignals
): RecordIntegrityResult {
  const reasonCodes: IntegrityReasonCode[] = [];

  if (!artwork.artist_id) {
    return {
      status: "incomplete",
      reasonCodes: ["no_artist_linked"],
      action: { kind: "roster", labelKey: "gallery.ops.action.assignArtist" },
    };
  }

  if (s.ownershipEventCount <= 0) {
    const href = safeRegistryHref(artwork.registry_id);
    return {
      status: "incomplete",
      reasonCodes: ["no_ownership_history"],
      action: href
        ? { kind: "link", href, labelKey: "gallery.ops.action.viewRecord" }
        : null,
    };
  }

  if (
    s.ownershipLastToUserId &&
    artwork.current_owner_id &&
    String(s.ownershipLastToUserId).toLowerCase() !==
      String(artwork.current_owner_id).toLowerCase()
  ) {
    reasonCodes.push("ownership_ledger_mismatch");
  }

  if (!s.hasAnyValueEvent) {
    reasonCodes.push("missing_declared_value");
  }

  if (!(artwork.title || "").trim()) reasonCodes.push("missing_title");
  if (!(artwork.metadata_hash || "").trim()) {
    reasonCodes.push("missing_metadata_fingerprint");
  }
  if (!(artwork.image_url || "").trim()) reasonCodes.push("missing_image");

  if (!s.hasLiveCertificate && s.hasRevokedCertificate) {
    reasonCodes.push("certificate_revoked");
  }

  const hasVerification =
    s.hasLiveCertificate || (s.hasGalleryVerification && s.galleryIsVerified);
  if (!hasVerification) {
    reasonCodes.push("missing_verification");
  } else if (!s.hasLiveCertificate && s.hasGalleryVerification) {
    reasonCodes.push("no_certificate_on_file");
  }

  const status: RecordIntegrityStatus =
    reasonCodes.length === 0 ? "complete" : "needs_attention";

  const top = reasonCodes.slice(0, 2);
  const registryHref = safeRegistryHref(artwork.registry_id);
  const editHref = safeArtworkEditHref(artwork.registry_id);

  return {
    status,
    reasonCodes: top,
    action: resolveIntegrityAction(top, registryHref, editHref),
  };
}

export function aggregateIntegrityCounts(items: { status: RecordIntegrityStatus }[]) {
  let complete = 0;
  let needs_attention = 0;
  let incomplete = 0;
  for (const { status } of items) {
    if (status === "complete") complete += 1;
    else if (status === "needs_attention") needs_attention += 1;
    else incomplete += 1;
  }
  return { complete, needs_attention, incomplete };
}

export function integrityRowTitle(artwork: IntegrityArtworkFields) {
  return displayTitle(artwork);
}
