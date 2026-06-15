import { registryLedgerHref } from "@/lib/registry-nav";
import type { ArchivalTimelineEvent } from "@/lib/provenance-timeline";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";
import { getSiteUrl } from "@/lib/site-url";

export type ShareableMilestoneCategory =
  | "creation"
  | "verification"
  | "certificate"
  | "transfer"
  | "exhibition"
  | "amendment_resolved";

export type ProvenanceMilestoneSharePublicity = "full" | "restricted";

export type ProvenanceMilestoneShareContext = {
  registryId: string;
  eventId: string;
  artworkTitle: string;
  eventTitle: string;
  participantContext: string | null;
  eventDate: string;
  category: ShareableMilestoneCategory;
  publicity: ProvenanceMilestoneSharePublicity;
};

export type TranslateFn = (key: MessageKey) => string;

const SHAREABLE_KINDS: Record<
  ArchivalTimelineEvent["narrativeKind"],
  ShareableMilestoneCategory | null
> = {
  registration: "creation",
  institutional_confirmation: "verification",
  artist_confirmation: "verification",
  certificate: "certificate",
  transfer: "transfer",
  provenance_continuation: "transfer",
  evidence: "exhibition",
  dispute_resolved: "amendment_resolved",
  dispute_open: null,
  verification_other: null,
};

export function resolveShareableMilestone(
  event: ArchivalTimelineEvent
): ShareableMilestoneCategory | null {
  return SHAREABLE_KINDS[event.narrativeKind] ?? null;
}

export function isShareableProvenanceMilestone(
  event: ArchivalTimelineEvent
): boolean {
  return resolveShareableMilestone(event) !== null;
}

export function provenanceMilestoneSharePath(
  registryId: string,
  eventId: string
): string {
  const cleanRegistry = registryId.trim();
  const cleanEvent = eventId.trim();
  return `${registryLedgerHref(cleanRegistry)}#event-${cleanEvent}`;
}

export function buildProvenanceMilestoneShareUrl(
  registryId: string,
  eventId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  return `${base}${provenanceMilestoneSharePath(registryId, eventId)}`;
}

export function provenanceMilestoneShareOgImageUrl(
  registryId: string,
  eventId: string,
  origin?: string
): string {
  const base =
    origin?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : getSiteUrl());
  const params = new URLSearchParams({
    registry_id: registryId.trim(),
    event_id: eventId.trim(),
  });
  return `${base}/api/og/provenance-milestone?${params.toString()}`;
}

export function milestoneCategoryMessageKey(
  category: ShareableMilestoneCategory
): `provenance.share.category.${ShareableMilestoneCategory}` {
  return `provenance.share.category.${category}`;
}

export function buildProvenanceMilestoneShareTitle(
  context: ProvenanceMilestoneShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return t("provenance.share.titleRestricted");
  }
  return fillMessage(t("provenance.share.titleWithEvent"), {
    event: context.eventTitle,
  });
}

export function buildProvenanceMilestoneShareText(
  context: ProvenanceMilestoneShareContext,
  t: TranslateFn
): string {
  if (context.publicity === "restricted") {
    return fillMessage(t("provenance.share.textRestricted"), {
      registryId: context.registryId,
    });
  }
  const title = context.artworkTitle.trim() || "Work on file";
  return fillMessage(t("provenance.share.text"), { title });
}

export function buildProvenanceMilestoneShareContext(args: {
  registryId: string;
  artworkTitle: string;
  event: ArchivalTimelineEvent;
  eventTitle: string;
  participantContext: string | null;
  publicity?: ProvenanceMilestoneSharePublicity;
}): ProvenanceMilestoneShareContext | null {
  const category = resolveShareableMilestone(args.event);
  if (!category) return null;

  return {
    registryId: args.registryId.trim(),
    eventId: args.event.key,
    artworkTitle: args.artworkTitle,
    eventTitle: args.eventTitle,
    participantContext: args.participantContext,
    eventDate: args.event.dateIso,
    category,
    publicity: args.publicity ?? "full",
  };
}

export function categoryLabelEnglish(
  category: ShareableMilestoneCategory
): string {
  switch (category) {
    case "creation":
      return "Creation";
    case "verification":
      return "Verification";
    case "certificate":
      return "Certificate";
    case "transfer":
      return "Transfer";
    case "exhibition":
      return "Exhibition";
    case "amendment_resolved":
      return "Amendment resolved";
    default:
      return "Chronology";
  }
}
