import type { ReactNode } from "react";

type Props = {
  title: string;
  /** e.g. "3 April 2026" */
  updated: string;
  children: ReactNode;
};

/**
 * Editorial legal layout: single column anchored left (or right via prop), open field beside it.
 */
export function LegalPageShell({ title, updated, children }: Props) {
  return (
    <div className="ds-page-environment min-h-screen pt-20 pb-24 text-neutral-900 md:pt-24 md:pb-32">
      <div className="mx-auto w-full max-w-[min(100%,92rem)] px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="flex justify-start lg:justify-start">
          <article className="w-full max-w-[min(26rem,100%)] border-l border-black/[0.07] pl-5 sm:max-w-[min(28rem,100%)] sm:pl-6 md:max-w-[min(30rem,100%)] md:pl-8 lg:max-w-[min(32rem,42%)] lg:pl-9 xl:max-w-[min(34rem,38%)]">
            <header className="pb-8 md:pb-10">
              <h1 className="font-serif text-[1.35rem] font-normal leading-[1.18] tracking-tight text-neutral-950 md:text-[1.5rem] md:leading-[1.14]">
                {title}
              </h1>
              <p className="mt-4 text-xs text-neutral-500">
                Last updated: {updated}
              </p>
            </header>

            <div className="flex flex-col gap-10 border-t border-black/[0.05] pt-9 md:gap-11 md:pt-10">
              {children}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-base font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.05rem]">
      {children}
    </h2>
  );
}

export function LegalH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="pt-1 text-sm font-semibold text-neutral-500">
      {children}
    </h3>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12.5px] leading-[1.72] text-neutral-600 md:text-[13px] md:leading-[1.7]">
      {children}
    </p>
  );
}

export function LegalUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-4 text-[12.5px] leading-[1.65] text-neutral-600 marker:text-neutral-400 md:text-[13px] md:leading-[1.65]">
      {children}
    </ul>
  );
}
