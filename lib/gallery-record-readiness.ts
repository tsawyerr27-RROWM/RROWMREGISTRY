/**
 * Gallery dashboard — operational record readiness (derived only; no new tables).
 * Status precedence: incomplete → needs_attention → ready.
 */

export type RecordReadinessStatus = "ready" | "needs_attention" | "incomplete";

export type ReadinessAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "roster"; label: string };

export type RecordReadinessResult = {
  status: RecordReadinessStatus;
  /** Primary line for UI (short). */
  reason: string;
  action: ReadinessAction | null;
};

export type ReadinessArtworkFields = {
  id: string;
  title: string | null;
  registry_id: string | null;
  artist_id: string | null;
  image_url: string | null;
  year: string | number | null;
  medium: string | null;
  metadata_hash: string | null;
};

function yearPresent(year: string | number | null | undefined): boolean {
  if (year == null) return false;
  const s = String(year).trim();
  return s.length > 0;
}

function mediumPresent(medium: string | null | undefined): boolean {
  return Boolean(medium?.trim());
}

/**
 * @param ownershipEventCount — count of rows in ownership_events for this artwork
 * @param hasDeclaredValue — true if at least one value_event has a usable declared_value
 */
export function computeRecordReadiness(
  artwork: ReadinessArtworkFields,
  ownershipEventCount: number,
  hasDeclaredValue: boolean
): RecordReadinessResult {
  const registryOk = Boolean(artwork.registry_id?.trim());
  const artistOk = Boolean(artwork.artist_id);
  const ownershipOk = ownershipEventCount > 0;

  if (!registryOk) {
    return {
      status: "incomplete",
      reason: "Registry ID missing",
      action: null,
    };
  }

  if (!artistOk) {
    return {
      status: "incomplete",
      reason: "No artist linked",
      action: { kind: "roster", label: "Assign artist" },
    };
  }

  if (!ownershipOk) {
    return {
      status: "incomplete",
      reason: "No ownership on file",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        label: "View record",
      },
    };
  }

  const titleOk = Boolean(artwork.title?.trim());
  const metaHashOk = Boolean(artwork.metadata_hash?.trim());
  const imageOk = Boolean(artwork.image_url?.trim());
  const metaComplete = yearPresent(artwork.year) && mediumPresent(artwork.medium);

  if (!titleOk) {
    return {
      status: "needs_attention",
      reason: "Title missing",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        label: "Complete details",
      },
    };
  }

  if (!metaHashOk) {
    return {
      status: "needs_attention",
      reason: "Metadata fingerprint missing",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        label: "View record",
      },
    };
  }

  if (!hasDeclaredValue) {
    return {
      status: "needs_attention",
      reason: "Missing declared value",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        label: "Add value",
      },
    };
  }

  if (!imageOk) {
    return {
      status: "needs_attention",
      reason: "Missing image",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        label: "Complete details",
      },
    };
  }

  if (!metaComplete) {
    return {
      status: "needs_attention",
      reason: "Incomplete metadata (year / medium)",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        label: "Complete details",
      },
    };
  }

  return { status: "ready", reason: "", action: null };
}

export function aggregateReadinessCounts(
  items: { status: RecordReadinessStatus }[]
) {
  let ready = 0;
  let needs_attention = 0;
  let incomplete = 0;
  for (const { status } of items) {
    if (status === "ready") ready += 1;
    else if (status === "needs_attention") needs_attention += 1;
    else incomplete += 1;
  }
  return { ready, needs_attention, incomplete };
}
