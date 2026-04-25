import Link from "next/link";

import { narrativeLayout } from "@/styles/narrative-layout";

/**
 * Closing band — same light surface rhythm as thesis / system flow.
 */
export function CTASection() {
  return (
    <section
      className="relative border-y border-neutral-200/55 bg-gradient-to-b from-[var(--rrowm-base-soft)] via-[var(--rrowm-base-mid)]/18 to-[var(--rrowm-base-soft)]"
      aria-labelledby="landing-cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} py-16 md:py-24`}>
        <h2
          id="landing-cta-heading"
          className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
        >
          Begin with a record
        </h2>
        <p className="mt-8 max-w-[40rem] text-base leading-[1.86] text-neutral-600 md:text-lg md:leading-[1.8]">
          Artists and verified galleries can register works and bind certificates
          to the same registry identity.
        </p>
        <p className="mt-6 max-w-[40rem] text-sm leading-[1.82] text-neutral-600 md:text-base md:leading-[1.78]">
          For how the record is structured, what stays private, and what appears
          in public search, read the{" "}
          <Link
            href="/about"
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:decoration-neutral-500"
          >
            registry overview
          </Link>
          .
        </p>

        <nav
          className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-4 text-sm font-medium md:mt-12"
          aria-label="Primary actions"
        >
          <a
            href="/get-started"
            className="border-b border-neutral-900/20 pb-0.5 text-neutral-900 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/45"
          >
            Get started →
          </a>
          <a
            href="/registry"
            className="border-b border-transparent pb-0.5 text-neutral-600 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-500/35 hover:text-neutral-900"
          >
            Browse registry
          </a>
        </nav>
      </div>
    </section>
  );
}
