"use client";

import { narrativeLayout } from "@/styles/narrative-layout";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";

type SystemPropertiesProps = {
  density?: "default" | "digest";
};

const ITEM_KEYS = [
  {
    titleKey: "about.properties.p1Title" as MessageKey,
    bodyKey: "about.properties.p1Body" as MessageKey,
  },
  {
    titleKey: "about.properties.p2Title" as MessageKey,
    bodyKey: "about.properties.p2Body" as MessageKey,
  },
  {
    titleKey: "about.properties.p3Title" as MessageKey,
    bodyKey: "about.properties.p3Body" as MessageKey,
  },
] as const;

export function SystemProperties({ density = "default" }: SystemPropertiesProps) {
  const { t } = useLocalePreferences();
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  return (
    <Shell
      className={
        digest
          ? ""
          : `rrowm-atmo-section--mist ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-properties-heading" } : {})}
    >
      <div
        className={
          digest
            ? "pt-0"
            : "border-t border-[color:var(--rrowm-atmo-rim)] pt-16 md:pt-20"
        }
      >
        <h2
          {...(!digest ? { id: "about-properties-heading" } : {})}
          className={
            digest
              ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
              : "font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-normal leading-tight tracking-tight text-neutral-950"
          }
        >
          {t("about.properties.title")}
        </h2>
        <ul
          className={
            digest
              ? "mt-6 divide-y divide-[color:var(--rrowm-atmo-rim)] border-y border-[color:var(--rrowm-atmo-rim)]"
              : "mt-12 divide-y divide-[color:var(--rrowm-atmo-rim)] border-y border-[color:var(--rrowm-atmo-rim)] md:mt-16"
          }
        >
          {ITEM_KEYS.map((item) => (
            <li
              key={item.titleKey}
              className={
                digest
                  ? "py-5 md:py-6"
                  : "py-10 md:py-12"
              }
            >
              <h3
                className={
                  digest
                    ? "text-sm font-medium text-neutral-950 md:pt-0.5 md:text-[15px]"
                    : "text-lg font-medium text-neutral-950 md:pt-0.5"
                }
              >
                {t(item.titleKey)}
              </h3>
              <p
                className={
                  digest
                    ? "mt-2 text-[13px] leading-relaxed text-neutral-600"
                    : "mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600"
                }
              >
                {t(item.bodyKey)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
