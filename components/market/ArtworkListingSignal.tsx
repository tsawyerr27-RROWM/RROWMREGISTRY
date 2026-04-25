"use client";

import { useMemo, useState } from "react";
import { EnquiryModal } from "@/components/market/EnquiryModal";
import { marketplaceEnabled } from "@/lib/marketplace-flags";

export type ArtworkListingSignalProps = {
  listing: { id: string; price: number; currency: string } | null;
  artworkTitle: string;
  listedByLabel: string;
};

export function ArtworkListingSignal({
  listing,
  artworkTitle,
  listedByLabel,
}: ArtworkListingSignalProps) {
  const [open, setOpen] = useState(false);
  const priceLabel = useMemo(() => {
    if (!listing) return null;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(listing.currency || "USD"),
        maximumFractionDigits: 0,
      }).format(Number(listing.price));
    } catch {
      return `${listing.price} ${listing.currency || ""}`.trim();
    }
  }, [listing]);

  if (!marketplaceEnabled() || !listing) return null;

  return (
    <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white/60 px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="font-serif text-2xl font-normal tracking-tight text-neutral-950">
        {priceLabel}
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        Listed by <span className="font-medium text-neutral-800">{listedByLabel}</span>
      </p>
      <p className="mt-3 text-xs text-neutral-500">
        Preparation only — marketplace is feature-flagged off by default.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
        >
          Enquire
        </button>
        <button
          type="button"
          disabled
          className="rounded-2xl border border-black/[0.08] bg-white/70 px-4 py-2.5 text-xs font-medium text-neutral-500"
          title="Preparation only"
        >
          Request to acquire (soon)
        </button>
      </div>

      <EnquiryModal
        open={open}
        onClose={() => setOpen(false)}
        listingId={listing.id}
        artworkTitle={artworkTitle}
      />
    </div>
  );
}

