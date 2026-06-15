"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type CertificateArtistActionsProps = {
  registryId: string;
};

export function CertificateArtistActions({
  registryId,
}: CertificateArtistActionsProps) {
  const { t } = useLocalePreferences();

  const openPrintDialog = () => {
    window.print();
  };

  return (
    <div
      className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200/90 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 print:hidden"
      role="region"
      aria-label={`${t("certificate.document.printTitle")} ${registryId}`}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-neutral-900">
          {t("certificate.document.printTitle")}
        </p>
        <p className="text-xs leading-relaxed text-neutral-600">
          {t("certificate.document.printHint")}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPrintDialog}
          className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          {t("certificate.document.print")}
        </button>
        <button
          type="button"
          onClick={openPrintDialog}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          {t("certificate.document.savePdf")}
        </button>
      </div>
    </div>
  );
}
