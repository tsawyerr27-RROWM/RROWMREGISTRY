import Link from "next/link";

import { narrativeLayout } from "@/styles/narrative-layout";
import { narrativeControl } from "@/styles/system-design";

/**
 * Closing band — same light surface rhythm as thesis / system flow.
 */
export function CTASection() {
  return (
    <section
      className="rrowm-atmo-section--blend"
      aria-labelledby="landing-cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rrowm-atmo-section__hairline"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} ${narrativeLayout.sectionPadYTight}`}>
        <h2
          id="landing-cta-heading"
          className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
        >
          Join a work’s continuity
        </h2>
        <p className="mt-8 max-w-[40rem] text-base leading-[1.86] text-neutral-600 md:text-lg md:leading-[1.8]">
          Artists and verified galleries register represented works; collectors can
          appear on the record when custody is filed. Everything stays on one
          chronology per piece.
        </p>
        <p className="mt-6 max-w-[40rem] text-sm leading-[1.82] text-neutral-600 md:text-base md:leading-[1.78]">
          For visibility rules and how the current record reads in public search, see
          the{" "}
          <Link
            href="/about"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition-[text-decoration-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:decoration-neutral-500 hover:text-neutral-950 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/12 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rrowm-base-soft)]"
          >
            registry overview
          </Link>
          .
        </p>

        <nav
          className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-4 text-sm font-medium md:mt-12"
          aria-label="Primary actions"
        >
          <Link
            href="/get-started"
            className={`${narrativeControl.ctaInline} pb-0.5`}
          >
            Take part →
          </Link>
          <Link href="/registry" className={narrativeControl.ctaMuted}>
            Browse registry
          </Link>
        </nav>
      </div>
    </section>
  );
}
