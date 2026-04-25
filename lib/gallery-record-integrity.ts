/**
 * Gallery dashboard — provenance integrity & completeness (derived only; no new tables).
 *
 * Status precedence: incomplete → needs_attention → complete.
 * Keep this intentionally small and aligned with the existing system’s sources of truth.
 */

export type RecordIntegrityStatus = "complete" | "needs_attention" | "incomplete";

export type IntegrityAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "roster"; label: string }
  | { kind: "verify"; label: string }
  | { kind: "issue_certificate"; label: string };

export type RecordIntegrityResult = {
  status: RecordIntegrityStatus;
  /** Short, human-readable reasons (1–2 for UI). */
  reasons: string[];
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

/**
 * Derive integrity status for one artwork using only allowed sources:
 * artworks, ownership_events, value_events, verification_events, certificates, galleries.
 */
export function computeRecordIntegrity(
  artwork: IntegrityArtworkFields,
  s: IntegritySignals
): RecordIntegrityResult {
  const reasons: string[] = [];

  // --- Incomplete gates (hard blockers)
  if (!artwork.artist_id) {
    return {
      status: "incomplete",
      reasons: ["No artist linked"],
      action: { kind: "roster", label: "Assign artist" },
    };
  }

  if (s.ownershipEventCount <= 0) {
    const href = safeRegistryHref(artwork.registry_id);
    return {
      status: "incomplete",
      reasons: ["No ownership history on file"],
      action: href ? { kind: "link", href, label: "View record" } : null,
    };
  }

  // --- Ownership integrity
  if (
    s.ownershipLastToUserId &&
    artwork.current_owner_id &&
    String(s.ownershipLastToUserId).toLowerCase() !==
      String(artwork.current_owner_id).toLowerCase()
  ) {
    reasons.push("Ownership ledger does not match current owner");
  }

  // --- Value completeness
  if (!s.hasAnyValueEvent) {
    reasons.push("Missing declared value");
  }

  // --- Metadata completeness (critical)
  if (!(artwork.title || "").trim()) reasons.push("Missing title");
  if (!(artwork.metadata_hash || "").trim())
    reasons.push("Missing metadata fingerprint");
  if (!(artwork.image_url || "").trim()) reasons.push("Missing image");

  // --- Certificate state
  if (!s.hasLiveCertificate && s.hasRevokedCertificate) {
    reasons.push("Certificate revoked");
  }

  // --- Verification strength
  const hasVerification =
    s.hasLiveCertificate || (s.hasGalleryVerification && s.galleryIsVerified);
  if (!hasVerification) {
    reasons.push("Missing verification");
  } else if (!s.hasLiveCertificate && s.hasGalleryVerification) {
    // Optional improvement signal: verification exists, but not the strongest.
    reasons.push("No certificate on file");
  }

  const status: RecordIntegrityStatus =
    reasons.length === 0 ? "complete" : "needs_attention";

  const top = reasons.slice(0, 2);

  // Action mapping (single primary CTA, calm + obvious).
  const registryHref = safeRegistryHref(artwork.registry_id);
  const editHref = safeArtworkEditHref(artwork.registry_id);

  const action: IntegrityAction | null =
    top.includes("Missing declared value") && registryHref
      ? { kind: "link", href: registryHref, label: "Add value" }
      : (top.some((r) => r.startsWith("Missing ")) || top.includes("Missing title")) &&
          editHref
        ? { kind: "link", href: editHref, label: "Complete details" }
        : top.includes("Missing verification")
          ? { kind: "verify", label: "Verify record" }
          : top.includes("No certificate on file") && registryHref
            ? { kind: "issue_certificate", label: "Issue certificate" }
            : registryHref
              ? { kind: "link", href: registryHref, label: "View record" }
              : null;

  return { status, reasons: top, action };
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

