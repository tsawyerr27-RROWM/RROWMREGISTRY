import { fillMessage, type MessageKey } from "@/lib/locale-messages";

type Translate = (key: MessageKey) => string;

export type ActivityFeedItem = {
  id?: string;
  type?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  at?: string | null;
};

function registrySuffix(registryId: unknown): string {
  const id = String(registryId ?? "").trim();
  return id ? ` (${id})` : "";
}

function metaString(item: ActivityFeedItem, key: string): string {
  const meta = item.metadata;
  if (!meta || typeof meta !== "object") return "";
  const value = meta[key];
  return value == null ? "" : String(value).trim();
}

function titleFromLegacyMessage(message: string): string {
  const patterns = [
    /^Artwork registered: (.+)$/,
    /^Value updated: (.+)$/,
    /^Ownership confirmed: (.+)$/,
    /^Authenticated authorship: (.+?)(?: \([^)]+\))?$/,
    /^Confirmed representation: (.+?)(?: \([^)]+\))?$/,
    /^Accepted continuity transfer: (.+?)(?: \([^)]+\))?$/,
    /^Continuity transfer completed: (.+?)(?: \([^)]+\))?$/,
    /^Artwork verified: (.+?)(?: \([^)]+\))?$/,
    /^Certificate issued: (.+?)(?: \([^)]+\))?$/,
    /^Authentication invitation sent for (.+?)(?: \([^)]+\))? to .+$/,
    /^Continuity transfer initiated: (.+?)(?: \([^)]+\))? → .+$/,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function resolveTitle(item: ActivityFeedItem): string {
  const fromMeta = metaString(item, "title");
  if (fromMeta) return fromMeta;
  const message = String(item.message ?? "").trim();
  if (message) {
    const parsed = titleFromLegacyMessage(message);
    if (parsed) return parsed;
  }
  return "";
}

function resolveRegistrySuffix(item: ActivityFeedItem, message: string): string {
  const fromMeta = metaString(item, "registry_id");
  if (fromMeta) return registrySuffix(fromMeta);
  const match = message.match(/\(([^)]+)\)/);
  return match?.[1] ? registrySuffix(match[1]) : "";
}

function resolveEmail(item: ActivityFeedItem, message: string): string {
  const keys = ["email", "artist_email", "recipient_email"];
  for (const key of keys) {
    const value = metaString(item, key);
    if (value) return value;
  }
  const inviteMatch = message.match(/^Representation invitation sent to (.+)$/);
  if (inviteMatch?.[1]) return inviteMatch[1].trim();
  const deletionMatch = message.match(/^Account deletion requested for (.+)$/);
  if (deletionMatch?.[1]) return deletionMatch[1].trim();
  const authMatch = message.match(/^Authentication invitation sent for .+ to (.+)$/);
  if (authMatch?.[1]) return authMatch[1].trim();
  const transferMatch = message.match(/ → (.+)$/);
  if (transferMatch?.[1]) return transferMatch[1].trim();
  return "";
}

function resolveOnboardingParties(message: string): { artist: string; gallery: string } {
  const match = message.match(/^(.+) completed registry onboarding for (.+)\.$/);
  return {
    artist: match?.[1]?.trim() ?? "",
    gallery: match?.[2]?.trim() ?? "",
  };
}

export function translateActivityMessage(
  item: ActivityFeedItem,
  t: Translate
): string {
  const type = String(item.type ?? "").trim();
  const message = String(item.message ?? "").trim();
  const title = resolveTitle(item);
  const registry = resolveRegistrySuffix(item, message);

  switch (type) {
    case "artwork_registered":
      return fillMessage(t("studio.activity.artworkRegistered"), { title });
    case "value_added":
      return fillMessage(t("studio.activity.valueUpdated"), { title });
    case "ownership_confirmed":
      return fillMessage(t("studio.activity.ownershipConfirmed"), { title });
    case "ownership_claim_rejected":
      return t("studio.activity.ownershipClaimRejected");
    case "artwork_auth_invite_sent":
      return fillMessage(t("studio.activity.authInviteSent"), {
        title,
        registrySuffix: registry,
        email: resolveEmail(item, message),
      });
    case "artwork_authenticated":
      return fillMessage(t("studio.activity.authenticatedAuthorship"), {
        title,
        registrySuffix: registry,
      });
    case "representation_confirmed":
      return fillMessage(t("studio.activity.representationConfirmed"), {
        title,
        registrySuffix: registry,
      });
    case "provenance_transfer_initiated":
      return fillMessage(t("studio.activity.provenanceInitiated"), {
        title,
        registrySuffix: registry,
        recipient: resolveEmail(item, message),
      });
    case "provenance_transfer_accepted":
      return fillMessage(t("studio.activity.provenanceAccepted"), {
        title,
        registrySuffix: registry,
      });
    case "provenance_transfer_completed":
      return fillMessage(t("studio.activity.provenanceCompleted"), {
        title,
        registrySuffix: registry,
      });
    case "gallery_invite_sent":
      return fillMessage(t("studio.activity.galleryInviteSent"), {
        email: resolveEmail(item, message),
      });
    case "account_deletion_requested":
      return fillMessage(t("studio.activity.accountDeletionRequested"), {
        email: resolveEmail(item, message),
      });
    case "artwork_verified":
      return fillMessage(t("studio.activity.artworkVerified"), {
        title,
        registrySuffix: registry,
      });
    case "certificate_issued":
      return fillMessage(t("studio.activity.certificateIssued"), {
        title,
        registrySuffix: registry,
      });
    case "gallery_invite_artist_onboarded": {
      const parties = resolveOnboardingParties(message);
      return fillMessage(t("studio.activity.artistOnboarded"), {
        artist: parties.artist,
        gallery: parties.gallery,
      });
    }
    case "personal_archive_added":
      return fillMessage(t("studio.activity.personalArchiveAdded"), {
        title,
        registrySuffix: registry,
      });
    case "personal_archive_removed":
      return fillMessage(t("studio.activity.personalArchiveRemoved"), {
        title,
        registrySuffix: registry,
      });
    case "collector_ownership_declared":
      return fillMessage(t("studio.activity.collectorOwnershipDeclared"), {
        title,
        registrySuffix: registry,
      });
    case "gallery_invite_accepted":
      return t("studio.activity.galleryInviteAccepted");
    default:
      return message || t("studio.activity.unknown");
  }
}
