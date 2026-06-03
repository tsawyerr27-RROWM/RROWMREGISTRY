"use client";

import { useState } from "react";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { CertificateOverviewModal } from "@/components/certificate/CertificateOverviewModal";

type Props = {
  registryId: string;
};

export function RegistryCertificateOverviewButton({ registryId }: Props) {
  const { t } = useLocalePreferences();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="liquid-glass-inset w-full px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white/80"
      >
        {t("registry.record.certificateOverview")}
      </button>
      <CertificateOverviewModal
        registryId={open ? registryId : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
