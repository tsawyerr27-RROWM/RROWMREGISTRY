"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    title: "Record",
    subtitle: "A unique registry identity for each work",
    dot: "bg-violet-500",
  },
  {
    title: "Verify",
    subtitle: "Cryptographic proof & immutable timestamps",
    dot: "bg-emerald-500",
  },
  {
    title: "Certify",
    subtitle: "Authenticity documents tied to the record",
    dot: "bg-sky-500",
  },
  {
    title: "Trace",
    subtitle: "Ownership & value history over time",
    dot: "bg-amber-500",
  },
] as const;

type Tone = "default" | "calm";

export function UseCaseJourney({ tone = "default" }: { tone?: Tone }) {
  const reduceMotion = useReducedMotion();
  const calm = tone === "calm";

  const stagger = calm ? 0.2 : 0.12;
  const delayChildren = calm ? 0.2 : 0.15;

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : stagger,
        delayChildren: reduceMotion ? 0 : delayChildren,
      },
    },
  };

  const containerInstant = {
    hidden: {},
    visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
  };

  const itemCalm = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemDefault = {
    hidden: { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const item = calm ? itemCalm : itemDefault;

  const itemInstant = {
    hidden: { opacity: 1, y: 0, x: 0 },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <div
      className={`relative mx-auto w-full max-w-md ${calm ? "lg:max-w-none" : ""}`}
    >
      <div className="relative">
        <div
          className={`absolute bottom-4 left-[11px] top-4 w-px bg-gradient-to-b from-violet-300/50 via-neutral-300/45 to-amber-300/45 ${calm ? "lg:hidden" : ""}`}
          aria-hidden
        />
        {calm ? (
          <div
            className="pointer-events-none absolute left-[5%] right-[5%] top-[15px] hidden h-px bg-gradient-to-r from-violet-300/45 via-neutral-300/45 to-amber-300/45 lg:block"
            aria-hidden
          />
        ) : null}

        <motion.ul
          className={`relative space-y-0 ${calm ? "lg:flex lg:justify-between lg:gap-2" : ""}`}
          variants={reduceMotion ? containerInstant : container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8% 0px", amount: 0.3 }}
        >
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={reduceMotion ? itemInstant : item}
              className={`group relative flex gap-5 pb-10 last:pb-0 ${calm ? "lg:flex-1 lg:flex-col lg:items-center lg:gap-0 lg:pb-0 lg:pt-14 lg:text-center" : ""}`}
            >
              <div
                className={`relative z-10 flex shrink-0 flex-col items-center pt-0.5 ${calm ? "lg:absolute lg:left-1/2 lg:top-[9px] lg:-translate-x-1/2 lg:pt-0" : ""}`}
              >
                {calm ? (
                  <span
                    className={`h-3 w-3 rounded-full ring-4 ring-white/90 ${step.dot} shadow-sm`}
                  />
                ) : (
                  <motion.span
                    className={`h-3 w-3 rounded-full ring-4 ring-white/90 ${step.dot} shadow-sm`}
                    whileHover={
                      reduceMotion ? undefined : { scale: 1.15 }
                    }
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                )}
              </div>
              <div
                className={`min-w-0 flex-1 pb-1 ${calm ? "lg:mt-9 lg:flex-none lg:px-1" : ""}`}
              >
                {calm ? (
                  <div className="pb-5 lg:pb-0">
                    <p className="font-semibold text-neutral-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600 lg:mt-2 lg:max-w-[11.5rem] lg:mx-auto">
                      {step.subtitle}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="liquid-glass-tile px-5 py-4 transition-[box-shadow,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-[0.96] group-hover:shadow-[0_18px_48px_-32px_rgba(15,23,42,0.14)]"
                  >
                    <p className="font-semibold text-neutral-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      {step.subtitle}
                    </p>
                  </motion.div>
                )}
              </div>
              {i < STEPS.length - 1 ? (
                <span className="sr-only">then</span>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
