"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryPremium } from "@/styles/registry-premium";

type Props = {
  certificateHash: string | null;
  verificationHash: string;
  timelineHash: string | null;
};

export function CertificateAuthenticityBlock({
  certificateHash,
  verificationHash,
  timelineHash,
}: Props) {
  const { t } = useLocalePreferences();
  const labelClass = registryPremium.document.label;
  const hashBoxClass = registryPremium.document.hashBox;

  return (
    <section className="registry-authenticity-block mt-10 shrink-0 break-inside-avoid rounded-xl border border-neutral-200/80 bg-[#fafaf8]/90 px-6 py-8 sm:px-8 print:mt-2 print:rounded-sm print:border-neutral-200/80 print:bg-gradient-to-b print:from-neutral-50/90 print:to-neutral-50/40 print:px-3 print:py-2 print:shadow-none">
      <div className="flex flex-wrap items-baseline justify-between gap-3 print:gap-1">
        <p className="text-sm font-semibold text-neutral-700 print:text-sm">
          {t("certificate.document.authenticityHeading")}
        </p>
        <span className="text-[10px] text-neutral-500 print:text-[8.5px]">
          {t("certificate.document.authenticitySub")}
        </span>
      </div>
      <div className="mt-8 space-y-8 print:mt-2 print:space-y-2">
        <div className="min-w-0 break-inside-avoid">
          <p className={labelClass}>{t("certificate.document.certFingerprint")}</p>
          <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>
            {certificateHash || t("certificate.document.noHash")}
          </p>
        </div>
        <div className="min-w-0 break-inside-avoid">
          <p className={labelClass}>{t("certificate.document.recordFingerprint")}</p>
          <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>
            {verificationHash}
          </p>
        </div>
        <div className="min-w-0 break-inside-avoid">
          <p className={labelClass}>{t("certificate.document.timelineFingerprint")}</p>
          <p className={`${hashBoxClass} [overflow-wrap:anywhere]`}>
            {timelineHash || t("certificate.document.noTimeline")}
          </p>
        </div>
      </div>
    </section>
  );
}
