"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  NARRATIVE_REVEAL_DURATION_S,
  NARRATIVE_REVEAL_Y,
  narrativeLayout,
} from "@/styles/narrative-layout";

const FLOW = [
  {
    label: "Artwork",
    detail: "The object enters the record",
  },
  {
    label: "Registry ID",
    detail: "A stable identity across time",
  },
  {
    label: "Certificate",
    detail: "Authenticity bound to the record",
  },
  {
    label: "Provenance",
    detail: "Chain of custody and history",
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function SystemFlowSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative border-b border-neutral-200/45 bg-gradient-to-b from-[var(--rrowm-base-soft)] via-[var(--rrowm-base-mid)]/18 to-[var(--rrowm-base-soft)]"
      aria-labelledby="landing-system-flow-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-200/70 to-transparent"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} py-16 md:py-24`}>
        <h2
          id="landing-system-flow-heading"
          className="max-w-[min(100%,46rem)] font-serif text-[clamp(1.6rem,2.8vw,2.35rem)] font-normal leading-[1.16] tracking-tight text-neutral-950"
        >
          A single record, maintained over time
        </h2>
        <p className="mt-8 max-w-[40rem] text-base leading-[1.86] text-neutral-600 md:text-lg md:leading-[1.8]">
          From object to durable registry identity, certificates and provenance
          events remain attached to the same record instead of drifting across
          disconnected files.
        </p>

        <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((node, i) => (
            <motion.article
              key={node.label}
              initial={reduce ? false : { opacity: 0, y: NARRATIVE_REVEAL_Y }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px", amount: 0.2 }}
              transition={{
                duration: reduce ? 0 : NARRATIVE_REVEAL_DURATION_S,
                delay: reduce ? 0 : i * 0.05,
                ease,
              }}
              className="rounded-2xl border border-neutral-200/55 bg-white/70 px-5 py-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.18)] backdrop-blur-sm md:px-6 md:py-6"
            >
              <h3 className="text-sm font-medium text-neutral-900 md:text-[15px]">
                {node.label}
              </h3>
              <p className="mt-2 text-sm leading-[1.72] text-neutral-600 md:leading-[1.75]">
                {node.detail}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
