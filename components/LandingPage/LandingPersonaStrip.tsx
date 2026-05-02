"use client";

import { narrativeLayout } from "@/styles/narrative-layout";

/**
 * Homepage constituency band — enterprise “who we serve” rhythm.
 * Body copy matches AboutAudience.
 */
const PERSONAS = [
  {
    title: "Artists & studios",
    body:
      "establishing a lasting record for works they stand behind, with certificates and provenance tied to one identity.",
  },
  {
    title: "Galleries & estates",
    body:
      "maintaining continuity across exhibitions and transfers without fragmenting the story of each piece.",
  },
  {
    title: "Collectors & researchers",
    body:
      "using the public layer to verify what is on record before going further through authenticated channels.",
  },
] as const;

export function LandingPersonaStrip() {
  return (
    <section
      className="border-y border-neutral-200/55 bg-[var(--rrowm-base-soft)]/75"
      aria-labelledby="landing-personas-heading"
    >
      <div className={`${narrativeLayout.gutter} py-20 md:py-28`}>
        <div className="max-w-3xl">
          <h2
            id="landing-personas-heading"
            className="font-serif text-[clamp(1.65rem,2.8vw,2.35rem)] font-normal leading-[1.12] tracking-tight text-neutral-950"
          >
            Who it is for
          </h2>
        </div>

        <ul className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-0 md:gap-y-0 md:divide-x md:divide-neutral-200/60 md:pl-0">
          {PERSONAS.map((item, i) => (
            <li
              key={item.title}
              className={`text-sm leading-[1.82] text-neutral-600 md:text-base md:leading-[1.8] md:px-8 lg:px-10 ${i === 0 ? "md:pl-0" : ""} ${i === 2 ? "md:pr-0" : ""}`}
            >
              <p>
                <span className="font-medium text-neutral-900">{item.title}</span>{" "}
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
