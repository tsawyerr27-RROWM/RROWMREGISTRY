import Link from "next/link";
import { HistoryBackButton } from "@/components/ui/HistoryBackButton";
import { HistoryBreadcrumbs } from "@/components/ui/HistoryBreadcrumbs";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageNavProps = {
  backHref?: string;
  crumbs?: BreadcrumbItem[];
  className?: string;
};

export function PageNav({ backHref, crumbs = [], className = "" }: PageNavProps) {
  const hasCrumbs = crumbs.length > 0;

  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-12 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {backHref ? (
          <HistoryBackButton
            fallbackHref={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-2 text-[11px] font-medium text-neutral-600 shadow-sm rrowm-ds-transition hover:border-black/[0.1] hover:bg-white hover:text-neutral-900"
          />
        ) : null}

        <HistoryBreadcrumbs fallbackCrumbs={hasCrumbs ? crumbs : undefined} />
      </div>
    </div>
  );
}

