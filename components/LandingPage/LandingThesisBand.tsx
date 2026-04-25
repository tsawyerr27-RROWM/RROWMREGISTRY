"use client";

import { narrativeLayout } from "@/styles/narrative-layout";

/**
 * Context chapter — Quant-inspired “the world has changed / the system lags” rhythm,
 * adapted to registry infrastructure without hype.
 */
export function LandingThesisBand() {
  return (
    <section
      className="relative border-b border-neutral-200/45 bg-gradient-to-b from-[var(--rrowm-base-soft)] via-[var(--rrowm-base-mid)]/18 to-[var(--rrowm-base-soft)]"
      aria-labelledby="landing-context-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} py-16 md:py-24`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2
              id="landing-context-heading"
              className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
            >
              Provenance should not drift across disconnected files
            </h2>
            <p className="mt-8 max-w-[40rem] text-base leading-[1.86] text-neutral-600 md:text-lg md:leading-[1.8]">
              The registry makes authorship, provenance, and verification durable.
              Records do not depend on a single PDF, inbox thread, or claim — they
              bind certificates and events to one stable identity, with explicit
              rules for what is visible in public search and what remains private.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pt-1">
            <div className="grid gap-4 rounded-3xl border border-neutral-200/60 bg-white/60 p-7 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.22)] backdrop-blur-sm md:p-8">
              {[
                {
                  t: "Durable identity",
                  b: "One record per work — consistent across time and transfers.",
                },
                {
                  t: "Verification surface",
                  b: "Public entries show what is on record without exposing private details.",
                },
                {
                  t: "Policy clarity",
                  b: "Visibility is explicit: public, authenticated, or private — by design.",
                },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-neutral-200/55 bg-white/70 px-5 py-4">
                  <p className="text-sm font-medium text-neutral-900">{x.t}</p>
                  <p className="mt-2 text-sm leading-[1.7] text-neutral-600">{x.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

