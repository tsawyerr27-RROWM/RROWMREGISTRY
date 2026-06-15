"use client";

import Link from "next/link";

import { RrowmLogo } from "@/components/brand/RrowmLogo";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { registryPremium } from "@/styles/registry-premium";

type Props = {
  registryId: string;
};

export function CertificateMissingView({ registryId }: Props) {
  const { t } = useLocalePreferences();

  return (
    <div className={`${registryPremium.paper.gradient} ds-page-environment min-h-screen px-6 py-24 text-neutral-900`}>
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/90 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.2)]">
        <div className="border-b border-neutral-200/70 px-10 py-8">
          <Link href="/" className="inline-flex max-w-[150px]" aria-label="RROWM home">
            <RrowmLogo
              sizes="148px"
              className="h-10 w-auto max-h-10 max-w-full object-contain object-left opacity-95"
            />
          </Link>
        </div>
        <div className="px-10 py-10">
          <h1 className="font-serif text-2xl font-normal tracking-tight text-neutral-900">
            {t("certificate.document.missingTitle")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {t("certificate.document.missingBody")}
          </p>
          <Link
            href={`/registry/${encodeURIComponent(registryId)}/ledger`}
            className="mt-10 inline-flex rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            {t("certificate.document.viewRecord")}
          </Link>
        </div>
      </div>
    </div>
  );
}
