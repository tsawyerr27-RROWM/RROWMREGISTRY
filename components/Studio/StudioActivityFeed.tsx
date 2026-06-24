"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import {
  VERIFICATION_EVENT_ACTIVITY_SELECT,
  verificationEventActivityLabel,
} from "@/lib/verification-events-schema";

export type StudioActivityFeedProps = {
  userId: string;
  /** Artworks currently in portfolio (owned) */
  portfolio: {
    id: string;
    registry_id: string | null;
    title: string | null;
  }[];
  /** Value event ids (pending sale linkage) — pinned first */
  priorityValueEventIds?: string[];
  /** Ownership event rows to pin (e.g. claimed) */
  priorityOwnershipEventIds?: string[];
};

type FeedRow = {
  id: string;
  kind: "value" | "ownership" | "verification" | "activity";
  created_at: string;
  label: string;
  detail: string;
  href?: string;
  pinned?: boolean;
};

export function StudioActivityFeed({
  userId,
  portfolio,
  priorityValueEventIds = [],
  priorityOwnershipEventIds = [],
}: StudioActivityFeedProps) {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const artworkIds = portfolio.map((p) => p.id);
  const registryByArtworkId: Record<string, string> = {};
  const titleByArtworkId: Record<string, string> = {};
  for (const p of portfolio) {
    if (p.registry_id) registryByArtworkId[p.id] = p.registry_id;
    titleByArtworkId[p.id] = (p.title || "").trim() || "Untitled work";
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      if (artworkIds.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [ve, oe, ver, act] = await Promise.all([
        supabase
          .from("value_events")
          .select("id, artwork_id, created_at, value_type, declared_value, currency")
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("ownership_events")
          .select(
            "id, artwork_id, created_at, transfer_type, verification_status"
          )
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("verification_events")
          .select(VERIFICATION_EVENT_ACTIVITY_SELECT)
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("activity_events")
          .select("id, created_at, type, message, artwork_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      if (cancelled) return;

      if (ve.error)
        console.warn("[StudioActivityFeed] value_events", summarizeRpcError(ve.error));
      if (oe.error)
        console.warn(
          "[StudioActivityFeed] ownership_events",
          summarizeRpcError(oe.error)
        );
      if (ver.error)
        console.warn(
          "[StudioActivityFeed] verification_events",
          summarizeRpcError(ver.error)
        );
      if (act.error)
        console.warn(
          "[StudioActivityFeed] activity_events",
          summarizeRpcError(act.error)
        );

      const merged: FeedRow[] = [];

      const priVe = new Set(priorityValueEventIds);
      const priOe = new Set(priorityOwnershipEventIds);

      for (const r of ve.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || "Work";
        const vt = String(r.value_type || "update").replaceAll("_", " ");
        const rawId = String(r.id ?? "");
        const isPinned = priVe.has(rawId);
        merged.push({
          id: `v-${r.id}`,
          kind: "value",
          created_at: String(r.created_at || ""),
          label: isPinned ? "Action · Sale pending transfer" : "Value recorded",
          detail: `${title} · ${vt}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
          pinned: isPinned,
        });
      }

      for (const r of oe.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || "Work";
        const tt = String(r.transfer_type || "transfer").replaceAll("_", " ");
        const vs = r.verification_status
          ? ` · ${String(r.verification_status)}`
          : "";
        const rawOeId = String(r.id ?? "");
        const claimed =
          String(r.verification_status || "").toLowerCase() === "claimed";
        const isPinned = priOe.has(rawOeId) || claimed;
        merged.push({
          id: `o-${r.id}`,
          kind: "ownership",
          created_at: String(r.created_at || ""),
          label: isPinned
            ? "Action · Ownership claim"
            : "Ownership update",
          detail: `${title} · ${tt}${vs}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
          pinned: isPinned,
        });
      }

      for (const r of ver.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || "Work";
        merged.push({
          id: `e-${r.id}`,
          kind: "verification",
          created_at: String(r.created_at || ""),
          label: "Verification",
          detail: `${title} · ${verificationEventActivityLabel(r)}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
        });
      }

      for (const r of act.data || []) {
        const aid = r.artwork_id ? String(r.artwork_id) : "";
        const reg = aid ? registryByArtworkId[aid] : "";
        merged.push({
          id: `a-${r.id}`,
          kind: "activity",
          created_at: String(r.created_at || ""),
          label: String(r.type || "Activity").replaceAll("_", " "),
          detail: String(r.message || ""),
          href: reg
            ? `/collector-studio/artwork/${encodeURIComponent(reg)}`
            : "/studio/collector",
        });
      }

      const byTime = (a: FeedRow, b: FeedRow) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      const pinned = merged.filter((m) => m.pinned).sort(byTime);
      const rest = merged.filter((m) => !m.pinned).sort(byTime);
      setRows([...pinned, ...rest].slice(0, 36));
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId, artworkIds.join("|"), priorityValueEventIds.join("|"), priorityOwnershipEventIds.join("|")]);

  if (artworkIds.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-neutral-500">
          Activity will appear here once you hold works in your collection.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-10 text-center text-sm text-neutral-500 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        Loading activity…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-neutral-500">No recent events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const inner = (
          <>
            <p className="text-sm font-medium text-neutral-700">
              {r.label}
            </p>
            <p className="mt-1.5 text-sm text-neutral-800 leading-snug">
              {r.detail}
            </p>
            <p className="mt-2 text-[11px] text-neutral-400 tabular-nums">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </>
        );

        return (
          <div
            key={r.id}
            className={`rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] ${
              r.pinned
                ? "border-l-[3px] border-l-neutral-400/60 pl-[calc(1rem-3px)]"
                : ""
            }`}
          >
            {r.href ? (
              <Link href={r.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 rounded-xl">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </div>
        );
      })}
    </div>
  );
}
