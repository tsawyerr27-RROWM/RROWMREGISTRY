import type { ReactNode } from "react";

type Props = {
  summary: string;
  children: ReactNode;
  className?: string;
};

/**
 * Optional, native disclosure for interpretive or legal context. No tooltips, no JS chrome.
 */
export function ArchivalDisclosure({ summary, children, className = "" }: Props) {
  return (
    <details
      className={`rounded-lg border border-stone-200/55 bg-stone-50/25 ${className}`}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-[12px] font-medium text-stone-600 outline-none transition hover:bg-stone-50/80 hover:text-stone-800 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="font-mono text-[10px] text-stone-400" aria-hidden>
            ·
          </span>
          {summary}
        </span>
      </summary>
      <div className="border-t border-stone-200/50 px-4 pb-4 pt-1 text-[13px] leading-relaxed text-stone-600">
        {children}
      </div>
    </details>
  );
}
