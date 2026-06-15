"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { EligibilityMatchIndicator } from "@/lib/opportunity-eligibility";

type Props = {
  indicators: EligibilityMatchIndicator[];
  variant?: "default" | "sidebar";
};

function indicatorClass(status: EligibilityMatchIndicator["status"]): string {
  switch (status) {
    case "match":
      return "text-emerald-950/85";
    case "not_specified":
    case "no_match":
      return "text-neutral-800";
    default:
      return "text-neutral-700";
  }
}

export function FieldOpportunityEligibilityIndicators({
  indicators,
  variant = "default",
}: Props) {
  const { t } = useLocalePreferences();
  const isSidebar = variant === "sidebar";

  if (indicators.length === 0) return null;

  if (isSidebar) {
    return (
      <div>
        <h3 className="font-serif text-lg text-neutral-950">
          {t("field.opportunities.detail.profileHeading")}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {t("field.opportunities.apply.profileIndicatorsLede")}
        </p>
        <ul className="mt-4 space-y-3">
          {indicators.map((indicator) => (
            <li
              key={`${indicator.kind}-${indicator.message}`}
              className={`border-t border-neutral-900/[0.06] pt-3 text-sm leading-relaxed ${indicatorClass(
                indicator.status
              )}`}
            >
              {indicator.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mt-16 max-w-3xl border-t border-neutral-900/[0.06] pt-16 md:mt-20 md:pt-20 lg:hidden">
      <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">
        {t("field.opportunities.detail.profileHeading")}
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
        {t("field.opportunities.apply.profileIndicatorsLede")}
      </p>
      <ul className="mt-8 space-y-4">
        {indicators.map((indicator) => (
          <li
            key={`${indicator.kind}-${indicator.message}`}
            className={`border-t border-neutral-900/[0.06] pt-4 text-[15px] leading-relaxed ${indicatorClass(
              indicator.status
            )}`}
          >
            {indicator.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
