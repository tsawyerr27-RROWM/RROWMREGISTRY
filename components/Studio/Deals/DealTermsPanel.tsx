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
    <div className={`${rrowmDealSurface.referencePanel} min-w-0`}>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-serif text-base font-normal tracking-tight text-neutral-950">
          Structured terms
        </h3>
        <p className="text-[11px] text-neutral-500">
          {dealStatusLabel(String(deal.status ?? ""))}
        </p>
      </div>

      <div className={`${rrowmSurface.l3} mt-4 p-4`}>
        <DealTermsRenderer deal={deal} />
      </div>
    </div>
  );
}
