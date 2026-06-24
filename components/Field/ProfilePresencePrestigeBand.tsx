"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { ProfileShareContext } from "@/lib/profile-presence-summary";
import { fillMessage } from "@/lib/locale-messages";
import { rrowmFieldCard } from "@/styles/rrowm-theme";

type Props = {
  context: ProfileShareContext;
  className?: string;
};

function formatLine(
  line: ProfileShareContext["trustLine"] | null,
  t: ReturnType<typeof useLocalePreferences>["t"]
): string | null {
  if (!line) return null;
  const template = t(line.key);
  return line.params ? fillMessage(template, line.params) : template;
}

export function ProfilePresencePrestigeBand({ context, className = "" }: Props) {
  const { t } = useLocalePreferences();

  const trust = formatLine(context.trustLine, t);
  const footprint = formatLine(context.footprintLine, t);
  const secondary = formatLine(context.secondaryLine, t);
  const rights = formatLine(context.rightsLine, t);

  return (
    <div className={`mt-8 max-w-2xl ${rrowmFieldCard.prestige} ${className}`}>
      {trust ? (
        <p className="font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.75rem]">
          {trust}
        </p>
      ) : null}

      <p className={`text-sm leading-relaxed text-neutral-500 ${trust ? "mt-2" : ""}`}>
        {t(context.surfaceLabelKey)}
      </p>

      {footprint || secondary || rights || context.practiceLine ? (
        <div className="mt-4 space-y-2 border-t border-neutral-900/[0.06] pt-4">
          {footprint ? (
            <p
              className={`text-sm leading-relaxed ${
                context.role === "collector"
                  ? "font-medium text-neutral-800"
                  : "text-neutral-700"
              }`}
            >
              {footprint}
            </p>
          ) : null}
          {rights ? (
            <p className="text-sm font-medium leading-relaxed text-neutral-800">
              {rights}
            </p>
          ) : null}
          {secondary && context.role !== "collector" ? (
            <p className="text-sm leading-relaxed text-neutral-600">{secondary}</p>
          ) : null}
          {context.practiceLine ? (
            <p className="text-sm leading-relaxed text-neutral-600">
              {context.practiceLine}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
