import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createNotification,
  notificationMetadata,
} from "@/lib/notifications";
import {
  buildRegistryStewardInviteAcceptHref,
  normalizeInviteEmail,
} from "@/lib/registry-steward-invite";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

function workTitleLabel(title: string | null | undefined): string {
  const trimmed = String(title ?? "").trim();
  return trimmed || "this work";
}

async function resolveRecipientUserId(
  service: SupabaseClient,
  recipientEmail: string
): Promise<string | null> {
  const email = normalizeInviteEmail(recipientEmail);
  if (!email) return null;

  const { data, error } = await service.rpc("resolve_user_id_by_email", {
    p_email: email,
  });

  if (error) {
    console.error("[notification-hooks/steward-invites] resolve_user_id_by_email", error);
    return null;
  }

  const userId = String(data ?? "").trim();
  return userId || null;
}

async function notifyStewardInviteReceived(args: {
  type: "registry_authorship_invite_received" | "registry_custody_invite_received";
  title: string;
  body: string;
  recipientEmail: string;
  inviteId: string;
  inviteKind: "authorship" | "custody";
  inviteToken: string;
  artworkId: string;
  registryId: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const recipientUserId = await resolveRecipientUserId(
      service,
      args.recipientEmail
    );
    if (!recipientUserId) return;

    await createNotification(
      {
        recipientUserId,
        type: args.type,
        title: args.title,
        body: args.body,
        metadata: notificationMetadata({
          inviteId: args.inviteId,
          inviteKind: args.inviteKind,
          artworkId: args.artworkId,
          registryId: args.registryId ?? undefined,
          href: buildRegistryStewardInviteAcceptHref(args.inviteToken),
        }),
      },
      service
    );
  } catch (err) {
    console.error("[notifyStewardInviteReceived]", args.type, err);
  }
}

/** In-app notice when a registered user is invited to confirm authorship on a record. */
export async function notifyAuthorshipStewardInvite(args: {
  recipientEmail: string;
  inviteId: string;
  inviteToken: string;
  artworkId: string;
  artworkTitle: string;
  registryId: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  const label = workTitleLabel(args.artworkTitle);
  await notifyStewardInviteReceived({
    type: "registry_authorship_invite_received",
    title: "Stewardship invitation",
    body: `You were invited to confirm authorship for ${label}.`,
    recipientEmail: args.recipientEmail,
    inviteId: args.inviteId,
    inviteKind: "authorship",
    inviteToken: args.inviteToken,
    artworkId: args.artworkId,
    registryId: args.registryId,
    client: args.client,
  });
}

/** In-app notice when a registered user is invited to continue custody on a record. */
export async function notifyCustodyStewardInvite(args: {
  recipientEmail: string;
  inviteId: string;
  inviteToken: string;
  artworkId: string;
  artworkTitle: string;
  registryId: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  const label = workTitleLabel(args.artworkTitle);
  await notifyStewardInviteReceived({
    type: "registry_custody_invite_received",
    title: "Custody invitation",
    body: `You were invited to continue stewardship for ${label}.`,
    recipientEmail: args.recipientEmail,
    inviteId: args.inviteId,
    inviteKind: "custody",
    inviteToken: args.inviteToken,
    artworkId: args.artworkId,
    registryId: args.registryId,
    client: args.client,
  });
}
