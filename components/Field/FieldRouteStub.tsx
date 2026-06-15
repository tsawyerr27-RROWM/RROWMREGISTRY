"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldHomeHref } from "@/lib/field-nav";
import type { MessageKey } from "@/lib/locale-messages";

type Props = {
  titleKey: MessageKey;
  descriptionKey: MessageKey;
};

export function FieldRouteStub({ titleKey, descriptionKey }: Props) {
  const { t } = useLocalePreferences();

  return (
    <section className="mx-auto w-full max-w-[min(100%,88rem)] px-6 py-16 md:px-14 md:py-24 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
          {t(titleKey)}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-neutral-600">
          {t(descriptionKey)}
        </p>
        <Link
          href={fieldHomeHref()}
          className="mt-10 inline-flex text-sm font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-[3px] hover:decoration-emerald-900/50"
        >
          {t("field.stub.backHome")}
        </Link>
      </div>
    </section>
  );
}
