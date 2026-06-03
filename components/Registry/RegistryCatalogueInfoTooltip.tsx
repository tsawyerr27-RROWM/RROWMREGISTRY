"use client";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  theme?: "light" | "dark";
  className?: string;
};

/** Explains verified-index scope and certificate visibility (registry browse). */
export function RegistryCatalogueInfoTooltip({
  theme = "light",
  className = "",
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <InfoTooltip
      theme={theme}
      className={className}
      text={
        <>
          <span className="block">{t("registry.hero.lede")}</span>
          <span className="mt-2 block font-normal">{t("registry.hero.trustNote")}</span>
        </>
      }
    />
  );
}
