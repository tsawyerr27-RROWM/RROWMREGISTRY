"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  registryId: string;
  verificationHash: string | null | undefined;
  timelineHash: string | null | undefined;
};

export function RegistryTechnicalDetails({
  registryId,
  verificationHash,
  timelineHash,
}: Props) {
  const { t } = useLocalePreferences();

  return (
    <details className="group rounded-[1.25rem] border border-neutral-900/[0.06] bg-[#fafaf8]/80 p-6 md:p-8">
      <summary className="cursor-pointer list-none font-serif text-base font-normal text-neutral-800 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          {t("registry.record.technical.title")}
          <span className="text-sm text-neutral-400 transition group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
        {t("registry.record.technical.appendixNote")}
      </p>
      <dl className="mt-6 space-y-5 border-t border-neutral-900/[0.06] pt-6 text-sm">
        <div>
          <dt className="text-neutral-500">{t("registry.card.registryId")}</dt>
          <dd className="mt-1 break-all font-mono text-xs text-neutral-900">
            {registryId}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">
            {t("registry.record.technical.verificationHash")}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-neutral-600">
            {verificationHash || "–"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">
            {t("registry.record.technical.timelineHash")}
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-neutral-600">
            {timelineHash || "–"}
          </dd>
        </div>
      </dl>
    </details>
  );
}
