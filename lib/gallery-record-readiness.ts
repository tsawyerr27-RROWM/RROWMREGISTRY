/**
 * Gallery dashboard — operational record readiness (derived only; no new tables).
 * Status precedence: incomplete → needs_attention → ready.
 */

import type {
  OpsActionLabelKey,
  ReadinessReasonCode,
} from "@/lib/gallery-ops-i18n";

export type RecordReadinessStatus = "ready" | "needs_attention" | "incomplete";

export type ReadinessAction =
  | { kind: "link"; href: string; labelKey: OpsActionLabelKey }
  | { kind: "roster"; labelKey: OpsActionLabelKey };

export type RecordReadinessResult = {
  status: RecordReadinessStatus;
  reasonCode: ReadinessReasonCode | null;
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
      reasonCode: "registry_id_missing",
      action: null,
    };
  }

  if (!artistOk) {
    return {
      status: "incomplete",
      reasonCode: "no_artist_linked",
      action: { kind: "roster", labelKey: "gallery.ops.action.assignArtist" },
    };
  }

  if (!ownershipOk) {
    return {
      status: "incomplete",
      reasonCode: "no_ownership",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.viewRecord",
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
      reasonCode: "title_missing",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.completeDetails",
      },
    };
  }

  if (!metaHashOk) {
    return {
      status: "needs_attention",
      reasonCode: "metadata_fingerprint_missing",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.viewRecord",
      },
    };
  }

  if (!hasDeclaredValue) {
    return {
      status: "needs_attention",
      reasonCode: "missing_declared_value",
      action: {
        kind: "link",
        href: `/registry/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.addValue",
      },
    };
  }

  if (!imageOk) {
    return {
      status: "needs_attention",
      reasonCode: "missing_image",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.completeDetails",
      },
    };
  }

  if (!metaComplete) {
    return {
      status: "needs_attention",
      reasonCode: "incomplete_metadata",
      action: {
        kind: "link",
        href: `/artwork/${encodeURIComponent(artwork.registry_id!)}`,
        labelKey: "gallery.ops.action.completeDetails",
      },
    };
  }

  return { status: "ready", reasonCode: null, action: null };
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
