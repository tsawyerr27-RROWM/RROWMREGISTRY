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
import { logActivityEvent } from "@/lib/log-activity";
import { isProvenanceTransferType } from "@/lib/provenance-transfer";
import { buildRegistryStewardInvitePublicUrl } from "@/lib/registry-steward-invite";
import { isCurrentOwner } from "@/lib/canonical-ownership-engine";
import { getSiteUrl } from "@/lib/site-url";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
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
  // Security: this is a free-text human note. Legitimate deal-linked transfers
  // are created by /api/deals/[id]/execution with a machine note — never here —
  // so any deal marker in user input is an injection attempt. Neutralise the
  // exact tokens the accept-side parser keys on (deal_id=<uuid>, deal_execution)
  // so a note can never forge a deal linkage. Defence-in-depth alongside the
  // artwork/participant check in the accept route.
  const note = (typeof rec.note === "string" ? rec.note.trim().slice(0, 2000) : "")
    .replace(/deal_id\s*=\s*[0-9a-f-]{0,40}/gi, "[removed]")
    .replace(/deal_execution/gi, "[removed]");

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

  const blocked = await guardRegistryMutation(req, {
    actionKey: "provenance_initiate",
    subjectKey: user.id,
    maxAttempts: 15,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

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
    .select("id, title, registry_id, verification_status")
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
  if (!(await isCurrentOwner(service, user.id, artworkId))) {
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
  const acceptLink = buildRegistryStewardInvitePublicUrl(token, siteUrl);
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

  await logActivityEvent({
    userId: user.id,
    type: "provenance_transfer_initiated",
    message: `Continuity transfer initiated: ${title}${registryId ? ` (${registryId})` : ""} → ${recipientEmail}`,
    artworkId,
    metadata: {
      registry_id: registryId || null,
      transfer_type: transferType,
      recipient_email: recipientEmail,
      transfer_id: transferId,
    },
  });

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
