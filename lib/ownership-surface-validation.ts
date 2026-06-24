import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCanonicalOwner,
  getOwnedArtworkIds,
  getOwnershipTimeline,
  getTransferredArtworkIds,
  validateOwnershipIntegrity,
} from "@/lib/canonical-ownership-engine";
import { getPendingTransfers } from "@/lib/ownership-resolver";

export type OwnershipSurfaceMismatch = {
  check: string;
  artwork_id?: string;
  user_id?: string;
  detail: string;
};

export type OwnershipSurfaceValidationReport = {
  pass: boolean;
  mismatches: OwnershipSurfaceMismatch[];
};

/** @deprecated Use runOwnershipIntegrityAudit from ownership-integrity-audit */
export async function runOwnershipSurfaceValidation(
  service: SupabaseClient,
  args?: {
    userId?: string;
    artworkIds?: string[];
  }
): Promise<OwnershipSurfaceValidationReport> {
  const mismatches: OwnershipSurfaceMismatch[] = [];
  const userId = String(args?.userId ?? "").trim() || null;

  let artworkIds = args?.artworkIds?.map((id) => String(id).trim()).filter(Boolean);
  if (!artworkIds?.length && userId) {
    const owned = await getOwnedArtworkIds(service, userId);
    const transferred = await getTransferredArtworkIds(service, userId);
    const pending = await getPendingTransfers(service, userId);
    artworkIds = [
      ...new Set([
        ...owned,
        ...transferred,
        ...pending.map((p) => p.artwork_id),
      ]),
    ];
  }

  if (!artworkIds?.length) {
    return { pass: true, mismatches: [] };
  }

  for (const artworkId of artworkIds) {
    const report = await validateOwnershipIntegrity(service, artworkId);
    for (const issue of report.issues) {
      mismatches.push({
        check: issue.code,
        artwork_id: issue.artwork_id,
        user_id: issue.user_id,
        detail: issue.detail,
      });
    }

    const owner = await getCanonicalOwner(service, artworkId);
    const timeline = await getOwnershipTimeline(service, artworkId);
    const registryLatest = timeline.at(-1)?.to_user_id ?? null;
    if (owner.userId && registryLatest && owner.userId !== registryLatest) {
      mismatches.push({
        check: "chronology_vs_resolver",
        artwork_id: artworkId,
        detail: `resolver holder ${owner.userId} ≠ timeline latest ${registryLatest}`,
      });
    }
  }

  if (userId) {
    const owned = await getOwnedArtworkIds(service, userId);
    const transferred = await getTransferredArtworkIds(service, userId);
    const overlap = owned.filter((id) => transferred.includes(id));
    for (const artworkId of overlap) {
      mismatches.push({
        check: "owned_and_transferred_overlap",
        artwork_id: artworkId,
        user_id: userId,
        detail: "work appears in both owned and transferred sets",
      });
    }

    const pending = await getPendingTransfers(service, userId);
    for (const row of pending) {
      if (owned.includes(row.artwork_id)) {
        mismatches.push({
          check: "pending_while_owned",
          artwork_id: row.artwork_id,
          user_id: userId,
          detail: `pending transfer ${row.provenance_transfer_id} but user is current owner`,
        });
      }
    }
  }

  if (mismatches.length) {
    console.error("[ownership-surface-validation] mismatches", mismatches);
  }

  return { pass: mismatches.length === 0, mismatches };
}
