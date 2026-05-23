import { HistoryBackButton } from "@/components/ui/HistoryBackButton";

type PageNavProps = {
  backHref?: string;
  className?: string;
};

export function PageNav({ backHref, className = "" }: PageNavProps) {
  if (!backHref) return null;

  return (
    <div className={`mb-10 flex flex-col gap-4 md:mb-12 ${className}`}>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <HistoryBackButton
          fallbackHref={backHref}
          className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-2 text-[11px] font-medium text-neutral-600 shadow-sm rrowm-ds-transition hover:border-black/[0.1] hover:bg-white hover:text-neutral-900"
        />
      </div>
    </div>
  );
}
