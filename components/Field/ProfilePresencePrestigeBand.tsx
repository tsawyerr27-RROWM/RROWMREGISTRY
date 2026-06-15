"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { ProfileShareContext } from "@/lib/profile-presence-summary";
import { fillMessage } from "@/lib/locale-messages";

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

  return (
    <div
      className={`mt-8 max-w-2xl rounded-[1.15rem] border border-neutral-900/[0.08] bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f4f0]/90 px-6 py-6 shadow-[0_20px_56px_-40px_rgba(15,23,42,0.18)] md:px-8 md:py-7 ${className}`}
    >
      <p className="text-sm text-neutral-500">
        {t("profile.presence.band.kicker")} · {t(context.surfaceLabelKey)}
      </p>

      {trust ? (
        <p className="mt-3 font-serif text-2xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.75rem]">
          {trust}
        </p>
      ) : null}

      {footprint || secondary || context.practiceLine ? (
        <div className="mt-4 space-y-2 border-t border-neutral-900/[0.06] pt-4">
          {footprint ? (
            <p className="text-sm leading-relaxed text-neutral-700">{footprint}</p>
          ) : null}
          {secondary ? (
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
