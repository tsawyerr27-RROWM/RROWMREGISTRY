import type { SupabaseClient } from "@supabase/supabase-js";

import { buildArtworkAuthenticationInvitationEmail } from "@/lib/emails/artwork-authentication-invitation";
import { buildProvenanceContinuationEmail } from "@/lib/emails/provenance-continuation-invite";
import {
  hintForResendDeliveryError,
  sendResendEmail,
} from "@/lib/emails/send-email";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invite-token";
import { logActivityEvent } from "@/lib/log-activity";
import type { AppLang } from "@/lib/request-locale";
import {
  buildRegistryStewardInviteLandingUrl,
  isValidInviteEmail,
  normalizeInviteEmail,
  type RegistryStewardInviteArtwork,
  type RegistryStewardInviteKind,
} from "@/lib/registry-steward-invite";
import { isProvenanceTransferType, type ProvenanceTransferType } from "@/lib/provenance-transfer";
import { categoryLabelForEmail } from "@/lib/emails/provenance-continuation-invite";
import {
  notifyAuthorshipStewardInvite,
  notifyCustodyStewardInvite,
} from "@/lib/notification-hooks/steward-invites";
import { getSiteUrl } from "@/lib/site-url";

export type SendRegistryStewardInviteInput = {
  artwork: RegistryStewardInviteArtwork;
  kind: RegistryStewardInviteKind;
  recipientEmail: string;
  recipientName?: string | null;
  personalMessage?: string | null;
  custodyTransferType?: ProvenanceTransferType;
  createdByUserId: string;
  replyToEmail?: string | null;
  lang?: AppLang;
};

export type SendRegistryStewardInviteResult =
  | {
      ok: true;
      inviteId: string;
      sourceTable: string;
      sourceId: string;
      inviteToken: string;
      landingUrl: string;
      emailSent: boolean;
      emailDeliveryError?: string;
      duplicate?: boolean;
    }
  | { ok: false; error: string; duplicate?: boolean; status?: number };

