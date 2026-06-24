import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createNotification,
  notificationMetadata,
} from "@/lib/notifications";
import { registryLedgerHref } from "@/lib/registry-nav";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type ArtworkNotificationContext = {
  artworkId: string;
  title: string;
  registryId: string | null;
  artistUserId: string | null;
  filingGalleryId: string | null;
};

function artworkTitleLabel(title: string | null | undefined): string {
  const trimmed = String(title ?? "").trim();
  return trimmed || "this work";
}

function ledgerHref(registryId: string | null): string | undefined {
  if (!registryId?.trim()) return undefined;
  return registryLedgerHref(registryId.trim());
}

function artworkMetadata(
  context: ArtworkNotificationContext,
  extra?: { amendmentId?: string }
) {
  return notificationMetadata({
    artworkId: context.artworkId,
    registryId: context.registryId ?? undefined,
    href: ledgerHref(context.registryId),
    amendmentId: extra?.amendmentId,
  });
}

async function loadArtworkNotificationContext(
  service: SupabaseClient,
  artworkId: string
): Promise<ArtworkNotificationContext | null> {
  const { data, error } = await service
    .from("artworks")
    .select("id, title, registry_id, artist_id, filing_gallery_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (error || !data) {
    console.error("[notification-hooks/registry] artwork", error);
    return null;
  }

  return {
    artworkId: String(data.id),
    title: String(data.title ?? ""),
    registryId: data.registry_id ? String(data.registry_id) : null,
    artistUserId: data.artist_id ? String(data.artist_id) : null,
    filingGalleryId: data.filing_gallery_id
      ? String(data.filing_gallery_id)
      : null,
  };
}

async function loadGalleryStaffUserIds(
  service: SupabaseClient,
  galleryId: string,
  excludeUserId?: string
): Promise<string[]> {
  const { data, error } = await service
    .from("gallery_users")
    .select("user_id")
    .eq("gallery_id", galleryId);

  if (error) {
    console.error("[notification-hooks/registry] gallery_users", error);
    return [];
  }

  return (data ?? [])
    .map((row) => String(row.user_id ?? "").trim())
    .filter((userId) => userId && userId !== excludeUserId);
}

async function resolveGalleryIdForArtwork(
  service: SupabaseClient,
  context: ArtworkNotificationContext
): Promise<string | null> {
  if (context.filingGalleryId) return context.filingGalleryId;

  if (!context.artistUserId) return null;

  const { data: artist } = await service
    .from("artists")
    .select("gallery_id")
    .eq("id", context.artistUserId)
    .maybeSingle();

  return artist?.gallery_id ? String(artist.gallery_id) : null;
}

async function notifyUsers(
  service: SupabaseClient,
  recipientUserIds: string[],
  input: {
    type:
      | "registry_verification_approved"
      | "registry_certificate_issued"
      | "registry_amendment_requested"
      | "registry_transfer_recorded";
    title: string;
    body: string;
    metadata: ReturnType<typeof notificationMetadata>;
  }
): Promise<void> {
  const uniqueRecipients = [...new Set(recipientUserIds.filter(Boolean))];
  if (uniqueRecipients.length === 0) return;

  await Promise.all(
    uniqueRecipients.map((recipientUserId) =>
      createNotification(
        {
          recipientUserId,
          type: input.type,
          title: input.title,
          body: input.body,
          metadata: input.metadata,
        },
        service
      )
    )
  );
}

function registryRecipients(
  context: ArtworkNotificationContext,
  staffUserIds: string[]
): string[] {
  const recipients = new Set<string>();
  if (context.artistUserId) recipients.add(context.artistUserId);
  for (const staffId of staffUserIds) recipients.add(staffId);
  return [...recipients];
}

