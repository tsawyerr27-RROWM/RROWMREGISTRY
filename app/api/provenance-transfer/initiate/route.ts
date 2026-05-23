import { NextResponse } from "next/server";

import {
  buildProvenanceContinuationEmail,
  categoryLabelForEmail,
} from "@/lib/emails/provenance-continuation-invite";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { isProvenanceTransferType } from "@/lib/provenance-transfer";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function holderLabelForUserId(
  service: ReturnType<typeof createSupabaseServiceClient>,
  userId: string
): Promise<string> {
  return (async () => {
    const { data: cp } = await service
      .from("collector_profiles")
      .select("display_name, slug")
      .eq("user_id", userId)
      .maybeSingle();
    const dn = String(cp?.display_name || "").trim();
    if (dn) return dn;
    try {
      const { data, error } = await service.auth.admin.getUserById(userId);
      if (!error && data.user?.email) {
        const em = data.user.email.trim();
        const local = em.split("@")[0];
        if (local) return local;
      }
    } catch {
      /* ignore */
    }
    return "Recorded custodian";
  })();
}

/**
 * Current on-platform holder proposes a provenance continuation to a recipient email.
 */
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
  const rec = body as Record<string, unknown>;
  const artworkId =
    typeof rec.artwork_id === "string"
      ? rec.artwork_id.trim()
      : typeof rec.artworkId === "string"
        ? rec.artworkId.trim()
        : "";
  const recipientEmailRaw =
    typeof rec.recipient_email === "string"
      ? rec.recipient_email.trim()
      : typeof rec.recipientEmail === "string"
        ? rec.recipientEmail.trim()
        : "";
  const recipientEmail = recipientEmailRaw.toLowerCase();
  const transferTypeRaw =
    typeof rec.transfer_type === "string"
      ? rec.transfer_type.trim()
      : typeof rec.transferType === "string"
        ? rec.transferType.trim()
        : "";
  const note =
    typeof rec.note === "string" ? rec.note.trim().slice(0, 2000) : "";

  if (!/^[0-9a-f-]{36}$/i.test(artworkId)) {
    return NextResponse.json({ error: "Invalid artwork_id." }, { status: 400 });
  }
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json(
      { error: "Valid recipient email required." },
      { status: 400 }
    );
  }
  if (!isProvenanceTransferType(transferTypeRaw)) {
    return NextResponse.json({ error: "Invalid transfer_type." }, { status: 400 });
  }
  const transferType = transferTypeRaw;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = String(user.email || "").toLowerCase();
  if (recipientEmail === userEmail) {
    return NextResponse.json(
      { error: "Recipient must be a different address than your own." },
      { status: 400 }
    );
  }

  const service = createSupabaseServiceClient();

  const { data: art, error: artErr } = await service
    .from("artworks")
    .select("id, title, registry_id, verification_status, current_owner_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (artErr || !art?.id) {
    return NextResponse.json({ error: "Work not found." }, { status: 404 });
  }
  if (String(art.verification_status || "") !== "verified") {
    return NextResponse.json(
      { error: "Chronology continuation is available for verified catalogue records only." },
      { status: 400 }
    );
  }
  const ownerId = art.current_owner_id as string | null;
  if (!ownerId || ownerId !== user.id) {
    return NextResponse.json(
      {
        error:
          "Only the recorded on-platform custodian for this work may offer a continuation.",
      },
      { status: 403 }
    );
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();

  const { data: row, error: insErr } = await service
    .from("provenance_transfers")
    .insert({
      artwork_id: artworkId,
      from_user_id: user.id,
      recipient_email: recipientEmail,
      status: "pending_acceptance",
      transfer_type: transferType,
      note: note || null,
      invite_token: token,
      token_expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insErr) {
    const code = (insErr as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json(
        {
          error:
            "Another continuation invitation is already awaiting a response for this work. Wait for it to complete or expire.",
        },
        { status: 409 }
      );
    }
    console.error("[provenance-transfer/initiate]", insErr);
    return NextResponse.json(
      { error: "Could not prepare this continuation on file." },
      { status: 400 }
    );
  }

  const transferId = String(row?.id || "");
  const siteUrl = getSiteUrl();
  const acceptLink = `${siteUrl}/provenance/accept?token=${encodeURIComponent(token)}`;
  const title = String(art.title || "").trim() || "Untitled work";
  const registryId = String(art.registry_id || "").trim();

  const fromParticipantLabel = await holderLabelForUserId(service, user.id);

  const { subject, html, text } = buildProvenanceContinuationEmail({
    artworkTitle: title,
    registryId,
    recipientEmail,
    fromParticipantLabel,
    categoryLabel: categoryLabelForEmail(transferType),
    acceptLink,
  });

  let emailSent = false;
  const sent = await sendResendEmail({
    kind: "registry_notification",
    to: recipientEmail,
    subject,
    html,
    text,
  });

  if (sent.ok) {
    emailSent = true;
  } else {
    const hint = hintForResendDeliveryError(sent.message);
    console.error(
      "[provenance-transfer/initiate] Resend",
      sent.status,
      sent.message,
      hint
    );
  }

  return NextResponse.json({
    ok: true,
    transfer_id: transferId,
    emailSent,
    ...(emailSent
      ? {}
      : {
          emailNotice:
            "The invitation is on file, but email could not be delivered. Share the acceptance link with the invited participant, or contact support.",
        }),
  });
}
