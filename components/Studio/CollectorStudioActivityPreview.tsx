"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CLAIM_OWNERSHIP_HREF } from "@/components/Studio/CollectorHoldingsEmptyState";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { translateActivityMessage } from "@/lib/activity-i18n";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import {
  translateRawVerificationStatus,
  translateTransferTypeLabel,
  translateValueEventType,
} from "@/lib/ownership-ledger-i18n";
import {
  semanticDotClass,
  type RegistrySemanticEvent,
} from "@/lib/registry-semantic-signals";
import { studioCollectorArtworkHref } from "@/lib/studio-nav";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import {
  VERIFICATION_EVENT_ACTIVITY_SELECT,
  verificationEventActivityLabel,
} from "@/lib/verification-events-schema";

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
  signal?: RegistrySemanticEvent;
};

/** Meaningful events only; typographic list — no feed chrome. */
export function CollectorStudioActivityPreview({
  userId,
  portfolio,
  priorityValueEventIds = [],
  priorityOwnershipEventIds = [],
  limit = 8,
}: CollectorStudioActivityPreviewProps) {
  const { t } = useLocalePreferences();
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  const artworkIds = portfolio.map((p) => p.id);
  const registryByArtworkId: Record<string, string> = {};
  const titleByArtworkId: Record<string, string> = {};
  for (const p of portfolio) {
    if (p.registry_id) registryByArtworkId[p.id] = p.registry_id;
    titleByArtworkId[p.id] =
      (p.title || "").trim() || t("collector.activity.untitledWork");
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
          .select(VERIFICATION_EVENT_ACTIVITY_SELECT)
          .in("artwork_id", artworkIds)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("activity_events")
          .select("id, created_at, type, message, artwork_id, metadata")
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
        const title = titleByArtworkId[aid] || t("collector.fallback.work");
        const kind = translateValueEventType(r.value_type, t);
        const rawId = String(r.id ?? "");
        merged.push({
          id: `v-${r.id}`,
          created_at: String(r.created_at || ""),
          label: priVe.has(rawId)
            ? t("collector.activity.saleTransferPending")
            : t("collector.activity.valueRecorded"),
          detail: fillMessage(t("collector.activity.detail"), { title, kind }),
          href: reg ? studioCollectorArtworkHref(reg) : undefined,
          pinned: priVe.has(rawId),
          signal: priVe.has(rawId) ? "sale" : undefined,
        });
      }

      for (const r of oe.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || t("collector.fallback.work");
        const kind = translateTransferTypeLabel(r.transfer_type, t);
        const rawOeId = String(r.id ?? "");
        const claimed =
          String(r.verification_status || "").toLowerCase() === "claimed";
        const status = r.verification_status
          ? translateRawVerificationStatus(String(r.verification_status), t)
          : "";
        merged.push({
          id: `o-${r.id}`,
          created_at: String(r.created_at || ""),
          label:
            priOe.has(rawOeId) || claimed
              ? t("collector.activity.ownershipClaim")
              : t("collector.activity.ownershipUpdate"),
          detail: status
            ? fillMessage(t("collector.activity.detailWithStatus"), {
                title,
                kind,
                status,
              })
            : fillMessage(t("collector.activity.detail"), { title, kind }),
          href: reg ? studioCollectorArtworkHref(reg) : undefined,
          pinned: priOe.has(rawOeId) || claimed,
          signal: priOe.has(rawOeId) || claimed ? "transfer" : undefined,
        });
      }

      for (const r of ver.data || []) {
        const aid = String(r.artwork_id || "");
        const reg = registryByArtworkId[aid];
        const title = titleByArtworkId[aid] || t("collector.fallback.work");
        const kind = verificationEventActivityLabel(r);
        merged.push({
          id: `e-${r.id}`,
          created_at: String(r.created_at || ""),
          label: t("collector.activity.verification"),
          detail: fillMessage(t("collector.activity.detail"), { title, kind }),
          href: reg ? studioCollectorArtworkHref(reg) : undefined,
        });
      }

      for (const r of act.data || []) {
        const aid = r.artwork_id ? String(r.artwork_id) : "";
        const reg = aid ? registryByArtworkId[aid] : "";
        merged.push({
          id: `a-${r.id}`,
          created_at: String(r.created_at || ""),
          label: translateActivityMessage(
            {
              type: r.type,
              message: r.message,
              metadata: (r as { metadata?: Record<string, unknown> }).metadata,
            },
            t
          ),
          detail: "",
          href: reg
            ? studioCollectorArtworkHref(reg)
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
    t,
  ]);

  if (artworkIds.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-neutral-500">
          {t("collector.activity.emptyHold")}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            href={CLAIM_OWNERSHIP_HREF}
            className="font-medium text-neutral-800 underline decoration-neutral-900/15 underline-offset-[4px] transition hover:decoration-neutral-900/40"
          >
            {t("collector.empty.claimOwnership")}
          </Link>
          <Link
            href={fieldExplorerRecordsHref()}
            className="text-neutral-500 underline decoration-neutral-900/10 underline-offset-[4px] transition hover:text-neutral-800 hover:decoration-neutral-900/30"
          >
            {t("collector.empty.browseRegistry")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="text-xs text-neutral-400">{t("collector.activity.loading")}</p>;
  }

  if (lines.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-neutral-500">
        {t("collector.activity.noEvents")}
      </p>
    );
  }

  const scrollClass =
    lines.length > 3
      ? "max-h-[14rem] space-y-3 overflow-y-auto overscroll-y-contain pr-1"
      : "space-y-3";

  return (
    <div className={scrollClass}>
      {lines.map((r) => {
        const when = (() => {
          try {
            return new Date(r.created_at).toLocaleString();
          } catch {
            return "";
          }
        })();

        const inner = (
          <>
            <p className="flex items-center gap-1.5 text-xs text-neutral-600">
              {r.pinned ? (
                <span className={semanticDotClass(r.signal ?? null)} aria-hidden />
              ) : null}
              <span className={r.pinned ? "font-medium text-neutral-800" : undefined}>
                {r.label}
              </span>
            </p>
            {r.detail ? (
              <p className="mt-1 text-xs leading-snug text-neutral-600">{r.detail}</p>
            ) : null}
            {when ? (
              <p className="mt-1 text-[10px] tabular-nums text-neutral-400">{when}</p>
            ) : null}
          </>
        );

        return r.href ? (
          <Link
            key={r.id}
            href={r.href}
            className="block outline-none transition hover:text-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-900/15"
          >
            {inner}
          </Link>
        ) : (
          <div key={r.id}>{inner}</div>
        );
      })}
    </div>
  );
}
