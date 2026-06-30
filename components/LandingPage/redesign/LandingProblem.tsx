"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";
import { landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { LandingContainer, LandingSection } from "./LandingSection";

const FRAGMENTS = [
  "landing.v2.problem.fragment1",
  "landing.v2.problem.fragment2",
  "landing.v2.problem.fragment3",
  "landing.v2.problem.fragment4",
] as const satisfies readonly MessageKey[];

export function LandingProblem() {
  const { t } = useLocalePreferences();

  return (
    <LandingSection id="landing-problem" tone="espresso" pad="tight">
      <LandingContainer>
        <LandingReveal variant="file">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
            <div className="relative lg:col-span-5">
              <div className="border-l-2 border-[var(--landing-ember)] pl-6">
              <h2
                className={`${landingType.display} text-[clamp(2.35rem,4.8vw,3.75rem)] leading-[1.04] text-[var(--landing-ivory)]`}
              >
                <span className="block">{t("landing.v2.problem.headline1")}</span>
                <span className="mt-3 block text-white/50">
                  {t("landing.v2.problem.headline2")}
                </span>
              </h2>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-[17px] leading-[1.7] text-white/65 md:text-lg md:leading-[1.75]">
                {t("landing.v2.problem.lead")}
              </p>

              <ul className="mt-14 space-y-5 sm:mt-16">
                {FRAGMENTS.map((key, i) => (
                  <li
                    key={key}
                    className="flex gap-3 text-[15px] leading-relaxed text-white/55 md:text-base"
                  >
                    <span
                      className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                        i % 3 === 0
                          ? "bg-[var(--landing-cobalt)] shadow-[0_0_6px_var(--landing-cobalt-dim)]"
                          : i % 3 === 1
                            ? "bg-[var(--landing-lime)]"
                            : "bg-[var(--landing-ember)]"
                      }`}
                      aria-hidden
                    />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}
