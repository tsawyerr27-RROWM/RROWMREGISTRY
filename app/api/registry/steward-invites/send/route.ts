import { NextResponse } from "next/server";

import { resolveRequestLocale } from "@/lib/request-locale";
import { guardRegistryMutation } from "@/lib/registry-action-security/guards";
import { resolveRegistryStewardInviteEligibility } from "@/lib/registry-steward-invite-eligibility";
import {
  isValidInviteEmail,
  normalizeInviteEmail,
  type RegistryStewardInviteKind,
} from "@/lib/registry-steward-invite";
import { sendRegistryStewardInvite } from "@/lib/registry-steward-invite-send";
import { isProvenanceTransferType } from "@/lib/provenance-transfer";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

function parseKind(value: unknown): RegistryStewardInviteKind | null {
  const kind = String(value ?? "").trim();
  return kind === "authorship" || kind === "custody" ? kind : null;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const lang = resolveRequestLocale(
    req.headers.get("accept-language"),
    url.searchParams.get("lang"),
    o.lang
  );

  const artworkId = String(o.artwork_id ?? o.artworkId ?? "").trim();
  const registryId = String(o.registry_id ?? o.registryId ?? "").trim();
  const kind = parseKind(o.kind ?? o.invite_kind);
  const recipientEmail = normalizeInviteEmail(
    String(o.recipient_email ?? o.recipientEmail ?? "")
  );
  const recipientName =
    typeof o.recipient_name === "string"
      ? o.recipient_name.trim().slice(0, 200)
      : typeof o.recipientName === "string"
        ? o.recipientName.trim().slice(0, 200)
        : null;
  const personalMessage =
    typeof o.message === "string" ? o.message.trim().slice(0, 2000) : null;
  const custodyTransferTypeRaw = String(
    o.custody_transfer_type ?? o.transfer_type ?? o.transferType ?? ""
  ).trim();

  if (!artworkId && !registryId) {
    return NextResponse.json(
      { error: "Missing artwork_id or registry_id." },
      { status: 400 }
    );
  }
  if (!kind) {
    return NextResponse.json({ error: "Invalid invite kind." }, { status: 400 });
  }
  if (!isValidInviteEmail(recipientEmail)) {
    return NextResponse.json(
      { error: "Valid recipient email required." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await guardRegistryMutation(req, {
    actionKey: "registry_steward_invite_send",
    subjectKey: user.id,
    maxAttempts: 20,
    windowSeconds: 3600,
  });
  if (blocked) return blocked;

  const service = createSupabaseServiceClient();
  const eligibility = await resolveRegistryStewardInviteEligibility(
    supabase,
    service,
    {
      artworkId: artworkId || undefined,
      registryId: registryId || undefined,
      userId: user.id,
    }
  );

  if (!eligibility || !eligibility.kinds.includes(kind)) {
    return NextResponse.json(
      { error: "You are not eligible to send this invitation for this record." },
      { status: 403 }
    );
  }

  const { data: artwork } = await service
    .from("artworks")
    .select(
      "id, title, registry_id, catalogue_artist_name, artist_id, verification_status, filing_gallery_id"
    )
    .eq("id", eligibility.artwork.id)
    .maybeSingle();

  if (!artwork?.id) {
    return NextResponse.json({ error: "Work not found." }, { status: 404 });
  }

  const userEmail = String(user.email || "").toLowerCase();
  if (recipientEmail === userEmail) {
    return NextResponse.json(
      { error: "Recipient must be a different address than your own." },
      { status: 400 }
    );
  }

  const result = await sendRegistryStewardInvite(service, {
    artwork,
    kind,
    recipientEmail,
    recipientName,
    personalMessage,
    custodyTransferType: isProvenanceTransferType(custodyTransferTypeRaw)
      ? custodyTransferTypeRaw
      : undefined,
    createdByUserId: user.id,
    replyToEmail: user.email,
    lang,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        duplicate: result.duplicate ?? false,
      },
      { status: result.status ?? 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    kind,
    invite_id: result.inviteId,
    source_table: result.sourceTable,
    source_id: result.sourceId,
    landing_url: result.landingUrl,
    emailSent: result.emailSent,
    ...(result.emailDeliveryError
      ? { emailDeliveryError: result.emailDeliveryError }
      : {}),
  });
}
