"use client";

import { useState } from "react";
import { CertificateOverviewModal } from "@/components/certificate/CertificateOverviewModal";

type Props = {
  registryId: string;
};

export function RegistryCertificateOverviewButton({ registryId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="liquid-glass-inset w-full px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-white/80"
      >
        Certificate overview
      </button>
      <CertificateOverviewModal
        registryId={open ? registryId : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
