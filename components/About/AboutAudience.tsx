"use client";

import { narrativeLayout } from "@/styles/narrative-layout";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type AboutAudienceProps = {
  density?: "default" | "digest";
};

export function AboutAudience({ density = "default" }: AboutAudienceProps) {
  const { t } = useLocalePreferences();
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  return (
    <Shell
      className={
        digest
          ? ""
          : `rrowm-atmo-section--dusk ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-audience-heading" } : {})}
    >
      <h2
        {...(!digest ? { id: "about-audience-heading" } : {})}
        className={
          digest
            ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
            : "font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-normal leading-tight tracking-tight text-neutral-950"
        }
      >
        {t("about.audience.title")}
      </h2>
      <div
        className={
            digest
              ? "mt-6 grid gap-8 md:mt-7 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--rrowm-atmo-rim)]"
              : "mt-16 grid gap-14 md:mt-20 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--rrowm-atmo-rim)]"
        }
      >
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:pr-6 md:text-sm lg:pr-8"
              : "text-sm leading-[1.82] text-neutral-600 md:pr-10 md:text-base lg:pr-14"
          }
        >
          <span className="font-medium text-neutral-900">
            {t("about.audience.artistsLabel")}
          </span>{" "}
          {t("about.audience.artistsBody")}
        </p>
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:px-6 md:text-sm lg:px-8"
              : "text-sm leading-[1.82] text-neutral-600 md:px-10 md:text-base lg:px-14"
          }
        >
          <span className="font-medium text-neutral-900">
            {t("about.audience.galleriesLabel")}
          </span>{" "}
          {t("about.audience.galleriesBody")}
        </p>
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:pl-6 md:text-sm lg:pl-8"
              : "text-sm leading-[1.82] text-neutral-600 md:pl-10 md:text-base lg:pl-14"
          }
        >
          <span className="font-medium text-neutral-900">
            {t("about.audience.collectorsLabel")}
          </span>{" "}
          {t("about.audience.collectorsBody")}
        </p>
      </div>
    </Shell>
  );
}
