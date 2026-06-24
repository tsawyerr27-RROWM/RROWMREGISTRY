import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCanonicalOwner,
  getOwnedArtworkIds,
  getTransferredArtworkIds,
  validateOwnershipIntegrity,
  type OwnershipIntegrityIssue,
} from "@/lib/canonical-ownership-engine";
import { getPendingTransfers } from "@/lib/ownership-resolver";

export type OwnershipIntegrityAuditReport = {
  pass: boolean;
  issues: OwnershipIntegrityIssue[];
  checked_artworks: number;
};

/**
 * System-wide ownership integrity audit (PR-BETA.7).
 * Checks cache vs ledger, portfolio sets vs ledger, orphan completed transfers.
 */
export async function runOwnershipIntegrityAudit(
  service: SupabaseClient,
  args?: {
    userId?: string;
    artworkIds?: string[];
    maxArtworks?: number;
  }
): Promise<OwnershipIntegrityAuditReport> {
  const issues: OwnershipIntegrityIssue[] = [];
  const userId = String(args?.userId ?? "").trim() || null;
  const maxArtworks = args?.maxArtworks ?? 200;

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
    const { data: orphanTransfers } = await service
      .from("provenance_transfers")
      .select("id, artwork_id, ownership_event_id")
      .eq("status", "completed")
      .is("ownership_event_id", null)
      .limit(50);

    for (const tr of orphanTransfers ?? []) {
      issues.push({
        code: "orphan_completed_transfer",
        artwork_id: String((tr as { artwork_id?: string }).artwork_id ?? ""),
        detail: `completed provenance_transfer ${String((tr as { id?: string }).id ?? "")} has no ownership_event_id`,
      });
    }

    return {
      pass: issues.length === 0,
      issues,
      checked_artworks: 0,
    };
  }

  const slice = artworkIds.slice(0, maxArtworks);

  for (const artworkId of slice) {
    const report = await validateOwnershipIntegrity(service, artworkId);
    issues.push(...report.issues);
  }

  if (userId) {
    const owned = await getOwnedArtworkIds(service, userId);
    const transferred = await getTransferredArtworkIds(service, userId);

    const overlap = owned.filter((id) => transferred.includes(id));
    for (const artworkId of overlap) {
      issues.push({
        code: "owned_and_transferred_overlap",
        artwork_id: artworkId,
        user_id: userId,
        detail: "work appears in both owned and transferred portfolio sets",
      });
    }

    for (const artworkId of owned) {
      const owner = await getCanonicalOwner(service, artworkId);
      if (owner.userId !== userId) {
        issues.push({
          code: "portfolio_owned_vs_ledger",
          artwork_id: artworkId,
          user_id: userId,
          detail: `owned portfolio includes work but ledger holder is ${owner.userId ?? "null"}`,
        });
      }
    }

    for (const artworkId of transferred) {
      const owner = await getCanonicalOwner(service, artworkId);
      if (owner.userId === userId) {
        issues.push({
          code: "portfolio_transferred_still_holder",
          artwork_id: artworkId,
          user_id: userId,
          detail: "transferred portfolio includes work but user is still ledger holder",
        });
      }
    }

    const pending = await getPendingTransfers(service, userId);
    for (const row of pending) {
      if (owned.includes(row.artwork_id)) {
        issues.push({
          code: "pending_transfer_while_owned",
          artwork_id: row.artwork_id,
          user_id: userId,
          detail: `pending transfer ${row.provenance_transfer_id} but user is current ledger holder`,
        });
      }
    }
  }

  const { data: globalOrphans } = await service
    .from("provenance_transfers")
    .select("id, artwork_id")
    .eq("status", "completed")
    .is("ownership_event_id", null)
    .limit(25);

  for (const tr of globalOrphans ?? []) {
    const aid = String((tr as { artwork_id?: string }).artwork_id ?? "");
    if (slice.includes(aid)) continue;
    issues.push({
      code: "orphan_completed_transfer",
      artwork_id: aid,
      detail: `completed provenance_transfer ${String((tr as { id?: string }).id ?? "")} has no ownership_event_id`,
    });
  }

  if (issues.length) {
    console.error("[ownership-integrity-audit] failures", {
      count: issues.length,
      user_id: userId,
    });
  }

  return {
    pass: issues.length === 0,
    issues,
    checked_artworks: slice.length,
  };
}
