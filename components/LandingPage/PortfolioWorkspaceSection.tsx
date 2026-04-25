"use client";

import { FullBleed } from "@/components/LandingPage/FullBleed";
import { control } from "@/styles/system-design";

/** Workspace snapshot — calm, institutional (no “dashboard confetti”). */
function PortfolioCommandDeck() {
  return (
    <div
      className="pointer-events-none relative mx-auto w-full max-w-md select-none lg:mx-0"
      aria-hidden
    >
      <div className="absolute -inset-7 rounded-[2rem] bg-gradient-to-br from-neutral-200/55 via-white/25 to-transparent blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/65 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.22)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-900/[0.06] bg-white/70 px-5 py-4">
          <span className="text-sm font-medium text-neutral-700">Workspace</span>
          <span className="text-[11px] font-medium tracking-wide text-neutral-500">
            Registry-linked
          </span>
        </div>

        <div className="space-y-4 p-6 md:p-7">
          <div className="grid gap-3">
            {[
              { k: "Records", v: "Stable identities, media, and status" },
              { k: "Certificates", v: "Bound to the same registry record" },
              { k: "Transfers", v: "Events appended over time" },
              { k: "Visibility", v: "Public layer + authenticated access" },
            ].map((row) => (
              <div
                key={row.k}
                className="grid gap-1 rounded-2xl border border-neutral-200/55 bg-white/70 px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-medium text-neutral-900">{row.k}</p>
                  <span className="h-px flex-1 bg-neutral-200/60" aria-hidden />
                </div>
                <p className="text-sm leading-[1.7] text-neutral-600">{row.v}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200/55 bg-neutral-50/70 px-5 py-4">
            <p className="text-sm font-medium text-neutral-800">
              Status
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-neutral-600">
              Records remain consistent across public search and private documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioWorkspaceSection() {
  return (
    <section className="pb-28 pt-[4.5rem] md:pb-36 md:pt-24">
      <FullBleed className="relative overflow-hidden bg-gradient-to-b from-[var(--rrowm-base-soft)] via-[var(--rrowm-base-mid)]/22 to-[var(--rrowm-base-soft)] py-[4.5rem] md:py-24">
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-[min(26rem,66vh)] w-[min(52vw,24rem)] -translate-y-1/2 rounded-full bg-gradient-to-bl from-sky-200/22 via-violet-200/14 to-transparent blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
          <div className="lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-x-20 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-x-28">
            <header className="max-w-lg lg:sticky lg:top-28">
              <h2 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-normal leading-[1.08] tracking-tight text-neutral-950">
                Holdings, organised
              </h2>
              <p className="mt-10 text-sm leading-[1.8] text-neutral-600 md:text-base md:leading-[1.76]">
                Beyond public discovery: a workspace where your records stay
                organized, current, and ready for the next transaction or
                exhibition — always anchored to the same registry identity.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                <a href="/get-started" className={`${control.secondary} w-fit`}>
                  Open workspace
                </a>
                <a href="/registry" className={`${control.quietLink} w-fit`}>
                  View public layer
                </a>
              </div>
            </header>

            <div className="relative mt-16 flex justify-center lg:mt-6 lg:justify-end lg:pr-4">
              <PortfolioCommandDeck />
            </div>
          </div>
        </div>
      </FullBleed>
    </section>
  );
}
