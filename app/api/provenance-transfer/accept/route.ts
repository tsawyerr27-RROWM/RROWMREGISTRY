import { NextResponse } from "next/server";

import { issueCertificateForVerifiedArtwork } from "@/lib/issue-certificate";
import {
  buildProvenanceContinuationNotes,
  isProvenanceTransferType,
} from "@/lib/provenance-transfer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const token =
    typeof (body as Record<string, unknown>).token === "string"
      ? String((body as Record<string, unknown>).token).trim()
      : "";
  if (token.length < 32) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = String(user.email || "").trim().toLowerCase();
  if (!userEmail) {
    return NextResponse.json(
      { error: "Your account must have an email to accept." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();
  const { data: tr, error: trErr } = await service
    .from("provenance_transfers")
    .select("*")
    .eq("invite_token", token)
    .maybeSingle();

  if (trErr || !tr?.id) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  const status = String(tr.status || "").toLowerCase();
  if (status !== "pending_acceptance") {
    return NextResponse.json(
      {
        error:
          "This invitation is no longer open for confirmation.",
      },
      { status: 400 }
    );
  }

  const expMs = tr.token_expires_at
    ? new Date(String(tr.token_expires_at)).getTime()
    : null;
  if (
    expMs != null &&
    Number.isFinite(expMs) &&
    expMs < Date.now()
  ) {
    await service
      .from("provenance_transfers")
      .update({ status: "expired" })
      .eq("id", tr.id);
    return NextResponse.json({ error: "This invitation has expired." }, { status: 400 });
  }

  const recipient = String(tr.recipient_email || "").trim().toLowerCase();
  if (recipient !== userEmail) {
    return NextResponse.json(
      {
        error:
          "Sign in with the email address this continuation was sent to.",
      },
      { status: 403 }
    );
  }

  const artworkId = String(tr.artwork_id || "");
  const fromUserId = String(tr.from_user_id || "");
  if (fromUserId === user.id) {
    return NextResponse.json(
      { error: "You cannot confirm a chronology invitation you sent yourself." },
      { status: 400 }
    );
  }

  const transferTypeRaw = String(tr.transfer_type || "");
  if (!isProvenanceTransferType(transferTypeRaw)) {
    return NextResponse.json({ error: "Invalid transfer record." }, { status: 400 });
  }

  const notes = buildProvenanceContinuationNotes({
    transferId: String(tr.id),
    transferType: transferTypeRaw,
    participantNote: typeof tr.note === "string" ? tr.note : null,
  });

  const { data: oe, error: oeErr } = await service
    .from("ownership_events")
    .insert({
      artwork_id: artworkId,
      transfer_type: "ownership_transfer",
      to_user_id: user.id,
      created_by: user.id,
      notes,
      provenance_transfer_id: String(tr.id),
    })
    .select("id")
    .single();

  if (oeErr || !oe?.id) {
    console.error("[provenance-transfer/accept] ownership insert", oeErr);
    return NextResponse.json(
      { error: "Could not extend the chronology from this invitation." },
      { status: 400 }
    );
  }

  const oeId = String(oe.id);
  const nowIso = new Date().toISOString();

  const { error: upTrErr } = await service
    .from("provenance_transfers")
    .update({
      status: "completed",
      recipient_user_id: user.id,
      completed_at: nowIso,
      token_used_at: nowIso,
      ownership_event_id: oeId,
    })
    .eq("id", tr.id)
    .eq("status", "pending_acceptance");

  if (upTrErr) {
    console.error("[provenance-transfer/accept] transfer update", upTrErr);
  }

  try {
    await issueCertificateForVerifiedArtwork(artworkId);
  } catch {
    /* best-effort */
  }

  return NextResponse.json({
    ok: true,
    ownership_event_id: oeId,
    artwork_id: artworkId,
  });
}
