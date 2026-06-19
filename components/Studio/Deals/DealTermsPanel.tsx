"use client";

import type { DealRow } from "@/lib/deals";
import { dealStatusLabel } from "@/lib/deal-status";
import { DealTermsRenderer } from "@/components/Studio/Deals/DealTermsRenderer";
import { rrowmDealSurface, rrowmSurface } from "@/styles/rrowm-theme";

type Props = {
  deal: DealRow;
};

export function DealTermsPanel({ deal }: Props) {
  return (
    <div className={`${rrowmDealSurface.sidePanel} flex min-h-0 flex-col`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-lg font-normal tracking-tight text-neutral-950">
          Current terms
        </h3>
        <p className="text-[12px] text-neutral-500">
          {dealStatusLabel(String(deal.status ?? ""))}
        </p>
      </div>

      <div className={`${rrowmSurface.l3} mt-5 min-h-0 flex-1 p-5`}>
        <DealTermsRenderer deal={deal} />
      </div>
    </div>
  );
}
