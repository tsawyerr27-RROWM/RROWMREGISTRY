import Link from "next/link";

import { narrativeLayout } from "@/styles/narrative-layout";
import { narrativeControl } from "@/styles/system-design";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

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
        <InfoTooltip text="Artists and verified galleries register represented works; collectors can appear on the record when custody is filed. Everything stays on one chronology per piece. For visibility rules and how the current record reads in public search, see the registry overview." />
        <h2
          id="landing-cta-heading"
          className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
        >
          Join a work&#8217;s continuity
        </h2>

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
