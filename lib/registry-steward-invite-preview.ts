import type { SupabaseClient } from "@supabase/supabase-js";

import {
  registryStewardInviteStatusLabel,
  type RegistryStewardInviteKind,
  type RegistryStewardInviteStatus,
} from "@/lib/registry-steward-invite";
import {
  chronologyContinuationKindLabel,
  type ProvenanceTransferType,
} from "@/lib/provenance-transfer";

export type RegistryStewardInvitePreviewStatus =
  | "valid"
  | "expired"
  | "accepted"
  | "invalid";

export type RegistryStewardInvitePreview = {
  inviteId: string;
  inviteKind: RegistryStewardInviteKind;
  artworkTitle: string;
  registryId: string;
  inviterName: string;
  recipientEmail: string;
  expiresAt: string | null;
  targetHref: string;
  status: RegistryStewardInvitePreviewStatus;
  roleExplanation: string;
  custodyTransferLabel: string | null;
  artistNameOnFile: string | null;
};

export function maskStewardInviteEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "•••";
  return `${local.slice(0, 1)}•••@${domain}`;
}

export function buildRegistryStewardInviteTargetHref(
  kind: RegistryStewardInviteKind,
  token: string
): string {
  const encoded = encodeURIComponent(token);
  if (kind === "authorship") {
    return `/authenticate-record?token=${encoded}`;
  }
  return `/provenance/accept?token=${encoded}`;
}

function resolvePreviewStatus(args: {
  rowStatus: string;
  statusLabel: string;
  tokenExpiresAt: string | null;
}): RegistryStewardInvitePreviewStatus {
  const status = String(args.rowStatus || "").toLowerCase();
  if (status === "accepted" || args.statusLabel === "Accepted") return "accepted";
  if (status === "cancelled") return "invalid";
  if (
    status === "expired" ||
    args.statusLabel === "Expired" ||
    (status === "pending" &&
      args.tokenExpiresAt &&
      new Date(args.tokenExpiresAt).getTime() < Date.now())
  ) {
    return "expired";
  }
  if (status === "pending") return "valid";
  return "invalid";
}

function defaultRoleExplanation(kind: RegistryStewardInviteKind): string {
  if (kind === "authorship") {
    return "Authenticate authorship and deepen the documentary record. The work is already on file — this is continuity participation, not upload approval.";
  }
  return "Accept custody continuation so the chronology of this verified record can advance on the Registry ledger.";
}

async function resolveInviterName(
  service: SupabaseClient,
  invite: {
    invite_kind: string;
    created_by_user_id: string;
    source_id: string | null;
  },
  artwork: {
    filing_gallery_id: string | null;
    catalogue_artist_name: string | null;
  } | null
): Promise<string> {
  if (invite.invite_kind === "authorship" && artwork?.filing_gallery_id) {
    const { data: gallery } = await service
      .from("galleries")
      .select("name")
      .eq("id", artwork.filing_gallery_id)
      .maybeSingle();
    const name = gallery?.name?.trim();
    if (name) return name;
  }

  if (invite.invite_kind === "custody" && invite.source_id) {
    const { data: transfer } = await service
      .from("provenance_transfers")
      .select("from_user_id")
      .eq("id", invite.source_id)
      .maybeSingle();
    const fromUserId = transfer?.from_user_id
      ? String(transfer.from_user_id)
      : "";
    if (fromUserId) {
      const { data: cp } = await service
        .from("collector_profiles")
        .select("display_name")
        .eq("user_id", fromUserId)
        .maybeSingle();
      const label = cp?.display_name?.trim();
      if (label) return label;
    }
  }

  const { data: cp } = await service
    .from("collector_profiles")
    .select("display_name")
    .eq("user_id", invite.created_by_user_id)
    .maybeSingle();
  if (cp?.display_name?.trim()) return cp.display_name.trim();

  try {
    const { data, error } = await service.auth.admin.getUserById(
      invite.created_by_user_id
    );
    if (!error && data.user?.email) {
      const local = data.user.email.trim().split("@")[0];
      if (local) return local;
    }
  } catch {
    /* ignore */
  }

  return invite.invite_kind === "authorship"
    ? "Institution on file"
    : "Recorded custodian";
}

export async function loadRegistryStewardInvitePreview(
  service: SupabaseClient,
  token: string
): Promise<RegistryStewardInvitePreview | null> {
  const cleanToken = token.trim();
  if (!cleanToken || cleanToken.length < 32) return null;

  const { data: invite } = await service
    .from("registry_steward_invites")
    .select(
      "id, artwork_id, invite_kind, recipient_email, status, token_expires_at, custody_transfer_type, source_id, created_by_user_id, invite_token"
    )
    .eq("invite_token", cleanToken)
    .maybeSingle();

  if (invite?.id) {
    return buildPreviewFromIndexRow(service, invite, cleanToken);
  }

  return loadLegacyStewardInvitePreview(service, cleanToken);
}

