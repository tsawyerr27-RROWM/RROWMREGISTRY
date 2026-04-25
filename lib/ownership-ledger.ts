import type { SupabaseClient } from "@supabase/supabase-js";
import { formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";

/** Latest ownership row for an artwork (provenence ledger source of truth). */
export async function getLatestOwnershipEvent(
  supabase: SupabaseClient,
  artworkId: string
) {
  return supabase
    .from("ownership_events")
    .select("*")
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
}

/** Human-readable party for timeline UI (platform UUID vs external name). */
export function formatOwnershipParty(
  ev: Record<string, unknown>,
  side: "from" | "to"
): string {
  const uidKey = side === "from" ? "from_user_id" : "to_user_id";
  const nameKey = side === "from" ? "from_name" : "to_name";
  const typeKey = side === "from" ? "from_type" : "to_type";

  const uid = ev[uidKey];
  const name = ev[nameKey];
  const typ = ev[typeKey];

  if (typeof name === "string" && name.trim()) {
    return typeof typ === "string" && typ.trim()
      ? `${name.trim()} (${typ.trim()})`
      : name.trim();
  }
  if (typeof uid === "string" && uid.length > 0) {
    return `${uid.slice(0, 6)}…`;
  }
  return side === "to" ? "Unknown owner" : "Unknown";
}

export type OwnershipVerificationStatus = "recorded" | "claimed" | "verified";

/** Ledger + holder: includes unassigned when no owner of record on the latest row. */
export type OwnershipSystemStatus =
  | OwnershipVerificationStatus
  | "unassigned";

export function normalizeVerificationStatus(
  v: unknown
): OwnershipVerificationStatus {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  if (s === "claimed" || s === "verified") return s;
  return "recorded";
}

/** True when this event row has an on-platform or named owner (to_*). */
export function isLatestOwnershipAssigned(
  ev: Record<string, unknown> | null | undefined
): boolean {
  if (!ev) return false;
  const uid = ev.to_user_id ?? ev.to_owner_id;
  if (typeof uid === "string" && uid.length > 0) return true;
  const name = ev.to_name;
  return typeof name === "string" && name.trim().length > 0;
}

/** Status of the current ownership chain end (latest event). */
export function latestOwnershipSystemStatus(
  latestEvent: Record<string, unknown> | null | undefined
): OwnershipSystemStatus {
  if (!latestEvent || !isLatestOwnershipAssigned(latestEvent)) {
    return "unassigned";
  }
  return normalizeVerificationStatus(latestEvent.verification_status);
}

/** Human-readable line for cards, headers, and timelines. */
export function ownershipStatusPublicLabel(
  status: OwnershipSystemStatus
): string {
  switch (status) {
    case "verified":
      return "Owned (verified)";
    case "claimed":
      return "Ownership claimed";
    case "unassigned":
      return "Unassigned";
    default:
      return "Ownership recorded";
  }
}

/** Lower rank = higher trust — for subtle grouping separators in timelines. */
export function ownershipVerificationTrustRank(
  status: OwnershipVerificationStatus
): number {
  if (status === "verified") return 0;
  if (status === "claimed") return 1;
  return 2;
}

/** Includes unassigned as lowest trust (weaker than recorded). */
export function ownershipSystemTrustRank(status: OwnershipSystemStatus): number {
  if (status === "unassigned") return 3;
  return ownershipVerificationTrustRank(status);
}

export type OwnershipLedgerViewerContext = {
  viewerUserId?: string | null;
  artworkArtistId?: string | null;
  artistDisplayName?: string | null;
};

/** Owner of record after this event — matches dashboard / spec (to_* only). */
export function formatOwnershipOwnerPrimary(
  ev: Record<string, unknown>,
  ctx?: OwnershipLedgerViewerContext
): string {
  const uidRaw = ev.to_user_id ?? ev.to_owner_id;
  const uid =
    typeof uidRaw === "string" && uidRaw.length > 0 ? uidRaw : null;

  if (uid) {
    if (ctx?.viewerUserId && uid === ctx.viewerUserId) return "You";
    if (
      ctx?.artworkArtistId &&
      uid === ctx.artworkArtistId &&
      ctx.artistDisplayName?.trim()
    ) {
      return ctx.artistDisplayName.trim();
    }
    const named = ev.to_name;
    if (typeof named === "string" && named.trim()) return named.trim();
    return `${uid.slice(0, 6)}…`;
  }

  const ext = ev.to_name;
  if (typeof ext === "string" && ext.trim()) return ext.trim();
  return "Unknown owner";
}

/**
 * Ownership verification chip for timelines and detail.
 * Verified: stronger weight, darker tone, subtle dot (no loud green).
 * Claimed: softer secondary. Recorded: minimal neutral.
 */
export function ownershipStatusBadge(
  status: OwnershipSystemStatus,
  surface: "dark" | "light"
): { label: string; className: string } {
  const label = ownershipStatusPublicLabel(status);
  if (surface === "light") {
    switch (status) {
      case "verified":
        return {
          label,
          className:
            "inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-tight text-neutral-800 before:content-[''] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-neutral-500 before:ring-1 before:ring-neutral-300/70",
        };
      case "claimed":
        return {
          label,
          className:
            "text-[11px] font-medium tracking-tight text-neutral-500",
        };
      case "unassigned":
        return {
          label,
          className:
            "text-[11px] font-normal tracking-tight text-neutral-400 italic",
        };
      default:
        return {
          label,
          className:
            "text-[11px] font-normal tracking-tight text-neutral-400",
        };
    }
  }
  switch (status) {
    case "verified":
      return {
        label,
        className:
          "inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-tight text-neutral-100 before:content-[''] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-white/40 before:ring-1 before:ring-white/25",
      };
    case "claimed":
      return {
        label,
        className: "text-[11px] font-medium tracking-tight text-white/55",
      };
    case "unassigned":
      return {
        label,
        className:
          "text-[11px] font-normal tracking-tight text-emerald-200/45 italic",
      };
    default:
      return {
        label,
        className:
          "text-[11px] font-normal tracking-tight text-emerald-200/40",
      };
  }
}

export function ownershipVerificationBadge(
  status: OwnershipVerificationStatus,
  surface: "dark" | "light"
): { label: string; className: string } {
  return ownershipStatusBadge(status, surface);
}

/** Secondary ledger line: transfer type · optional sale amount · year/date. */
export function formatOwnershipLedgerSubtitle(ev: Record<string, unknown>) {
  const transfer = formatOwnershipTransferTypeLabel(
    ev.transfer_type as string | null | undefined
  );
  const parts: string[] = [transfer];

  const price = ev.sale_price;
  const cur = ev.sale_currency;
  if (price != null && String(price).trim() !== "") {
    try {
      parts.push(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: typeof cur === "string" && cur.trim() ? cur : "USD",
          maximumFractionDigits: 0,
        }).format(Number(price))
      );
    } catch {
      parts.push(String(price));
    }
  }

  const dateSrc = ev.sale_date || ev.created_at;
  if (dateSrc) {
    const d = new Date(String(dateSrc));
    if (!Number.isNaN(d.getTime())) {
      parts.push(String(d.getFullYear()));
    }
  }

  return parts.join(" · ");
}