/** Notify the creative and filing organisation when record verification is established. */
export async function notifyRegistryVerificationApproved(args: {
  artworkId: string;
  client?: SupabaseClient;
  excludeUserId?: string;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const context = await loadArtworkNotificationContext(service, args.artworkId);
    if (!context) return;

    const staffIds = context.filingGalleryId
      ? await loadGalleryStaffUserIds(
          service,
          context.filingGalleryId,
          args.excludeUserId
        )
      : [];

    const recipients = registryRecipients(context, staffIds);
    if (recipients.length === 0) return;

    const label = artworkTitleLabel(context.title);
    await notifyUsers(service, recipients, {
      type: "registry_verification_approved",
      title: "Record verification on file",
      body: `${label} has been verified on the Registry ledger.`,
      metadata: artworkMetadata(context),
    });
  } catch (err) {
    console.error("[notifyRegistryVerificationApproved]", err);
  }
}

/** Notify the creative and filing organisation when a certificate is first issued. */
export async function notifyRegistryCertificateIssued(args: {
  artworkId: string;
  client?: SupabaseClient;
  excludeUserId?: string;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const context = await loadArtworkNotificationContext(service, args.artworkId);
    if (!context) return;

    const staffIds = context.filingGalleryId
      ? await loadGalleryStaffUserIds(
          service,
          context.filingGalleryId,
          args.excludeUserId
        )
      : [];

    const recipients = registryRecipients(context, staffIds);
    if (recipients.length === 0) return;

    const label = artworkTitleLabel(context.title);
    await notifyUsers(service, recipients, {
      type: "registry_certificate_issued",
      title: "Certificate on file",
      body: `A registry certificate has been issued for ${label}.`,
      metadata: artworkMetadata(context),
    });
  } catch (err) {
    console.error("[notifyRegistryCertificateIssued]", err);
  }
}

/** Notify the counterpart when an amendment request is filed. */
export async function notifyRegistryAmendmentRequested(args: {
  artworkId: string;
  amendmentId: string;
  requesterUserId: string;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const context = await loadArtworkNotificationContext(service, args.artworkId);
    if (!context) return;

    const galleryId = await resolveGalleryIdForArtwork(service, context);
    const label = artworkTitleLabel(context.title);
    const metadata = artworkMetadata(context, {
      amendmentId: args.amendmentId,
    });

    const artistRequested =
      context.artistUserId && args.requesterUserId === context.artistUserId;

    if (artistRequested && galleryId) {
      const staffIds = await loadGalleryStaffUserIds(
        service,
        galleryId,
        args.requesterUserId
      );
      await notifyUsers(service, staffIds, {
        type: "registry_amendment_requested",
        title: "Amendment requested",
        body: `A catalogue amendment has been requested for ${label}.`,
        metadata,
      });
      return;
    }

    if (context.artistUserId && context.artistUserId !== args.requesterUserId) {
      await notifyUsers(service, [context.artistUserId], {
        type: "registry_amendment_requested",
        title: "Amendment requested",
        body: `Your institution has requested a catalogue amendment for ${label}.`,
        metadata,
      });
    }
  } catch (err) {
    console.error("[notifyRegistryAmendmentRequested]", err);
  }
}

/** Notify participants when custody continuity is recorded on the ledger. */
export async function notifyRegistryTransferRecorded(args: {
  artworkId: string;
  fromUserId?: string | null;
  toUserId?: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const context = await loadArtworkNotificationContext(service, args.artworkId);
    if (!context) return;

    const label = artworkTitleLabel(context.title);
    const metadata = artworkMetadata(context);
    const recipients = new Set<string>();

    if (args.fromUserId) recipients.add(args.fromUserId);
    if (args.toUserId) recipients.add(args.toUserId);
    if (context.artistUserId) recipients.add(context.artistUserId);

    if (context.filingGalleryId) {
      const staffIds = await loadGalleryStaffUserIds(
        service,
        context.filingGalleryId
      );
      for (const staffId of staffIds) recipients.add(staffId);
    }

    await notifyUsers(service, [...recipients], {
      type: "registry_transfer_recorded",
      title: "Custody transfer recorded",
      body: `A custody transfer for ${label} is now on file in the provenance ledger.`,
      metadata,
    });
  } catch (err) {
    console.error("[notifyRegistryTransferRecorded]", err);
  }
}
