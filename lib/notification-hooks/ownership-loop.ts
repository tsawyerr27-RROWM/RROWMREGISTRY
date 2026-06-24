import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createNotification,
  notificationMetadata,
} from "@/lib/notifications";
import { registryLedgerHref } from "@/lib/registry-nav";
import { createSupabaseServiceClient } from "@/lib/supabase-service-role";

type ArtworkContext = {
  artworkId: string;
  title: string;
  registryId: string | null;
};

async function loadArtworkContext(
  service: SupabaseClient,
  artworkId: string
): Promise<ArtworkContext | null> {
  const { data, error } = await service
    .from("artworks")
    .select("id, title, registry_id")
    .eq("id", artworkId)
    .maybeSingle();

  if (error || !data?.id) {
    console.error("[notification-hooks/ownership-loop] artwork", error);
    return null;
  }

  return {
    artworkId: String(data.id),
    title: String(data.title ?? "").trim() || "Untitled work",
    registryId: data.registry_id ? String(data.registry_id) : null,
  };
}

function artworkLabel(title: string): string {
  return title.trim() || "this work";
}

export async function notifyOwnershipClaimRequired(args: {
  recipientUserId: string;
  artworkId: string;
  dealId: string;
  acceptHref?: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const ctx = await loadArtworkContext(service, args.artworkId);
    if (!ctx) return;

    const label = artworkLabel(ctx.title);
    const href =
      args.acceptHref ??
      (ctx.registryId ? registryLedgerHref(ctx.registryId) : `/studio/deals?deal=${encodeURIComponent(args.dealId)}`);

    await createNotification(
      {
        recipientUserId: args.recipientUserId,
        type: "ownership_claim_required",
        title: "Confirm receipt",
        body: `Confirm receipt of ${label} to complete your acquisition on the registry.`,
        metadata: notificationMetadata({
          artworkId: ctx.artworkId,
          registryId: ctx.registryId ?? undefined,
          dealId: args.dealId,
          href,
        }),
      },
      service
    );
  } catch (err) {
    console.error("[notifyOwnershipClaimRequired]", err);
  }
}

export async function notifyOwnershipConfirmationRequired(args: {
  recipientUserId: string;
  artworkId: string;
  dealId: string;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const ctx = await loadArtworkContext(service, args.artworkId);
    if (!ctx) return;

    const label = artworkLabel(ctx.title);
    const href = `/studio/deals?deal=${encodeURIComponent(args.dealId)}`;

    await createNotification(
      {
        recipientUserId: args.recipientUserId,
        type: "ownership_confirmation_required",
        title: "Transfer initiated",
        body: `Acquisition transfer for ${label} is awaiting buyer confirmation. Review the deal record.`,
        metadata: notificationMetadata({
          artworkId: ctx.artworkId,
          registryId: ctx.registryId ?? undefined,
          dealId: args.dealId,
          href,
        }),
      },
      service
    );
  } catch (err) {
    console.error("[notifyOwnershipConfirmationRequired]", err);
  }
}

export async function notifyOwnershipTransferCompleted(args: {
  buyerUserId: string;
  sellerUserId: string;
  artworkId: string;
  dealId?: string | null;
  client?: SupabaseClient;
}): Promise<void> {
  try {
    const service = args.client ?? createSupabaseServiceClient();
    const ctx = await loadArtworkContext(service, args.artworkId);
    if (!ctx) return;

    const label = artworkLabel(ctx.title);
    const href = ctx.registryId ? registryLedgerHref(ctx.registryId) : null;
    const metadata = notificationMetadata({
      artworkId: ctx.artworkId,
      registryId: ctx.registryId ?? undefined,
      dealId: args.dealId ?? undefined,
      href: href ?? undefined,
    });

    await Promise.all([
      createNotification(
        {
          recipientUserId: args.buyerUserId,
          type: "ownership_transfer_completed",
          title: "Stewardship recorded",
          body: `${label} is now on file in your collector records.`,
          metadata: {
            ...metadata,
            href: href ?? `/studio/collector`,
          },
        },
        service
      ),
      createNotification(
        {
          recipientUserId: args.sellerUserId,
          type: "ownership_transfer_completed",
          title: "Transfer complete",
          body: `Stewardship transfer for ${label} is complete on the registry ledger.`,
          metadata,
        },
        service
      ),
    ]);
  } catch (err) {
    console.error("[notifyOwnershipTransferCompleted]", err);
  }
}
