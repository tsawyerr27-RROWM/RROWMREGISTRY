import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  /** Active search query, if any */
  searchQuery: string;
  headline: string;
  lede: ReactNode;
  /** Trust / policy note below lede */
  trustNote: ReactNode;
};

export function RegistryExplorerHero({
  searchQuery,
  headline,
  lede,
  trustNote,
}: Props) {
  const trimmedQ = searchQuery.trim();
  const hasSearch = Boolean(trimmedQ);

  return (
    <section className="relative mt-2 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-[#f8faf9] via-white to-emerald-50/35 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-emerald-400/12 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-teal-300/12 blur-[78px]"
        aria-hidden
      />
      <div className="relative max-w-3xl p-8 lg:p-12 xl:p-14">
        <h1 className="font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {headline}
        </h1>

        <div className="mt-8 text-[15px] leading-[1.7] text-neutral-600">{lede}</div>

        {trustNote ? (
          <div className="mt-6 text-[13px] leading-[1.65] text-neutral-500">{trustNote}</div>
        ) : null}

        {hasSearch ? (
          <p className="mt-6 text-[12px] text-neutral-500">
            Searching:{" "}
            <span className="font-medium text-neutral-700">“{trimmedQ}”</span> ·{" "}
            <Link
              href="/registry"
              className="font-medium text-emerald-900 underline decoration-emerald-900/20 underline-offset-[3px] hover:decoration-emerald-900/45"
            >
              Clear search
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
