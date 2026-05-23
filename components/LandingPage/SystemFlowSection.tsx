"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  NARRATIVE_REVEAL_DURATION_S,
  NARRATIVE_REVEAL_Y,
  narrativeLayout,
} from "@/styles/narrative-layout";

const FLOW = [
  {
    step: "01",
    label: "Name the work",
    detail:
      "List it once. The piece gets a lasting identity that artists, galleries, and collectors can return to.",
    tone: "from-sky-100/70 to-slate-50/40",
    dot: "bg-sky-500/75",
  },
  {
    step: "02",
    label: "Attach what matters",
    detail:
      "Certificates, gallery association, custody notes: everything lands on the same entry instead of scattered files.",
    tone: "from-indigo-100/60 to-slate-50/35",
    dot: "bg-indigo-500/70",
  },
  {
    step: "03",
    label: "See the present clearly",
    detail:
      "What is public today is easy to read. What you keep private stays behind sign-in until you choose otherwise.",
    tone: "from-violet-100/55 to-slate-50/30",
    dot: "bg-violet-500/65",
  },
  {
    step: "04",
    label: "Let the thread grow",
    detail:
      "Each sale, transfer, or exhibition adds another line to the same story, in order, as years pass.",
    tone: "from-amber-100/55 to-stone-50/35",
    dot: "bg-amber-500/70",
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function SystemFlowSection() {
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section
      className="rrowm-atmo-section--cool"
      aria-labelledby="landing-system-flow-heading"
    >
      <motion.div
        className="rrowm-atmo-section__ambient pointer-events-none -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(186,210,240,0.35),transparent_68%)] blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="rrowm-atmo-section__ambient pointer-events-none -right-16 bottom-4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(214,228,248,0.32),transparent_70%)] blur-3xl"
        aria-hidden
        animate={reduce ? undefined : { x: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="rrowm-atmo-section__hairline pointer-events-none inset-x-0 top-0 h-px"
        aria-hidden
      />

      <div className={`${narrativeLayout.gutter} relative ${narrativeLayout.sectionPadYTight}`}>
        <motion.div
          className="max-w-3xl"
          initial={reduce ? false : { opacity: 0, y: NARRATIVE_REVEAL_Y }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px", amount: 0.3 }}
          transition={{ duration: reduce ? 0 : NARRATIVE_REVEAL_DURATION_S, ease }}
        >
          <h2
            id="landing-system-flow-heading"
            className="max-w-[min(100%,40rem)] font-serif text-[clamp(1.65rem,2.9vw,2.45rem)] font-normal leading-[1.14] tracking-tight text-neutral-950"
          >
            One thread for the work, from first listing to what comes next
          </h2>
          <p className="mt-6 max-w-[38rem] text-base leading-[1.84] text-neutral-600 md:text-[17px] md:leading-[1.8]">
            Whether you make art, show it, or live with it, the idea is simple: stop
            losing the paper trail. The public side stays readable; the private side
            stays yours.
          </p>
        </motion.div>

        <div className="relative mt-12 md:mt-14">
          <div
            className="pointer-events-none absolute left-[1.35rem] top-8 bottom-8 w-px bg-gradient-to-b from-sky-300/50 via-indigo-300/35 to-amber-300/45 md:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-[1.65rem] hidden h-px bg-gradient-to-r from-sky-300/45 via-indigo-300/35 to-amber-300/40 md:block lg:left-[6%] lg:right-[6%]"
            aria-hidden
          />

          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {FLOW.map((node, i) => {
              const dimmed = activeStep !== null && activeStep !== i;
              return (
                <motion.li
                  key={node.step}
                  initial={reduce ? false : { opacity: 0, y: NARRATIVE_REVEAL_Y }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8% 0px", amount: 0.15 }}
                  transition={{
                    duration: reduce ? 0 : NARRATIVE_REVEAL_DURATION_S,
                    delay: reduce ? 0 : 0.06 + i * 0.07,
                    ease,
                  }}
                  className="list-none"
                >
                  <motion.article
                    onMouseEnter={() => setActiveStep(i)}
                    onMouseLeave={() => setActiveStep(null)}
                    onFocus={() => setActiveStep(i)}
                    onBlur={() => setActiveStep(null)}
                    tabIndex={0}
                    animate={{
                      opacity: dimmed ? 0.72 : 1,
                      y: activeStep === i ? -2 : 0,
                    }}
                    transition={{ duration: 0.35, ease }}
                    className={`group relative h-full overflow-hidden rounded-[1.25rem] border border-[color:var(--rrowm-atmo-rim)] bg-gradient-to-br ${node.tone} p-5 shadow-[0_22px_64px_-48px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-6 md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_68%,rgb(55_63_78))] md:hover:shadow-[0_26px_70px_-46px_rgba(15,23,42,0.2)]`}
                  >
                    <motion.div
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
                      style={{
                        background: `radial-gradient(circle, color-mix(in srgb, var(--rrowm-atmo-panel-muted) 55%, transparent), transparent 70%)`,
                      }}
                      animate={
                        activeStep === i && !reduce
                          ? { scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }
                          : { scale: 1, opacity: 0.25 }
                      }
                      transition={{ duration: 2.4, repeat: activeStep === i ? Infinity : 0, ease: "easeInOut" }}
                      aria-hidden
                    />

                    <motion.div className="relative flex items-start gap-3.5">
                      <div className="relative flex shrink-0 flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white/80 ${node.dot} text-[11px] font-semibold tracking-wide text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]`}
                        >
                          {node.step}
                        </span>
                        <span
                          className={`mt-3 hidden h-2 w-2 rounded-full ${node.dot} lg:block`}
                          aria-hidden
                        />
                      </div>

                      <motion.div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-[15px] font-medium leading-snug text-neutral-950 md:text-base">
                          {node.label}
                        </h3>
                        <p className="mt-2.5 text-sm leading-[1.74] text-neutral-600">
                          {node.detail}
                        </p>
                      </motion.div>
                    </motion.div>
                  </motion.article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
