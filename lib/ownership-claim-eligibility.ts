import type { SupabaseClient } from "@supabase/supabase-js";

import { buildOwnershipAcceptHref } from "@/lib/acquisition-ownership-loop";
import { dealExecutionNoteMarker, resolveUserEmail } from "@/lib/deal-execution";
import { fetchCanonicalHolderForArtwork } from "@/lib/ownership-canonical";

export const OWNERSHIP_CLAIM_NOTE_MIN_LENGTH = 12;

export function isOwnershipClaimNoteValid(note: unknown): boolean {
  return String(note ?? "").trim().length >= OWNERSHIP_CLAIM_NOTE_MIN_LENGTH;
}

export type OwnershipClaimPath =
  | { kind: "already_owner" }
  | {
      kind: "provenance_accept";
      accept_href: string | null;
      deal_id: string | null;
      message: string;
    }
  | { kind: "manual_eligible" }
  | { kind: "blocked"; reason: string };

const PENDING_TRANSFER_STATUSES = ["pending_acceptance", "initiated"] as const;

function parseDealIdFromNote(note: string | null | undefined): string | null {
  const match = String(note ?? "").match(/deal_id=([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

function isDealLinkedTransferNote(note: string | null | undefined): boolean {
  const raw = String(note ?? "");
  return raw.includes("deal_execution") || raw.includes("deal_id=");
}

function transferAcceptPath(args: {
  invite_token: string | null | undefined;
  note: string | null | undefined;
  deal_id?: string | null;
}): { accept_href: string | null; deal_id: string | null } {
  return {
    accept_href: buildOwnershipAcceptHref(
      String(args.invite_token ?? "")
    ),
    deal_id: args.deal_id ?? parseDealIdFromNote(args.note),
  };
}

function userMatchesTransferRecipient(args: {
  userId: string;
  userEmail: string | null;
  recipientUserId: string | null | undefined;
  recipientEmail: string | null | undefined;
}): boolean {
  const uid = String(args.userId ?? "").trim();
  const recipientUserId = String(args.recipientUserId ?? "").trim();
  if (recipientUserId && recipientUserId === uid) return true;

  const email = String(args.userEmail ?? "").trim().toLowerCase();
  const recipientEmail = String(args.recipientEmail ?? "").trim().toLowerCase();
  if (email && recipientEmail && email === recipientEmail) return true;

  return false;
}

async function hasPendingDealAcquisitionTransfer(
  reader: SupabaseClient,
  userId: string,
  artworkId: string,
  userEmail: string | null
): Promise<{ accept_href: string | null; deal_id: string | null } | null> {
  const uid = String(userId ?? "").trim();
  const aid = String(artworkId ?? "").trim();
  if (!uid || !aid) return null;

  const { data: rpcFlag, error: rpcFlagError } = await reader.rpc(
    "user_has_pending_acquisition_on_artwork",
    { p_user_id: uid, p_artwork_id: aid }
  );

  if (!rpcFlagError && rpcFlag === true) {
    const { data: rpcRows } = await reader.rpc("list_pending_acquisition_transfers", {
      p_user_id: uid,
    });
    const match = (rpcRows ?? []).find(
      (row: { artwork_id?: string }) =>
        String(row.artwork_id ?? "") === aid
    );
    if (match) {
      return transferAcceptPath({
        invite_token: (match as { invite_token?: string | null }).invite_token,
        note: null,
        deal_id:
          (match as { deal_id?: string | null }).deal_id != null
            ? String((match as { deal_id?: string | null }).deal_id)
            : null,
      });
    }
  }

  // 1) Canonical: deal execution record → provenance transfer (works even when RLS hides rows).
  const { data: deals } = await reader
    .from("deals")
    .select("id, participant_a_user_id, participant_b_user_id")
    .eq("artwork_id", aid)
    .eq("type", "acquisition")
    .in("status", ["accepted", "closed"])
    .limit(20);

  for (const deal of deals ?? []) {
    const dealId = String(deal.id);
    const participantA = String(deal.participant_a_user_id ?? "");
    const participantB = String(deal.participant_b_user_id ?? "");
    if (uid !== participantA && uid !== participantB) continue;

    const { data: execution } = await reader
      .from("deal_execution_records")
      .select("metadata, status")
      .eq("deal_id", dealId)
      .eq("kind", "transfer")
      .maybeSingle();

    if (!execution || String(execution.status ?? "") === "completed") continue;

    const meta = (execution.metadata ?? {}) as Record<string, unknown>;
    const recipient = String(meta.recipient_user_id ?? "").trim();
    if (recipient && recipient !== uid) continue;

    const transferId = String(meta.provenance_transfer_id ?? "").trim();
    if (!transferId) continue;

    const { data: transfer } = await reader
      .from("provenance_transfers")
      .select("id, status, invite_token, note, recipient_user_id, recipient_email")
      .eq("id", transferId)
      .maybeSingle();

    if (!transfer?.id) continue;
    if (!PENDING_TRANSFER_STATUSES.includes(String(transfer.status ?? "") as (typeof PENDING_TRANSFER_STATUSES)[number])) {
      continue;
    }

    if (
      !userMatchesTransferRecipient({
        userId: uid,
        userEmail,
        recipientUserId: transfer.recipient_user_id,
        recipientEmail: transfer.recipient_email,
      })
    ) {
      continue;
    }

    return transferAcceptPath({
      invite_token: transfer.invite_token,
      note: transfer.note,
      deal_id: dealId,
    });
  }

  // 2) Pending transfers on artwork addressed to this user (email or user id).
  const { data: transfers } = await reader
    .from("provenance_transfers")
    .select("id, status, invite_token, note, recipient_user_id, recipient_email")
    .eq("artwork_id", aid)
    .in("status", [...PENDING_TRANSFER_STATUSES])
    .order("created_at", { ascending: false })
    .limit(10);

  for (const row of transfers ?? []) {
    if (
      !userMatchesTransferRecipient({
        userId: uid,
        userEmail,
        recipientUserId: row.recipient_user_id,
        recipientEmail: row.recipient_email,
      })
    ) {
      continue;
    }

    return transferAcceptPath({
      invite_token: row.invite_token,
      note: row.note,
    });
  }

  // 3) Note-marker fallback for deal-linked transfers.
  for (const deal of deals ?? []) {
    const dealId = String(deal.id);
    const participantA = String(deal.participant_a_user_id ?? "");
    const participantB = String(deal.participant_b_user_id ?? "");
    if (uid !== participantA && uid !== participantB) continue;

    const marker = dealExecutionNoteMarker(dealId);
    const { data: transfer } = await reader
      .from("provenance_transfers")
      .select("id, status, invite_token, note, recipient_user_id, recipient_email")
      .eq("artwork_id", aid)
      .ilike("note", `%${marker}%`)
      .maybeSingle();

    if (!transfer?.id) continue;
    if (!PENDING_TRANSFER_STATUSES.includes(String(transfer.status ?? "") as (typeof PENDING_TRANSFER_STATUSES)[number])) {
      continue;
    }

    if (
      !userMatchesTransferRecipient({
        userId: uid,
        userEmail,
        recipientUserId: transfer.recipient_user_id,
        recipientEmail: transfer.recipient_email,
      })
    ) {
      continue;
    }

    return transferAcceptPath({
      invite_token: transfer.invite_token,
      note: transfer.note,
      deal_id: dealId,
    });
  }

  return null;
}

export type ResolveOwnershipClaimPathOptions = {
  /** Trusted reader (e.g. service role) for lifecycle rows hidden by RLS. */
  reader?: SupabaseClient;
  userEmail?: string | null;
};

export async function resolveOwnershipClaimPath(
  supabase: SupabaseClient,
  userId: string,
  artworkId: string,
  options?: ResolveOwnershipClaimPathOptions
): Promise<OwnershipClaimPath> {
  const uid = String(userId ?? "").trim();
  const aid = String(artworkId ?? "").trim();
  if (!uid || !aid) {
    return { kind: "blocked", reason: "Missing user or artwork." };
  }

  const reader = options?.reader ?? supabase;
  let userEmail = options?.userEmail ?? null;
  if (!userEmail && reader !== supabase) {
    userEmail = await resolveUserEmail(reader, uid);
  } else if (!userEmail) {
    userEmail = String(
      (await supabase.auth.getUser()).data.user?.email ?? ""
    )
      .trim()
      .toLowerCase() || null;
  }

  const { data: art, error: artError } = await reader
    .from("artworks")
    .select("id, verification_status")
    .eq("id", aid)
    .maybeSingle();

  if (artError || !art?.id) {
    return { kind: "blocked", reason: "Artwork not found." };
  }

  if (String(art.verification_status ?? "").toLowerCase() !== "verified") {
    return {
      kind: "blocked",
      reason: "This work must be verified before stewardship can be claimed.",
    };
  }

  const ledgerHolder = await fetchCanonicalHolderForArtwork(reader, aid);
  if (ledgerHolder === uid) {
    return { kind: "already_owner" };
  }

  const pendingDeal = await hasPendingDealAcquisitionTransfer(reader, uid, aid, userEmail);
  if (pendingDeal) {
    return {
      kind: "provenance_accept",
      accept_href: pendingDeal.accept_href,
      deal_id: pendingDeal.deal_id,
      message:
        "This acquisition is in progress. Accept the stewardship transfer to complete your purchase — manual claims are not required for deal-based acquisitions.",
    };
  }

  const manualEligible = await canUserSubmitManualOwnershipClaim(
    reader,
    supabase,
    uid,
    aid,
    userEmail
  );
  if (manualEligible) {
    return { kind: "manual_eligible" };
  }

  return {
    kind: "blocked",
    reason:
      "You are not eligible to claim ownership for this work. Off-platform purchases, gifts, and inheritance may submit a manual claim when no active deal transfer exists.",
  };
}

async function canUserSubmitManualOwnershipClaim(
  reader: SupabaseClient,
  authClient: SupabaseClient,
  userId: string,
  artworkId: string,
  userEmail: string | null
): Promise<boolean> {
  const blockedByDeal = await hasPendingDealAcquisitionTransfer(
    reader,
    userId,
    artworkId,
    userEmail
  );
  if (blockedByDeal) return false;

  const { data, error } = await authClient.rpc("user_can_submit_ownership_claim", {
    p_user_id: userId,
    p_artwork_id: artworkId,
  });

  if (error) {
    console.error("[ownership-claim-eligibility]", error.message);
    return false;
  }

  return Boolean(data);
}

export async function canUserSubmitOwnershipClaim(
  supabase: SupabaseClient,
  userId: string,
  artworkId: string,
  options?: ResolveOwnershipClaimPathOptions
): Promise<boolean> {
  const path = await resolveOwnershipClaimPath(supabase, userId, artworkId, options);
  return path.kind === "manual_eligible";
}
