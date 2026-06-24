import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCanonicalOwner,
  getOwnedArtworkIds as engineGetOwnedArtworkIds,
  getOwnershipTimeline,
  getTransferredArtworkIds as engineGetTransferredArtworkIds,
  type OwnershipTimelineEntry,
} from "@/lib/canonical-ownership-engine";

export type { OwnershipTimelineEntry };

export type OwnershipResolverOwner = {
  userId: string | null;
  source: "ledger" | "none";
};

export type PendingTransferRow = {
  provenance_transfer_id: string;
  artwork_id: string;
  deal_id: string | null;
  invite_token: string | null;
  status: string;
  recipient_user_id: string | null;
  recipient_email: string | null;
  from_user_id: string | null;
};

/** @deprecated Use getCanonicalOwner from canonical-ownership-engine */
export async function getCurrentOwner(
  service: SupabaseClient,
  artworkId: string
): Promise<OwnershipResolverOwner> {
  const owner = await getCanonicalOwner(service, artworkId);
  if (owner.userId) {
    return { userId: owner.userId, source: "ledger" };
  }
  return { userId: null, source: "none" };
}

export async function getOwnedArtworkIds(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  return engineGetOwnedArtworkIds(service, userId);
}

export async function getTransferredArtworkIds(
  service: SupabaseClient,
  userId: string
): Promise<string[]> {
  return engineGetTransferredArtworkIds(service, userId);
}

/** @deprecated Use getOwnershipTimeline from canonical-ownership-engine */
export async function buildOwnershipTimeline(
  service: SupabaseClient,
  artworkId: string
): Promise<OwnershipTimelineEntry[]> {
  return getOwnershipTimeline(service, artworkId);
}

function parseDealIdFromNotes(note: string | null | undefined): string | null {
  const match = String(note ?? "").match(/deal_id=([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

async function resolveUserEmailForId(
  service: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await service.auth.admin.getUserById(userId);
    if (error || !data.user?.email) return null;
    return String(data.user.email).trim().toLowerCase();
  } catch {
    return null;
  }
}

/** Pending acquisition transfers — workflow intent only, not ownership authority. */
export async function getPendingTransfers(
  service: SupabaseClient,
  userId: string
): Promise<PendingTransferRow[]> {
  const uid = String(userId ?? "").trim();
  if (!uid) return [];

  const { data: rpcRows, error: rpcError } = await service.rpc(
    "list_pending_acquisition_transfers",
    { p_user_id: uid }
  );

  if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
    return rpcRows.map((row) => ({
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
      recipient_user_id: uid,
      recipient_email: null,
      from_user_id: null,
    }));
  }

  if (rpcError) {
    console.warn("[ownership-resolver] list_pending_acquisition_transfers", rpcError.message);
  }

  const { data: transfers, error } = await service
    .from("provenance_transfers")
    .select(
      "id, artwork_id, status, invite_token, note, recipient_user_id, recipient_email, from_user_id"
    )
    .eq("status", "pending_acceptance")
    .or(`recipient_user_id.eq.${uid}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !transfers?.length) return [];

  const email = await resolveUserEmailForId(service, uid);

  return transfers
    .filter((row) => {
      const recipientUserId = String(row.recipient_user_id ?? "").trim();
      if (recipientUserId && recipientUserId === uid) return true;
      const recipientEmail = String(row.recipient_email ?? "").trim().toLowerCase();
      return Boolean(email && recipientEmail && recipientEmail === email);
    })
    .map((row) => ({
      provenance_transfer_id: String(row.id),
      artwork_id: String(row.artwork_id ?? ""),
      deal_id: parseDealIdFromNotes(String(row.note ?? "")),
      invite_token: row.invite_token ? String(row.invite_token) : null,
      status: String(row.status ?? "pending_acceptance"),
      recipient_user_id: row.recipient_user_id
        ? String(row.recipient_user_id)
        : null,
      recipient_email: row.recipient_email ? String(row.recipient_email) : null,
      from_user_id: row.from_user_id ? String(row.from_user_id) : null,
    }));
}
