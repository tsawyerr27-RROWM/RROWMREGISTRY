"use client";

import { narrativeLayout } from "@/styles/narrative-layout";

const ROLES = [
  {
    title: "Artist",
    why: "Register works once, issue certificates, declare practice, and build a public creative presence on The Field.",
    outcome: "Your authorship and studio activity stay tied to the same registry identity.",
  },
  {
    title: "Collector",
    why: "Hold verified ownership, manage private records in Studio, and open acquisition deals with clear counterparty context.",
    outcome: "Stewardship stays documented without turning your collection into marketing noise.",
  },
  {
    title: "Organisation",
    why: "Represent artists, verify records, publish opportunities, and file institutional activity on the chronology.",
    outcome: "Your gallery or institution speaks with documentary weight, not a generic profile page.",
  },
] as const;

export function LandingPersonaStrip() {
  return (
    <section
      className="rrowm-atmo-section--dusk"
      aria-labelledby="landing-personas-heading"
    >
      <div className={`${narrativeLayout.gutter} ${narrativeLayout.sectionPadYTight}`}>
        <div className="max-w-3xl">
          <h2
            id="landing-personas-heading"
            className="font-serif text-[clamp(1.65rem,2.8vw,2.35rem)] font-normal leading-[1.12] tracking-tight text-neutral-950"
          >
            Why each role uses RROWM
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-neutral-600 md:text-base">
            The same infrastructure serves different kinds of cultural participation.
            Each role gets a clear reason to show up.
          </p>
        </div>

        <ul className="mt-12 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {ROLES.map((role) => (
            <li
              key={role.title}
              className="rounded-[1.25rem] border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_78%,transparent)] p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-7"
            >
              <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
                {role.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.72] text-neutral-600">{role.why}</p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-500">{role.outcome}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
