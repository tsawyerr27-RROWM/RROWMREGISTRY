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
      "File represented works and certificates so the public catalogue and chronology stay aligned with what you stand behind.",
  },
  {
    title: "Galleries & estates",
    body:
      "Keep institutional association and participant confirmations on record as exhibitions and custody change.",
  },
  {
    title: "Collectors & researchers",
    body:
      "Read the current record in public search, then go deeper through sign-in when a work invites authenticated access.",
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
            Who it is for
          </h2>
        </div>

        <ul className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-0 md:gap-y-0 md:divide-x md:divide-[color:var(--rrowm-atmo-rim)] md:pl-0">
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
