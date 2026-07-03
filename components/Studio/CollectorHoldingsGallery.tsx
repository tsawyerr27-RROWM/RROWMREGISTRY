"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { studioV2 } from "@/styles/studio-v2";

export type CollectorGalleryItem = {
  id: string;
  href: string;
  title: string;
  artist: string;
  registryId: string;
  imageUrl?: string | null;
  verificationStatus: string | null;
  isPending: boolean;
};

/** Visual collection browsing — thumbnail grid parallel to the ledger view. */
export function CollectorHoldingsGallery({
  items,
}: {
  items: CollectorGalleryItem[];
}) {
  const { t } = useLocalePreferences();

  return (
    <ul
      className={`studio-reveal-stagger ${studioV2.scope} mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4`}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          style={{ "--reveal-index": index } as CSSProperties}
        >
          <Link
            href={item.href}
            className="v2-motion-hover-subtle group block overflow-hidden rounded-xl border border-[var(--v2-border-strong)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[var(--v2-paper-sunk,#efe9df)]">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {t("collector.fallback.untitled")}
                  </span>
                </div>
              )}
              {item.isPending ? (
                <span className="absolute left-2 top-2 rounded-full bg-[var(--v2-amber-exception-dim)] px-2 py-0.5 v2-type-mono text-[8px] uppercase tracking-[0.16em] text-[var(--v2-ink)]">
                  {t("collector.works.transferPending")}
                </span>
              ) : null}
            </div>
            <div className="px-3 py-3">
              <h3 className="truncate font-serif text-[0.95rem] leading-tight text-[var(--v2-ink)]">
                {item.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-[var(--v2-ink-muted)]">
                {item.artist}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <ArtworkTrustBadge
                  verificationStatus={item.verificationStatus}
                  showTooltip={false}
                />
                <span className="truncate v2-type-mono text-[9px] tracking-[0.06em] text-[var(--v2-cool-grey)]">
                  {item.registryId}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
