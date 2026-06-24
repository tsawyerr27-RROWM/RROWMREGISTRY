import type { SupabaseClient } from "@supabase/supabase-js";

import {
  dealExecutionNoteMarker,
  mapProvenanceStatusToExecution,
  mergeAcquisitionExecutionIntoTerms,
  type AcquisitionExecutionRecord,
} from "@/lib/deal-execution";
import {
  upsertDealExecutionRecord,
} from "@/lib/deal-execution-records";
import { archiveArtwork } from "@/lib/personal-archive";
import { buildAcquisitionAcceptHref } from "@/lib/acquisition-transfer-nav";
import { registryLedgerHref } from "@/lib/registry-nav";

export type OwnershipLoopRole = "buyer" | "seller";

export type OwnershipLoopStatus =
  | "awaiting_buyer"
  | "awaiting_seller"
  | "completed";

export type OwnershipLoopPrompt = {
  role: OwnershipLoopRole;
  status: OwnershipLoopStatus;
  message: string;
  action_href: string | null;
  action_label: string | null;
};

export type PendingAcquisitionRow = {
  artwork_id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  deal_id: string | null;
  provenance_transfer_id: string;
  accept_href: string | null;
  status: "pending_transfer";
};

type TransferRow = {
  id: string;
  artwork_id: string;
  from_user_id: string;
  recipient_user_id: string | null;
  status: string;
  invite_token: string | null;
  note: string | null;
};

