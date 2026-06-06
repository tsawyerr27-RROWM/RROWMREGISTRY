"use client";

import Link from "next/link";

import type { FieldRelationshipContextPanelData } from "@/lib/field-relationship-context";
import { fillMessage, type MessageKey } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  panel: FieldRelationshipContextPanelData;
};

function linkLabel(
  t: (key: MessageKey) => string,
  link: FieldRelationshipContextPanelData["links"][number]
): string {
  if (link.labelKey) return t(link.labelKey);
  if (link.meta === "verify") return t("field.context.link.verify");
  if (link.meta === "ledger") return t("field.context.link.ledger");
  return link.label;
}

function linkMeta(
  t: (key: MessageKey) => string,
  link: FieldRelationshipContextPanelData["links"][number]
): string | null {
  if (link.meta === "verified") return t("field.context.meta.verified");
  if (link.meta === "verify" || link.meta === "ledger") return null;
  if (link.meta && /^\d+$/.test(link.meta)) {
    return fillMessage(t("field.context.meta.workCount"), { count: link.meta });
  }
  return link.meta || null;
}

export function FieldRelationshipContextPanel({ panel }: Props) {
  const { t } = useLocalePreferences();

  const heading = panel.ledeParams
    ? fillMessage(t(panel.headingKey), panel.ledeParams)
    : t(panel.headingKey);
  const lede = panel.ledeParams
    ? fillMessage(t(panel.ledeKey), panel.ledeParams)
    : t(panel.ledeKey);

  return (
    <article className="rounded-[1.25rem] border border-neutral-900/[0.06] bg-white/70 p-6 shadow-sm md:p-8">
      <h3 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        {heading}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">{lede}</p>
      <ul className="mt-6 space-y-3">
        {panel.links.map((link) => {
          const meta = linkMeta(t, link);
          return (
            <li key={link.id}>
              <Link
                href={link.href}
                className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
              >
                <span className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition group-hover:decoration-neutral-500">
                  {linkLabel(t, link)}
                </span>
                {meta ? (
                  <span className="text-[12px] text-neutral-500">{meta}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {panel.viewAllHref && panel.viewAllLabelKey ? (
        <div className="mt-6">
          <Link
            href={panel.viewAllHref}
            className="inline-flex rounded-2xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            {t(panel.viewAllLabelKey)}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
