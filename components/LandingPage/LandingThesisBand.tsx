"use client";

import { narrativeLayout } from "@/styles/narrative-layout";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

/**
 * Context chapter — Quant-inspired “the world has changed / the system lags” rhythm,
 * adapted to registry infrastructure without hype.
 */
export function LandingThesisBand() {
  return (
    <section
      className="rrowm-atmo-section--warm"
      aria-labelledby="landing-context-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rrowm-atmo-section__hairline"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} py-16 md:py-24`}>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <InfoTooltip text="Artists, institutions, and collectors can each leave filings on the same chronology. The public catalogue shows what is on file; deeper material stays behind sign-in where it belongs." />
            <h2
              id="landing-context-heading"
              className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
            >
              Continuity belongs with the work, not scattered across files
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-1">
            <div className="grid gap-4 rounded-3xl border border-[color:var(--rrowm-atmo-rim)] bg-gradient-to-br from-[color-mix(in_srgb,var(--rrowm-atmo-panel)_88%,transparent)] via-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_82%,transparent)] to-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_78%,transparent)] p-7 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-8 md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_75%,rgb(55_48_43))] md:hover:bg-gradient-to-br md:from-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_90%,transparent)] md:via-[color-mix(in_srgb,var(--rrowm-atmo-panel)_86%,transparent)] md:to-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_80%,transparent)] md:hover:shadow-[0_28px_76px_-50px_rgba(15,23,42,0.2)]">
              {[
                {
                  t: "Current record",
                  b: "One catalogue entry per work: the listing you verify against today.",
                },
                {
                  t: "Chronology on file",
                  b: "Milestones accumulate in order; later filings sit alongside earlier ones.",
                },
                {
                  t: "Participant roles",
                  b: "Institutional association and collector stewardship appear where participants file them.",
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_90%,transparent)] px-5 py-4 transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_78%,rgb(55_48_43))] md:hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_88%,transparent)] md:hover:shadow-[0_14px_44px_-36px_rgba(15,23,42,0.12)]"
                >
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

