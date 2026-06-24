import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCanonicalOwner,
  getOwnedArtworkIds,
  getTransferredArtworkIds,
  type OwnershipIntegrityIssue,
} from "@/lib/canonical-ownership-engine";
import { parseDealPriceTerms } from "@/lib/deal-acquisition-value";
import type { DealRow } from "@/lib/deals";
import { logProvenanceAccept } from "@/lib/provenance-accept-audit";

export class AcquisitionCompletionInvariantError extends Error {
  readonly issues: OwnershipIntegrityIssue[];

  constructor(issues: OwnershipIntegrityIssue[]) {
    super(
      `Acquisition completion invariants failed: ${issues.map((i) => i.code).join(", ")}`
    );
    this.name = "AcquisitionCompletionInvariantError";
    this.issues = issues;
  }
}

/**
 * Assert all required invariants after buyer accepts provenance transfer (deal acquisition).
 * Throws on failure — ownership inconsistency is unacceptable.
 */
export async function assertAcquisitionCompletionInvariants(
  service: SupabaseClient,
  args: {
    artworkId: string;
    buyerUserId: string;
    sellerUserId: string | null;
    provenanceTransferId: string | null;
    ownershipEventId: string | null;
    deal?: DealRow | null;
  }
): Promise<void> {
  const artworkId = String(args.artworkId ?? "").trim();
  const buyerUserId = String(args.buyerUserId ?? "").trim();
  const sellerUserId = String(args.sellerUserId ?? "").trim() || null;
  const transferId = String(args.provenanceTransferId ?? "").trim() || null;
  const ownershipEventId = String(args.ownershipEventId ?? "").trim() || null;

  const issues: OwnershipIntegrityIssue[] = [];

  if (transferId) {
    const { data: tr } = await service
      .from("provenance_transfers")
      .select("status, ownership_event_id, from_user_id")
      .eq("id", transferId)
      .maybeSingle();

    const status = String(tr?.status ?? "").toLowerCase();
    if (status !== "completed") {
      issues.push({
        code: "transfer_not_completed",
        artwork_id: artworkId,
        detail: `provenance_transfers.status=${status || "null"}`,
      });
    }

    const linkedOe = String(tr?.ownership_event_id ?? "").trim();
    if (!linkedOe) {
      issues.push({
        code: "transfer_missing_ownership_event",
        artwork_id: artworkId,
        detail: `transfer ${transferId} completed without ownership_event_id`,
      });
    } else if (ownershipEventId && linkedOe !== ownershipEventId) {
      issues.push({
        code: "transfer_ownership_event_mismatch",
        artwork_id: artworkId,
        detail: `transfer links ${linkedOe} expected ${ownershipEventId}`,
      });
    }
  }

  const owner = await getCanonicalOwner(service, artworkId);
  if (owner.userId !== buyerUserId) {
    issues.push({
      code: "ledger_holder_not_buyer",
      artwork_id: artworkId,
      user_id: buyerUserId,
      detail: `latest ownership_events holder=${owner.userId ?? "null"} expected buyer ${buyerUserId}`,
    });
  }

  if (ownershipEventId && owner.ownershipEventId !== ownershipEventId) {
    issues.push({
      code: "latest_event_mismatch",
      artwork_id: artworkId,
      detail: `latest event ${owner.ownershipEventId ?? "null"} expected ${ownershipEventId}`,
    });
  }

  const { data: art } = await service
    .from("artworks")
    .select("current_owner_id")
    .eq("id", artworkId)
    .maybeSingle();

  const cached = String(art?.current_owner_id ?? "").trim() || null;
  if (cached !== buyerUserId) {
    issues.push({
      code: "owner_cache_not_buyer",
      artwork_id: artworkId,
      user_id: buyerUserId,
      detail: `artworks.current_owner_id=${cached ?? "null"} expected buyer ${buyerUserId}`,
    });
  }

  if (sellerUserId) {
    const sellerOwned = await getOwnedArtworkIds(service, sellerUserId);
    if (sellerOwned.includes(artworkId)) {
      issues.push({
        code: "seller_still_in_holdings",
        artwork_id: artworkId,
        user_id: sellerUserId,
        detail: "seller still appears in current holdings after transfer",
      });
    }

    const sellerTransferred = await getTransferredArtworkIds(service, sellerUserId);
    if (!sellerTransferred.includes(artworkId)) {
      issues.push({
        code: "seller_not_in_transferred",
        artwork_id: artworkId,
        user_id: sellerUserId,
        detail: "seller not in transferred portfolio after sale",
      });
    }
  }

  const buyerOwned = await getOwnedArtworkIds(service, buyerUserId);
  if (!buyerOwned.includes(artworkId)) {
    issues.push({
      code: "buyer_not_in_holdings",
      artwork_id: artworkId,
      user_id: buyerUserId,
      detail: "buyer not in current holdings after accept",
    });
  }

  if (args.deal) {
    const price = parseDealPriceTerms(
      args.deal.terms as Record<string, unknown> | null | undefined
    );
    if (price) {
      const { data: saleEvents } = await service
        .from("value_events")
        .select("id")
        .eq("artwork_id", artworkId)
        .eq("value_type", "sale")
        .order("created_at", { ascending: false })
        .limit(1);

      if (!saleEvents?.length) {
        issues.push({
          code: "missing_sale_value_event",
          artwork_id: artworkId,
          detail: "deal has price terms but no sale value_events row",
        });
      }
    }
  }

  if (issues.length > 0) {
    logProvenanceAccept("acquisition_invariants_failed", {
      artwork_id: artworkId,
      buyer_user_id: buyerUserId,
      seller_user_id: sellerUserId,
      issues,
    });
    throw new AcquisitionCompletionInvariantError(issues);
  }

  logProvenanceAccept("acquisition_invariants_ok", {
    artwork_id: artworkId,
    buyer_user_id: buyerUserId,
    seller_user_id: sellerUserId,
    ownership_event_id: ownershipEventId,
  });
}
