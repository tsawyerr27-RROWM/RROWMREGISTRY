"use client";

import type { DealRow } from "@/lib/deals";
import { dealStatusLabel } from "@/lib/deal-status";
import { DealTermsRenderer } from "@/components/Studio/Deals/DealTermsRenderer";
import { studioV2 } from "@/styles/studio-v2";

type Props = {
  deal: DealRow;
};

export function DealTermsPanel({ deal }: Props) {
  return (
    <div className={`${studioV2.surface.filingSheet} min-w-0 p-5 md:p-6`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className={studioV2.type.sectionTitle}>Structured terms</h3>
        <p className={studioV2.type.inboxItem}>
          {dealStatusLabel(String(deal.status ?? ""))}
        </p>
      </div>

      <div className={`${studioV2.surface.filingSheet} mt-4 p-4 md:p-5`}>
        <DealTermsRenderer deal={deal} />
      </div>
    </div>
  );
}
