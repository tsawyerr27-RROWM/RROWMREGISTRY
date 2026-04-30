"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";

export type CollectorStudioActivityPreviewProps = {
  userId: string;
  portfolio: {
    id: string;
    registry_id: string | null;
    title: string | null;
  }[];
  priorityValueEventIds?: string[];
  priorityOwnershipEventIds?: string[];
  /** Max lines to show — default 8 */
  limit?: number;
};

type Line = {
  id: string;
  created_at: string;
  label: string;
  detail: string;
  href?: string;
  pinned?: boolean;
};

/** Meaningful events only; typographic list — no feed chrome. */
export function CollectorStudioActivityPreview({
  userId,
  portfolio,
  priorityValueEventIds = [],
  priorityOwnershipEventIds = [],
  limit = 8,
}: CollectorStudioActivityPreviewProps) {
  const [lines, setLines] = useState<Line[]>([]);
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
        setLines([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const [ve, oe, ver, act] = await Promise.all([
        supabase
          .from("value_events")
          .select("id, artwork_id, created_at, value_type")
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("ownership_events")
          .select("id, artwork_id, created_at, transfer_type, verification_status")
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("verification_events")
          .select("id, artwork_id, created_at, event_type, message")
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("activity_events")
          .select("id, created_at, type, message, artwork_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (cancelled) return;

      if (ve.error)
        console.warn("[CollectorStudioActivityPreview]", summarizeRpcError(ve.error));
      if (oe.error)
        console.warn("[CollectorStudioActivityPreview]", summarizeRpcError(oe.error));

      const merged: Line[] = [];
      const priVe = new Set(priorityValueEventIds);
      const priOe = new Set(priorityOwnershipEventIds);

      for (const r of ve.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || "Work";
        const vt = String(r.value_type || "update").replaceAll("_", " ");
        const rawId = String(r.id ?? "");
        merged.push({
          id: `v-${r.id}`,
          created_at: String(r.created_at || ""),
          label: priVe.has(rawId) ? "Sale — transfer pending" : "Value recorded",
          detail: `${title} · ${vt}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
          pinned: priVe.has(rawId),
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
        merged.push({
          id: `o-${r.id}`,
          created_at: String(r.created_at || ""),
          label:
            priOe.has(rawOeId) || claimed
              ? "Ownership claim"
              : "Ownership update",
          detail: `${title} · ${tt}${vs}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
          pinned: priOe.has(rawOeId) || claimed,
        });
      }

      for (const r of ver.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || "Work";
        merged.push({
          id: `e-${r.id}`,
          created_at: String(r.created_at || ""),
          label: "Verification",
          detail: `${title} · ${String((r as { message?: string }).message || (r as { event_type?: string }).event_type || "update")}`,
          href: reg ? `/collector-studio/artwork/${encodeURIComponent(reg)}` : undefined,
        });
      }

      for (const r of act.data || []) {
        const aid = r.artwork_id ? String(r.artwork_id) : "";
        const reg = aid ? registryByArtworkId[aid] : "";
        merged.push({
          id: `a-${r.id}`,
          created_at: String(r.created_at || ""),
          label: String(r.type || "Activity").replaceAll("_", " "),
          detail: String(r.message || ""),
          href: reg
            ? `/collector-studio/artwork/${encodeURIComponent(reg)}`
            : undefined,
        });
      }

      const byTime = (a: Line, b: Line) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      const pinned = merged.filter((m) => m.pinned).sort(byTime);
      const rest = merged.filter((m) => !m.pinned).sort(byTime);
      const out = [...pinned, ...rest].slice(0, limit);

      setLines(out);
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    userId,
    artworkIds.join("|"),
    priorityValueEventIds.join("|"),
    priorityOwnershipEventIds.join("|"),
    limit,
  ]);

  if (artworkIds.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-neutral-500">
        Activity will appear when you hold works.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading…</p>;
  }

  if (lines.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-neutral-500">
        No recent events across your collection.
      </p>
    );
  }

  return (
    <ul className="space-y-0 divide-y divide-neutral-900/10">
      {lines.map((r) => {
        const date = (() => {
          try {
            return new Date(r.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          } catch {
            return "";
          }
        })();

        const inner = (
          <>
            <p className="text-sm font-medium text-neutral-700">
              {r.label}
            </p>
            <p className="mt-2 text-[15px] leading-snug text-neutral-800">{r.detail}</p>
            {date ? (
              <p className="mt-2 text-xs tabular-nums text-neutral-400">{date}</p>
            ) : null}
          </>
        );

        return (
          <li key={r.id} className="py-6 first:pt-0">
            {r.href ? (
              <Link
                href={r.href}
                className="block outline-none transition hover:text-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-900/15"
              >
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
