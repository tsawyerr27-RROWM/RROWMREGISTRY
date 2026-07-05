"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { studioV2 } from "@/styles/studio-v2";

export type ArchiveGalleryItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  imageUrl?: string | null;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
};

type Props = {
  items: ArchiveGalleryItem[];
  emptyLabel?: string;
};

function GalleryTile({ item }: { item: ArchiveGalleryItem }) {
  const { t } = useLocalePreferences();
  const surfaceClass =
    "v2-motion-hover-subtle group block overflow-hidden rounded-xl border border-[var(--v2-border-strong)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow,transform] duration-300 motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5";

  const inner = (
    <>
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--v2-paper-sunk,#efe9df)]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transform-none group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center">
            <span className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
              {t("collector.fallback.untitled")}
            </span>
          </div>
        )}
        {item.badge ? (
          <div className="absolute left-2 top-2">{item.badge}</div>
        ) : null}
      </div>
      <div className="px-3 py-3">
        <h3 className="truncate font-serif text-[0.95rem] leading-tight text-[var(--v2-ink)]">
          {item.title}
        </h3>
        {item.subtitle ? (
          <p className="mt-0.5 truncate text-xs text-[var(--v2-ink-muted)]">
            {item.subtitle}
          </p>
        ) : null}
        {item.meta ? (
          <p className="mt-2 truncate v2-type-mono text-[9px] tracking-[0.06em] text-[var(--v2-cool-grey)]">
            {item.meta}
          </p>
        ) : null}
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={surfaceClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={`${surfaceClass} w-full text-left`}>
      {inner}
    </button>
  );
}

/** Shared thumbnail grid for archive collections (works, holdings, certificates). */
export function ArchiveGalleryGrid({ items, emptyLabel }: Props) {
  const { t } = useLocalePreferences();

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--v2-border)] bg-white/85 px-6 py-10 text-center text-[15px] text-[var(--v2-ink-muted)]">
        {emptyLabel ?? t("studio.artworks.noMatches")}
      </p>
    );
  }

  return (
    <ul
      className={`studio-reveal-stagger ${studioV2.scope} grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4`}
    >
      {items.map((item, index) => (
        <li key={item.id} style={{ "--reveal-index": index } as CSSProperties}>
          <GalleryTile item={item} />
        </li>
      ))}
    </ul>
  );
}