function parseDealIdFromNote(note: string | null | undefined): string | null {
  const raw = String(note ?? "");
  const match = raw.match(/deal_id=([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

export function buildOwnershipAcceptHref(inviteToken: string | null): string | null {
  return buildAcquisitionAcceptHref(inviteToken);
}

export async function loadAcquisitionTransferForDeal(
  service: SupabaseClient,
  args: { dealId: string; artworkId: string }
): Promise<TransferRow | null> {
  const marker = dealExecutionNoteMarker(args.dealId);
  const { data, error } = await service
    .from("provenance_transfers")
    .select(
      "id, artwork_id, from_user_id, recipient_user_id, status, invite_token, note"
    )
    .eq("artwork_id", args.artworkId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) return null;

  const row = data.find((item) =>
    String((item as { note?: string }).note ?? "").includes(marker)
  );
  return row ? (row as TransferRow) : null;
}

export function resolveOwnershipLoopPrompt(args: {
  userId: string;
  sellerUserId: string | null;
  buyerUserId: string | null;
  executionStatus: string;
  registryId: string | null;
  dealId: string;
  acceptHref: string | null;
}): OwnershipLoopPrompt | null {
  const uid = String(args.userId ?? "").trim();
  const seller = String(args.sellerUserId ?? "").trim();
  const buyer = String(args.buyerUserId ?? "").trim();
  const executionStatus = mapProvenanceStatusToExecution(args.executionStatus);
  const registryHref = args.registryId
    ? registryLedgerHref(args.registryId)
    : null;
  const dealsHref = `/studio/deals?deal=${encodeURIComponent(args.dealId)}`;

  if (executionStatus === "completed") {
    if (uid === buyer || uid === seller) {
      return {
        role: uid === buyer ? "buyer" : "seller",
        status: "completed",
        message: "Stewardship transfer is complete and recorded on the registry ledger.",
        action_href: registryHref,
        action_label: registryHref ? "View registry ledger" : null,
      };
    }
    return null;
  }

  if (executionStatus !== "pending_acceptance") return null;

  if (uid === buyer) {
    return {
      role: "buyer",
      status: "awaiting_buyer",
      message:
        "The seller has transferred stewardship. Confirm receipt to add this work to your collection.",
      action_href: args.acceptHref ?? registryHref,
      action_label: args.acceptHref ? "Confirm receipt" : "View registry record",
    };
  }

  if (uid === seller) {
    return {
      role: "seller",
      status: "awaiting_seller",
      message:
        "Transfer initiated. The buyer must confirm receipt before ownership updates on the registry.",
      action_href: dealsHref,
      action_label: "Awaiting buyer confirmation",
    };
  }

  return null;
}

export async function resolveOwnershipLoopForDealExecution(
  service: SupabaseClient,
  args: {
    dealId: string;
    artworkId: string;
    userId: string;
    registryId: string | null;
    execution: AcquisitionExecutionRecord | null;
  }
): Promise<OwnershipLoopPrompt | null> {
  if (!args.execution?.provenance_transfer_id) return null;

  const transfer =
    (await loadAcquisitionTransferForDeal(service, {
      dealId: args.dealId,
      artworkId: args.artworkId,
    })) ??
    null;

  const sellerUserId = String(transfer?.from_user_id ?? args.execution.recorded_by_user_id ?? "");
  const buyerUserId = String(
    transfer?.recipient_user_id ?? args.execution.recipient_user_id ?? ""
  );

  return resolveOwnershipLoopPrompt({
    userId: args.userId,
    sellerUserId,
    buyerUserId,
    executionStatus: transfer?.status ?? args.execution.status,
    registryId: args.registryId,
    dealId: args.dealId,
    acceptHref: buildOwnershipAcceptHref(transfer?.invite_token ?? null),
  });
}

export async function listPendingAcquisitionsForUser(
  service: SupabaseClient,
  userId: string
): Promise<PendingAcquisitionRow[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const { data: rpcRows, error: rpcError } = await service.rpc(
    "list_pending_acquisition_transfers",
    { p_user_id: uid }
  );

  let transfers: Array<{
    provenance_transfer_id: string;
    artwork_id: string;
    deal_id: string | null;
    invite_token: string | null;
    status: string;
    note?: string | null;
  }> = [];

  if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
    transfers = rpcRows.map((row) => ({
      provenance_transfer_id: String(
        (row as { provenance_transfer_id?: string }).provenance_transfer_id ?? ""
      ),
      artwork_id: String((row as { artwork_id?: string }).artwork_id ?? ""),
      deal_id:
        (row as { deal_id?: string | null }).deal_id != null
          ? String((row as { deal_id?: string | null }).deal_id)
          : null,
      invite_token:
        (row as { invite_token?: string | null }).invite_token != null
          ? String((row as { invite_token?: string | null }).invite_token)
          : null,
      status: String((row as { status?: string }).status ?? "pending_acceptance"),
    }));
  } else {
    if (rpcError) {
      console.warn(
        "[acquisition-ownership-loop] list_pending_acquisition_transfers",
        rpcError.message
      );
    }

    const { data: legacyRows, error } = await service
      .from("provenance_transfers")
      .select("id, artwork_id, status, invite_token, note")
      .eq("recipient_user_id", uid)
      .eq("status", "pending_acceptance")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !legacyRows?.length) return [];

    transfers = legacyRows.map((row) => ({
      provenance_transfer_id: String((row as { id?: string }).id ?? ""),
      artwork_id: String((row as { artwork_id?: string }).artwork_id ?? ""),
      deal_id: parseDealIdFromNote(String((row as { note?: string }).note ?? "")),
      invite_token:
        (row as { invite_token?: string | null }).invite_token != null
          ? String((row as { invite_token?: string | null }).invite_token)
          : null,
      status: String((row as { status?: string }).status ?? "pending_acceptance"),
      note: String((row as { note?: string }).note ?? ""),
    }));
  }

  if (transfers.length === 0) return [];

  const artworkIds = [
    ...new Set(transfers.map((row) => row.artwork_id).filter(Boolean)),
  ];
  if (artworkIds.length === 0) return [];

  const { data: artworks } = await service
    .from("artworks")
    .select("id, title, registry_id, image_url")
    .in("id", artworkIds);

  const artById = new Map(
    (artworks ?? []).map((row) => [String(row.id), row as Record<string, unknown>])
  );

  return transfers
    .map((transfer) => {
      const art = artById.get(String(transfer.artwork_id));
      if (!art) return null;
      return {
        artwork_id: String(transfer.artwork_id),
        title: art.title != null ? String(art.title) : null,
        registry_id: art.registry_id != null ? String(art.registry_id) : null,
        image_url: art.image_url != null ? String(art.image_url) : null,
        deal_id: transfer.deal_id,
        provenance_transfer_id: String(transfer.provenance_transfer_id),
        accept_href: buildOwnershipAcceptHref(transfer.invite_token),
        status: "pending_transfer" as const,
      };
    })
    .filter((row): row is PendingAcquisitionRow => row !== null);
}

export async function completeAcquisitionOwnershipLoop(
  service: SupabaseClient,
  args: {
    provenanceTransferId: string;
    artworkId: string;
    fromUserId: string;
    toUserId: string;
  }
): Promise<void> {
  const transferId = String(args.provenanceTransferId ?? "").trim();
  const artworkId = String(args.artworkId ?? "").trim();
  if (!transferId || !artworkId) return;

  const { data: transfer } = await service
    .from("provenance_transfers")
    .select("id, note, status")
    .eq("id", transferId)
    .maybeSingle();

  const dealId = parseDealIdFromNote(
    String((transfer as { note?: string } | null)?.note ?? "")
  );

  if (dealId) {
    const now = new Date().toISOString();
    const { data: art } = await service
      .from("artworks")
      .select("registry_id")
      .eq("id", artworkId)
      .maybeSingle();

    const execution: AcquisitionExecutionRecord = {
      type: "acquisition",
      provenance_transfer_id: transferId,
      registry_id: art?.registry_id ? String(art.registry_id) : null,
      recorded_at: now,
      recorded_by_user_id: args.fromUserId,
      status: "completed",
      recipient_user_id: args.toUserId,
    };

    await upsertDealExecutionRecord(service, { dealId, execution });

    const { data: dealRow } = await service
      .from("deals")
      .select("terms")
      .eq("id", dealId)
      .maybeSingle();

    const existingTerms =
      dealRow?.terms &&
      typeof dealRow.terms === "object" &&
      !Array.isArray(dealRow.terms)
        ? (dealRow.terms as Record<string, unknown>)
        : {};

    await service
      .from("deals")
      .update({
        terms: mergeAcquisitionExecutionIntoTerms(existingTerms, execution),
        updated_at: now,
      })
      .eq("id", dealId);
  }

  if (args.fromUserId) {
    await archiveArtwork(service, artworkId, args.fromUserId);
  }
}
