"use client";

import { ArtworkTrustBadge } from "@/components/Registry/ArtworkTrustBadge";
import { ArchiveGalleryGrid } from "@/components/Studio/ArchiveGalleryGrid";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

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

/** Collector holdings gallery — maps holdings into shared `ArchiveGalleryGrid`. */
export function CollectorHoldingsGallery({
  items,
}: {
  items: CollectorGalleryItem[];
}) {
  const { t } = useLocalePreferences();

  return (
    <div className="mt-8">
      <ArchiveGalleryGrid
        items={items.map((item) => ({
          id: item.id,
          href: item.href,
          title: item.title,
          subtitle: item.artist,
          meta: item.registryId,
          imageUrl: item.imageUrl,
          badge: item.isPending ? (
            <span className="rounded-full bg-[var(--v2-amber-exception-dim)] px-2 py-0.5 v2-type-mono text-[8px] uppercase tracking-[0.16em] text-[var(--v2-ink)]">
              {t("collector.works.transferPending")}
            </span>
          ) : (
            <ArtworkTrustBadge
              verificationStatus={item.verificationStatus}
              showTooltip={false}
            />
          ),
        }))}
      />
    </div>
  );
}