async function insertStewardInviteIndex(
  service: SupabaseClient,
  args: {
    artworkId: string;
    kind: RegistryStewardInviteKind;
    recipientEmail: string;
    recipientName: string | null;
    token: string;
    expiresAt: string;
    personalMessage: string | null;
    createdByUserId: string;
    filingGalleryId: string | null;
    custodyTransferType: ProvenanceTransferType | null;
    sourceTable: string;
    sourceId: string;
  }
): Promise<string | null> {
  const { data, error } = await service
    .from("registry_steward_invites")
    .insert({
      artwork_id: args.artworkId,
      invite_kind: args.kind,
      recipient_email: args.recipientEmail,
      recipient_name: args.recipientName,
      invite_token: args.token,
      personal_message: args.personalMessage,
      status: "pending",
      custody_transfer_type: args.custodyTransferType,
      token_expires_at: args.expiresAt,
      created_by_user_id: args.createdByUserId,
      filing_gallery_id: args.filingGalleryId,
      source_table: args.sourceTable,
      source_id: args.sourceId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[registry-steward-invite/index]", error);
    return null;
  }

  return String(data?.id || "") || null;
}

async function sendAuthorshipStewardInvite(
  service: SupabaseClient,
  input: SendRegistryStewardInviteInput
): Promise<SendRegistryStewardInviteResult> {
  const email = normalizeInviteEmail(input.recipientEmail);
  if (!isValidInviteEmail(email)) {
    return { ok: false, error: "Valid recipient email required.", status: 400 };
  }

  const galleryId = String(input.artwork.filing_gallery_id || "");
  if (!galleryId) {
    return {
      ok: false,
      error: "This record has no institution filing context for authorship invitations.",
      status: 400,
    };
  }

  const { data: pendingDup } = await service
    .from("artwork_authentication_invites")
    .select("id")
    .eq("artwork_id", input.artwork.id)
    .eq("status", "pending")
    .ilike("artist_email", email)
    .maybeSingle();

  if (pendingDup?.id) {
    return {
      ok: false,
      error: "A pending authorship invitation already exists for this email on this record.",
      duplicate: true,
      status: 409,
    };
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();
  const artistName =
    input.recipientName?.trim() ||
    input.artwork.catalogue_artist_name?.trim() ||
    null;

  const { data: row, error: insErr } = await service
    .from("artwork_authentication_invites")
    .insert({
      artwork_id: input.artwork.id,
      gallery_id: galleryId,
      artist_email: email,
      artist_name: artistName,
      invite_token: token,
      message: input.personalMessage,
      status: "pending",
      token_expires_at: expiresAt,
      created_by_user_id: input.createdByUserId,
    })
    .select("id")
    .single();

  if (insErr) {
    const code = String((insErr as { code?: string }).code ?? "");
    if (code === "23505") {
      return {
        ok: false,
        error: "A pending authorship invitation already exists for this email on this record.",
        duplicate: true,
        status: 409,
      };
    }
    return {
      ok: false,
      error: insErr.message || "Could not record authorship invitation.",
      status: 400,
    };
  }

  const sourceId = String(row?.id || "");
  const inviteId = await insertStewardInviteIndex(service, {
    artworkId: input.artwork.id,
    kind: "authorship",
    recipientEmail: email,
    recipientName: artistName,
    token,
    expiresAt,
    personalMessage: input.personalMessage ?? null,
    createdByUserId: input.createdByUserId,
    filingGalleryId: galleryId,
    custodyTransferType: null,
    sourceTable: "artwork_authentication_invites",
    sourceId,
  });

  const { data: gallery } = await service
    .from("galleries")
    .select("name")
    .eq("id", galleryId)
    .maybeSingle();

  const siteUrl = getSiteUrl();
  const landingUrl = buildRegistryStewardInviteLandingUrl("authorship", token, siteUrl);
  const artworkTitle = String(input.artwork.title || "").trim() || "Work on file";
  const registryId = String(input.artwork.registry_id || "");
  const galleryName = gallery?.name?.trim() || "Institution";
  const lang = input.lang ?? "en";

  const { subject, html, text } = buildArtworkAuthenticationInvitationEmail({
    galleryName,
    artworkTitle,
    registryId,
    inviteLink: landingUrl,
    recipientEmail: email,
    personalMessage: input.personalMessage,
    lang,
  });

  const sent = await sendResendEmail({
    kind: "invitation",
    to: email,
    subject,
    html,
    text,
    replyTo: input.replyToEmail ?? undefined,
  });

  await logActivityEvent({
    userId: input.createdByUserId,
    type: "artwork_auth_invite_sent",
    message: `Steward invitation (authorship) sent for ${artworkTitle}${registryId ? ` (${registryId})` : ""} to ${email}`,
    artworkId: input.artwork.id,
    metadata: {
      gallery_id: galleryId,
      gallery_name: galleryName,
      artist_email: email,
      registry_id: registryId || null,
      steward_invite_id: inviteId,
    },
  });

  void notifyAuthorshipStewardInvite({
    recipientEmail: email,
    inviteId: inviteId || sourceId,
    inviteToken: token,
    artworkId: input.artwork.id,
    artworkTitle,
    registryId: registryId || null,
    client: service,
  });

  return {
    ok: true,
    inviteId: inviteId || sourceId,
    sourceTable: "artwork_authentication_invites",
    sourceId,
    inviteToken: token,
    landingUrl,
    emailSent: sent.ok,
    ...(sent.ok
      ? {}
      : {
          emailDeliveryError:
            hintForResendDeliveryError(sent.message) ||
            "Invitation recorded on file; email could not be sent.",
        }),
  };
}

async function holderLabelForUserId(
  service: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: cp } = await service
    .from("collector_profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  const dn = String(cp?.display_name || "").trim();
  if (dn) return dn;

  try {
    const { data, error } = await service.auth.admin.getUserById(userId);
    if (!error && data.user?.email) {
      const local = data.user.email.trim().split("@")[0];
      if (local) return local;
    }
  } catch {
    /* ignore */
  }

  return "Recorded custodian";
}

async function sendCustodyStewardInvite(
  service: SupabaseClient,
  input: SendRegistryStewardInviteInput
): Promise<SendRegistryStewardInviteResult> {
  const email = normalizeInviteEmail(input.recipientEmail);
  if (!isValidInviteEmail(email)) {
    return { ok: false, error: "Valid recipient email required.", status: 400 };
  }

  const transferType = input.custodyTransferType;
  if (!transferType || !isProvenanceTransferType(transferType)) {
    return { ok: false, error: "Invalid custody transition type.", status: 400 };
  }

  if (String(input.artwork.verification_status || "") !== "verified") {
    return {
      ok: false,
      error: "Custody invitations require a verified catalogue record.",
      status: 400,
    };
  }

  if (
    !input.artwork.current_owner_id ||
    input.artwork.current_owner_id !== input.createdByUserId
  ) {
    return {
      ok: false,
      error:
        "Only the recorded on-platform custodian for this work may invite the next steward.",
      status: 403,
    };
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiryDate().toISOString();

  const { data: row, error: insErr } = await service
    .from("provenance_transfers")
    .insert({
      artwork_id: input.artwork.id,
      from_user_id: input.createdByUserId,
      recipient_email: email,
      status: "pending_acceptance",
      transfer_type: transferType,
      note: input.personalMessage || null,
      invite_token: token,
      token_expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insErr) {
    const code = String((insErr as { code?: string }).code ?? "");
    if (code === "23505") {
      return {
        ok: false,
        error:
          "Another custody invitation is already awaiting a response for this record.",
        duplicate: true,
        status: 409,
      };
    }
    return {
      ok: false,
      error: "Could not record custody invitation.",
      status: 400,
    };
  }

  const sourceId = String(row?.id || "");
  const inviteId = await insertStewardInviteIndex(service, {
    artworkId: input.artwork.id,
    kind: "custody",
    recipientEmail: email,
    recipientName: input.recipientName ?? null,
    token,
    expiresAt,
    personalMessage: input.personalMessage ?? null,
    createdByUserId: input.createdByUserId,
    filingGalleryId: input.artwork.filing_gallery_id,
    custodyTransferType: transferType,
    sourceTable: "provenance_transfers",
    sourceId,
  });

  const siteUrl = getSiteUrl();
  const landingUrl = buildRegistryStewardInviteLandingUrl("custody", token, siteUrl);
  const artworkTitle = String(input.artwork.title || "").trim() || "Work on file";
  const registryId = String(input.artwork.registry_id || "").trim();
  const fromParticipantLabel = await holderLabelForUserId(
    service,
    input.createdByUserId
  );
  const lang = input.lang ?? "en";

  const { subject, html, text } = buildProvenanceContinuationEmail({
    artworkTitle,
    registryId,
    recipientEmail: email,
    fromParticipantLabel,
    categoryLabel: categoryLabelForEmail(transferType),
    acceptLink: landingUrl,
  });

  const sent = await sendResendEmail({
    kind: "invitation",
    to: email,
    subject,
    html,
    text,
    replyTo: input.replyToEmail ?? undefined,
  });

  await logActivityEvent({
    userId: input.createdByUserId,
    type: "provenance_transfer_initiated",
    message: `Steward invitation (custody) sent for ${artworkTitle}${registryId ? ` (${registryId})` : ""} to ${email}`,
    artworkId: input.artwork.id,
    metadata: {
      registry_id: registryId || null,
      transfer_type: transferType,
      steward_invite_id: inviteId,
    },
  });

  void notifyCustodyStewardInvite({
    recipientEmail: email,
    inviteId: inviteId || sourceId,
    inviteToken: token,
    artworkId: input.artwork.id,
    artworkTitle,
    registryId: registryId || null,
    client: service,
  });

  return {
    ok: true,
    inviteId: inviteId || sourceId,
    sourceTable: "provenance_transfers",
    sourceId,
    inviteToken: token,
    landingUrl,
    emailSent: sent.ok,
    ...(sent.ok
      ? {}
      : {
          emailDeliveryError:
            hintForResendDeliveryError(sent.message) ||
            "Invitation recorded on file; email could not be sent.",
        }),
  };
}

export async function sendRegistryStewardInvite(
  service: SupabaseClient,
  input: SendRegistryStewardInviteInput
): Promise<SendRegistryStewardInviteResult> {
  if (input.kind === "authorship") {
    return sendAuthorshipStewardInvite(service, input);
  }
  return sendCustodyStewardInvite(service, input);
}