async function buildPreviewFromIndexRow(
  service: SupabaseClient,
  invite: {
    id: string;
    artwork_id: string;
    invite_kind: string;
    recipient_email: string;
    status: string;
    token_expires_at: string | null;
    custody_transfer_type: string | null;
    source_id: string | null;
    created_by_user_id: string;
  },
  cleanToken: string
): Promise<RegistryStewardInvitePreview | null> {
  const kind = invite.invite_kind as RegistryStewardInviteKind;
  const { data: artwork } = await service
    .from("artworks")
    .select("id, title, registry_id, catalogue_artist_name, filing_gallery_id")
    .eq("id", invite.artwork_id)
    .maybeSingle();

  const statusLabel = registryStewardInviteStatusLabel({
    status: invite.status as RegistryStewardInviteStatus,
    token_expires_at: invite.token_expires_at,
  });
  const status = resolvePreviewStatus({
    rowStatus: invite.status,
    statusLabel,
    tokenExpiresAt: invite.token_expires_at,
  });

  const inviterName = await resolveInviterName(service, invite, artwork);
  const custodyTransferLabel =
    kind === "custody" && invite.custody_transfer_type
      ? chronologyContinuationKindLabel(
          invite.custody_transfer_type as ProvenanceTransferType
        )
      : null;

  return {
    inviteId: String(invite.id),
    inviteKind: kind,
    artworkTitle: String(artwork?.title || "").trim() || "Work on file",
    registryId: String(artwork?.registry_id || "").trim(),
    inviterName,
    recipientEmail: maskStewardInviteEmail(String(invite.recipient_email || "")),
    expiresAt: invite.token_expires_at,
    targetHref: buildRegistryStewardInviteTargetHref(kind, cleanToken),
    status,
    roleExplanation: defaultRoleExplanation(kind),
    custodyTransferLabel,
    artistNameOnFile:
      kind === "authorship"
        ? artwork?.catalogue_artist_name?.trim() || "Creative on file"
        : null,
  };
}

async function loadLegacyStewardInvitePreview(
  service: SupabaseClient,
  cleanToken: string
): Promise<RegistryStewardInvitePreview | null> {
  const { data: authInvite } = await service
    .from("artwork_authentication_invites")
    .select(
      "id, artwork_id, artist_email, status, token_expires_at, gallery_id, created_by_user_id"
    )
    .eq("invite_token", cleanToken)
    .maybeSingle();

  if (authInvite?.id) {
    const { data: artwork } = await service
      .from("artworks")
      .select("id, title, registry_id, catalogue_artist_name, filing_gallery_id")
      .eq("id", authInvite.artwork_id)
      .maybeSingle();

    const rowStatus = String(authInvite.status || "").toLowerCase();
    const statusLabel =
      rowStatus === "authenticated"
        ? "Accepted"
        : rowStatus === "expired"
          ? "Expired"
          : rowStatus === "cancelled"
            ? "Withdrawn"
            : authInvite.token_expires_at &&
                new Date(authInvite.token_expires_at).getTime() < Date.now()
              ? "Expired"
              : "Awaiting authentication";

    const status = resolvePreviewStatus({
      rowStatus: rowStatus === "authenticated" ? "accepted" : rowStatus,
      statusLabel,
      tokenExpiresAt: authInvite.token_expires_at,
    });

    const inviterName = await resolveInviterName(
      service,
      {
        invite_kind: "authorship",
        created_by_user_id: authInvite.created_by_user_id,
        source_id: null,
      },
      artwork
    );

    return {
      inviteId: String(authInvite.id),
      inviteKind: "authorship",
      artworkTitle: String(artwork?.title || "").trim() || "Work on file",
      registryId: String(artwork?.registry_id || "").trim(),
      inviterName,
      recipientEmail: maskStewardInviteEmail(String(authInvite.artist_email || "")),
      expiresAt: authInvite.token_expires_at,
      targetHref: buildRegistryStewardInviteTargetHref("authorship", cleanToken),
      status,
      roleExplanation: defaultRoleExplanation("authorship"),
      custodyTransferLabel: null,
      artistNameOnFile:
        artwork?.catalogue_artist_name?.trim() || "Creative on file",
    };
  }

  const { data: transfer } = await service
    .from("provenance_transfers")
    .select(
      "id, artwork_id, recipient_email, status, token_expires_at, transfer_type, from_user_id"
    )
    .eq("invite_token", cleanToken)
    .maybeSingle();

  if (!transfer?.id) return null;

  const { data: artwork } = await service
    .from("artworks")
    .select("id, title, registry_id, catalogue_artist_name, filing_gallery_id")
    .eq("id", transfer.artwork_id)
    .maybeSingle();

  const rowStatus = String(transfer.status || "").toLowerCase();
  const statusLabel =
    rowStatus === "accepted" || rowStatus === "completed"
      ? "Accepted"
      : rowStatus === "expired"
        ? "Expired"
        : rowStatus === "cancelled"
          ? "Withdrawn"
          : transfer.token_expires_at &&
              new Date(transfer.token_expires_at).getTime() < Date.now()
            ? "Expired"
            : "Awaiting acceptance";

  const status = resolvePreviewStatus({
    rowStatus: rowStatus === "accepted" || rowStatus === "completed" ? "accepted" : rowStatus,
    statusLabel,
    tokenExpiresAt: transfer.token_expires_at,
  });

  const inviterName = await resolveInviterName(
    service,
    {
      invite_kind: "custody",
      created_by_user_id: transfer.from_user_id,
      source_id: transfer.id,
    },
    artwork
  );

  const custodyTransferLabel = transfer.transfer_type
    ? chronologyContinuationKindLabel(transfer.transfer_type as ProvenanceTransferType)
    : null;

  return {
    inviteId: String(transfer.id),
    inviteKind: "custody",
    artworkTitle: String(artwork?.title || "").trim() || "Work on file",
    registryId: String(artwork?.registry_id || "").trim(),
    inviterName,
    recipientEmail: maskStewardInviteEmail(String(transfer.recipient_email || "")),
    expiresAt: transfer.token_expires_at,
    targetHref: buildRegistryStewardInviteTargetHref("custody", cleanToken),
    status,
    roleExplanation: defaultRoleExplanation("custody"),
    custodyTransferLabel,
    artistNameOnFile: null,
  };
}
