"use client";

import type { OwnershipTimelineEntry } from "@/lib/canonical-ownership-engine";
import { formatOwnershipTransferTypeLabel } from "@/lib/format-registry-labels";
import {
  ownershipEventCategory,
  registryEventCategoryMessageKey,
  registryEventSemanticEvent,
  registryEventStampClass,
} from "@/lib/registry-event-visual";
import { registryV2 } from "@/styles/registry-v2";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  entries: OwnershipTimelineEntry[];
  className?: string;
};

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OwnershipEventsChronology({ entries, className = "" }: Props) {
  const { t, region } = useLocalePreferences();

  if (!entries.length) {
    return (
      <p className={`v2-type-body text-sm ${className}`}>
        No ownership events recorded yet.
      </p>
    );
  }

  return (
    <ol className={`registry-lineage-chain list-none p-0 ${className}`} role="list">
      {entries.map((entry, index) => {
        const category = ownershipEventCategory(entry.transfer_type);
        const stampClass = registryEventStampClass(category);
        const motionClass = registryV2.motion.forEvent(
          registryEventSemanticEvent(category)
        );
        const transferLabel = entry.transfer_type
          ? formatOwnershipTransferTypeLabel(entry.transfer_type)
          : t("registry.event.ownership_transfer");
        const price =
          entry.sale_price != null && entry.sale_currency
            ? `${entry.sale_currency} ${entry.sale_price.toLocaleString(region.locale)}`
            : null;

        return (
          <li
            key={entry.id}
            className={`${registryV2.surface.lineageNode} ${motionClass}`}
            style={{ animationDelay: `${Math.min(index, 6) * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`${registryV2.type.stamp} ${stampClass}`}>
                {t(registryEventCategoryMessageKey(category))}
              </span>
              <time
                className={`${registryV2.type.monoId} shrink-0 tabular-nums`}
                dateTime={entry.created_at}
              >
                {formatDate(entry.created_at, region.locale)}
              </time>
            </div>

            <p className={`${registryV2.type.sectionTitle} mt-4 text-xl md:text-[1.35rem]`}>
              {transferLabel}
            </p>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className={registryV2.type.metaLabel}>Previous custody</dt>
                <dd className={`${registryV2.type.metaValue} mt-1.5 font-medium text-[var(--v2-ink)]`}>
                  {entry.from_label ?? "—"}
                </dd>
              </div>
              <div>
                <dt className={registryV2.type.metaLabel}>Current custody</dt>
                <dd className={`${registryV2.type.metaValue} mt-1.5 font-medium text-[var(--v2-ink)]`}>
                  {entry.to_label ?? "—"}
                </dd>
              </div>
              {price ? (
                <div>
                  <dt className={registryV2.type.metaLabel}>
                    {t("registry.event.valuation")}
                  </dt>
                  <dd className={`${registryV2.type.monoId} mt-1.5 text-[var(--v2-ink)]`}>
                    {price}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
