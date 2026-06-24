import type { SupabaseClient } from "@supabase/supabase-js";

import { dealExecutionNoteMarker } from "@/lib/deal-execution";
import {
  fetchCanonicalHolderForArtwork,
  ownershipCacheMatchesLedger,
} from "@/lib/ownership-canonical";

export type LifecycleValidationIssue = {
  code: string;
  message: string;
  artwork_id?: string;
  deal_id?: string;
};

export type LifecycleValidationResult = {
  ok: boolean;
  issues: LifecycleValidationIssue[];
};

function pushIssue(
  issues: LifecycleValidationIssue[],
  issue: LifecycleValidationIssue
): void {
  issues.push(issue);
}

export async function validateAcquisitionIntegrity(
  service: SupabaseClient,
  args?: { artworkId?: string; dealId?: string }
): Promise<LifecycleValidationResult> {
  const issues: LifecycleValidationIssue[] = [];
  const artworkId = String(args?.artworkId ?? "").trim();
  const dealId = String(args?.dealId ?? "").trim();

  let artworkQuery = service
    .from("artworks")
    .select("id, current_owner_id, verification_status")
    .limit(200);

  if (artworkId) {
    artworkQuery = artworkQuery.eq("id", artworkId);
  }

  const { data: artworks, error: artError } = await artworkQuery;
  if (artError) {
    pushIssue(issues, { code: "artworks_query_failed", message: artError.message });
    return { ok: false, issues };
  }

  for (const art of artworks ?? []) {
    const aid = String(art.id);
    const cachedOwner = art.current_owner_id ? String(art.current_owner_id) : null;
    const ledgerHolder = await fetchCanonicalHolderForArtwork(service, aid);

    if (!ownershipCacheMatchesLedger({ cachedOwnerId: cachedOwner, ledgerHolderId: ledgerHolder })) {
      pushIssue(issues, {
        code: "owner_cache_mismatch",
        message: "artworks.current_owner_id does not match latest ownership_events holder.",
        artwork_id: aid,
      });
    }

    if (dealId) {
      const marker = dealExecutionNoteMarker(dealId);
      const { data: transfer } = await service
        .from("provenance_transfers")
        .select("id, status, recipient_user_id")
        .eq("artwork_id", aid)
        .ilike("note", `%${marker}%`)
        .maybeSingle();

      const { data: execution } = await service
        .from("deal_execution_records")
        .select("id, kind, status, metadata")
        .eq("deal_id", dealId)
        .maybeSingle();

      if (execution && !transfer) {
        pushIssue(issues, {
          code: "missing_provenance_transfer",
          message: "Executed acquisition deal has no linked provenance_transfers row.",
          artwork_id: aid,
          deal_id: dealId,
        });
      }

      if (transfer && execution?.status === "completed" && transfer.status !== "completed") {
        pushIssue(issues, {
          code: "transfer_not_finalized",
          message: "Deal execution is completed but provenance transfer is still pending.",
          artwork_id: aid,
          deal_id: dealId,
        });
      }

      if (
        transfer &&
        execution?.status === "completed" &&
        ledgerHolder &&
        transfer.recipient_user_id &&
        ledgerHolder !== String(transfer.recipient_user_id)
      ) {
        pushIssue(issues, {
          code: "buyer_not_ledger_holder",
          message: "Completed acquisition buyer is not the canonical ledger holder.",
          artwork_id: aid,
          deal_id: dealId,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export async function validateExhibitionIntegrity(
  service: SupabaseClient,
  args?: { dealId?: string; artworkId?: string }
): Promise<LifecycleValidationResult> {
  const issues: LifecycleValidationIssue[] = [];
  const dealId = String(args?.dealId ?? "").trim();
  if (!dealId) return { ok: true, issues };

  const { data: execution } = await service
    .from("deal_execution_records")
    .select("metadata")
    .eq("deal_id", dealId)
    .eq("kind", "evidence")
    .maybeSingle();

  const eventId = String(
    (execution?.metadata as Record<string, unknown> | undefined)?.provenance_event_id ?? ""
  ).trim();

  if (!eventId) {
    pushIssue(issues, {
      code: "missing_exhibition_event",
      message: "Exhibition deal execution has no provenance_event_id.",
      deal_id: dealId,
    });
    return { ok: false, issues };
  }

  const { data: event } = await service
    .from("provenance_events")
    .select("id, artwork_id")
    .eq("id", eventId)
    .maybeSingle();

  if (!event?.id) {
    pushIssue(issues, {
      code: "provenance_event_missing",
      message: "Exhibition provenance event not found in ledger.",
      deal_id: dealId,
    });
  }

  return { ok: issues.length === 0, issues };
}

export async function validateRepresentationIntegrity(
  service: SupabaseClient,
  args?: { dealId?: string }
): Promise<LifecycleValidationResult> {
  const issues: LifecycleValidationIssue[] = [];
  const dealId = String(args?.dealId ?? "").trim();
  if (!dealId) return { ok: true, issues };

  const { data: execution } = await service
    .from("deal_execution_records")
    .select("metadata")
    .eq("deal_id", dealId)
    .eq("kind", "relationship")
    .maybeSingle();

  const relationshipId = String(
    (execution?.metadata as Record<string, unknown> | undefined)?.relationship_id ?? ""
  ).trim();

  if (!relationshipId) {
    pushIssue(issues, {
      code: "missing_relationship",
      message: "Representation deal execution has no relationship_id.",
      deal_id: dealId,
    });
    return { ok: false, issues };
  }

  const { data: rel } = await service
    .from("representation_relationships")
    .select("id, status")
    .eq("id", relationshipId)
    .maybeSingle();

  if (!rel?.id) {
    pushIssue(issues, {
      code: "relationship_not_found",
      message: "Representation relationship row missing.",
      deal_id: dealId,
    });
  } else if (String(rel.status ?? "").toLowerCase() !== "active") {
    pushIssue(issues, {
      code: "relationship_not_active",
      message: "Representation relationship is not active.",
      deal_id: dealId,
    });
  }

  return { ok: issues.length === 0, issues };
}

export async function validateLicensingIntegrity(
  service: SupabaseClient,
  args?: { dealId?: string }
): Promise<LifecycleValidationResult> {
  const issues: LifecycleValidationIssue[] = [];
  const dealId = String(args?.dealId ?? "").trim();
  if (!dealId) return { ok: true, issues };

  const { data: execution } = await service
    .from("deal_execution_records")
    .select("metadata")
    .eq("deal_id", dealId)
    .eq("kind", "rights_activation")
    .maybeSingle();

  const licenseId = String(
    (execution?.metadata as Record<string, unknown> | undefined)?.rights_license_id ?? ""
  ).trim();

  if (!licenseId) {
    pushIssue(issues, {
      code: "missing_license",
      message: "Licensing deal execution has no rights_license_id.",
      deal_id: dealId,
    });
    return { ok: false, issues };
  }

  const { data: license } = await service
    .from("rights_licenses")
    .select("id, status")
    .eq("id", licenseId)
    .maybeSingle();

  if (!license?.id) {
    pushIssue(issues, {
      code: "license_not_found",
      message: "Rights license row missing.",
      deal_id: dealId,
    });
  } else if (String(license.status ?? "").toLowerCase() !== "active") {
    pushIssue(issues, {
      code: "license_not_active",
      message: "Rights license is not active.",
      deal_id: dealId,
    });
  }

  return { ok: issues.length === 0, issues };
}
