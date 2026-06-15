"use client";

import Link from "next/link";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { MessageKey } from "@/lib/locale-messages";

type StewardshipItem = {
  id: string;
  labelKey: MessageKey;
  complete: boolean;
};

type Props = {
  items: StewardshipItem[];
};

export function OrganisationPresenceOwnerStewardship({ items }: Props) {
  const { t } = useLocalePreferences();
  const incomplete = items.filter((item) => !item.complete);

  if (incomplete.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-amber-200/70 bg-amber-50/50 px-5 py-5 md:px-6">
      <h2 className="font-serif text-lg font-normal text-amber-950">
        {t("field.organisation.stewardship.heading")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
        {t("field.organisation.stewardship.lede")}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-amber-950/90">
        {incomplete.map((item) => (
          <li key={item.id} className="flex gap-2">
            <span aria-hidden className="text-amber-700/70">
              ○
            </span>
            <span>{t(item.labelKey)}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/studio/organisation"
        className="mt-4 inline-flex text-sm font-medium text-amber-950 underline decoration-amber-900/30 underline-offset-2 hover:decoration-amber-900/50"
      >
        {t("field.organisation.stewardship.studioLink")}
      </Link>
    </section>
  );
}
