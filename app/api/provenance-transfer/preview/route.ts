import { NextResponse } from "next/server";

import { maskArtistInviteEmail } from "@/lib/mask-email";
import {
  type ProvenanceContinuationPreview,
  isProvenanceTransferType,
  chronologyContinuationKindLabel,
  PROVENANCE_REGISTRY_DISCLAIMER,
} from "@/lib/provenance-transfer";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function empty(): ProvenanceContinuationPreview {
  return {
    valid: false,
    expired: false,
    completed: false,
    cancelled: false,
    artworkTitle: "",
    registryId: "",
    holderLabel: "",
    transferTypeLabel: "",
    maskedRecipientEmail: "",
    disclaimer: PROVENANCE_REGISTRY_DISCLAIMER,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = String(url.searchParams.get("token") || "").trim();
  if (token.length < 32) {
    return NextResponse.json(empty(), { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data: tr, error } = await service
    .from("provenance_transfers")
    .select(
      "id, status, artwork_id, from_user_id, recipient_email, transfer_type, token_expires_at, token_used_at"
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error) {
    console.error("[provenance-transfer/preview]", error);
    return NextResponse.json(empty(), { status: 500 });
  }
  if (!tr?.id) {
    return NextResponse.json(empty(), { status: 200 });
  }

  const status = String(tr.status || "").toLowerCase();

  const expMs = tr.token_expires_at
    ? new Date(String(tr.token_expires_at)).getTime()
    : null;
  const expired =
    status === "pending_acceptance" &&
    expMs != null &&
    Number.isFinite(expMs) &&
    expMs < Date.now();

  const completed = status === "completed";
  const cancelled = status === "cancelled";

  const valid =
    status === "pending_acceptance" && !expired && !completed && !cancelled;

  const { data: art } = await service
    .from("artworks")
    .select("title, registry_id")
    .eq("id", tr.artwork_id as string)
    .maybeSingle();

  let holderLabel = "Recorded custodian";
  const fromUid = String(tr.from_user_id || "");
  if (fromUid) {
    const { data: cp } = await service
      .from("collector_profiles")
      .select("display_name")
      .eq("user_id", fromUid)
      .maybeSingle();
    const dn = String(cp?.display_name || "").trim();
    if (dn) holderLabel = dn;
  }

  const tt = String(tr.transfer_type || "");
  const transferTypeLabel = isProvenanceTransferType(tt)
    ? chronologyContinuationKindLabel(tt)
    : "Recorded transition";

  const payload: ProvenanceContinuationPreview = {
    valid,
    expired,
    completed,
    cancelled,
    artworkTitle: String(art?.title || "").trim() || "Untitled work",
    registryId: String(art?.registry_id || "").trim(),
    holderLabel,
    transferTypeLabel,
    maskedRecipientEmail: maskArtistInviteEmail(String(tr.recipient_email || "")),
    disclaimer: PROVENANCE_REGISTRY_DISCLAIMER,
  };

  return NextResponse.json(payload, { status: 200 });
}
