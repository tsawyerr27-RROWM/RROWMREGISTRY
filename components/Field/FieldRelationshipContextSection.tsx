"use client";

import { FieldRelationshipContextPanel } from "@/components/Field/FieldRelationshipContextPanel";
import type { FieldRelationshipContextSectionData } from "@/lib/field-relationship-context";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  data: FieldRelationshipContextSectionData;
};

export function FieldRelationshipContextSection({ data }: Props) {
  const { t } = useLocalePreferences();

  if (data.panels.length === 0) return null;

  return (
    <section className="mt-14 md:mt-16" aria-labelledby="field-relationship-context-heading">
      <h2
        id="field-relationship-context-heading"
        className="font-serif text-2xl font-normal tracking-tight text-neutral-950 md:text-3xl"
      >
        {t("field.context.sectionHeading")}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {t("field.context.sectionLede")}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {data.panels.map((panel) => (
          <FieldRelationshipContextPanel key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}
