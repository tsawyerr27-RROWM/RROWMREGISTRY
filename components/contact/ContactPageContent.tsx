"use client";

import { ContactForm } from "@/components/contact/ContactForm";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export function ContactPageContent() {
  const { t } = useLocalePreferences();

  return (
    <>
      <header className="max-w-2xl">
        <InfoTooltip text={t("contact.lede")} />
        <h1 className="font-serif text-[2.25rem] font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-[1.06]">
          {t("contact.title")}
        </h1>
      </header>

      <div className="mt-16 flex flex-col gap-14 lg:mt-20 lg:flex-row lg:items-start lg:gap-20 xl:gap-28">
        <div className="max-w-md flex-1">
          <p className="text-[15px] leading-[1.85] text-neutral-600 md:text-base md:leading-[1.8]">
            {t("contact.lede")}
          </p>
          <p className="mt-8 text-sm leading-relaxed text-neutral-500">
            {t("contact.note")}
          </p>
        </div>

        <div className="w-full min-w-0 flex-1 lg:max-w-xl">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
