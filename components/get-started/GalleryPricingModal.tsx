"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import ModalShell from "@/components/ui/ModalShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const PROFESSIONAL_FEATURES = [
  "Manage a roster of artists within the registry",
  "Register and maintain verified works",
  "Issue and support verification records and certificates",
  "Operate a public institutional studio presence on the registry",
  "Provide structured access for your team",
];

const ENTERPRISE_FEATURES = [
  "Organisation-wide SSO and directory integration",
  "White-label verification flows and API access",
  "Advanced analytics, exports, and audit trails",
  "Dedicated success manager and custom SLA",
  "Contracted terms and invoicing",
];

export function GalleryPricingModal({ isOpen, onClose }: Props) {
  const { formatGalleryMonthlyPrice, t } = useLocalePreferences();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="liquid-glass rrowm-modal-surface w-full max-w-3xl max-h-[min(92vh,44rem)] overflow-y-auto p-8 pb-10 sm:p-10 md:max-w-4xl"
      overlayClassName="liquid-glass-backdrop backdrop-blur-xl ds-z-modal-backdrop fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="pr-2 md:pr-4">
        <p className="text-sm font-medium text-violet-600/90">
          Institutional studio · Paid access
        </p>
        <h2
          id="gallery-pricing-title"
          className="mt-3 font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-[1.75rem]"
        >
          Choose how your institutional studio uses RROWM
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Institutional studio accounts are on a paid tier. Review what is included now and
          what is planned next, then continue to create an account when you are
          ready.
        </p>

        <div className="mt-10 grid gap-8 border-t border-black/[0.06] pt-10 md:grid-cols-2 md:gap-10">
          <section
            aria-labelledby="tier-professional"
            className="flex flex-col rounded-2xl border border-violet-200/80 bg-white/70 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]"
          >
            <h3
              id="tier-professional"
              className="font-serif text-lg font-normal text-neutral-950"
            >
              Institutional Professional
            </h3>
            <p className="mt-3 font-serif text-2xl font-normal tabular-nums tracking-tight text-neutral-950 md:text-[1.65rem]">
              {formatGalleryMonthlyPrice()}
            </p>
            <p className="mt-1.5 text-sm font-medium text-neutral-500">
              {t("common.perMonth")}
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-3 text-[13px] leading-relaxed text-neutral-600">
              {PROFESSIONAL_FEATURES.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500/70"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup?role=gallery"
              onClick={onClose}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
            >
              Continue to sign up
            </Link>
            <p className="mt-3 text-center text-[11px] text-neutral-500">
              You will create your account on the next step.
            </p>
          </section>

          <section
            aria-labelledby="tier-enterprise"
            className="flex flex-col rounded-2xl border border-dashed border-neutral-300/90 bg-neutral-50/50 p-6"
          >
            <h3
              id="tier-enterprise"
              className="font-serif text-lg font-normal text-neutral-950"
            >
              Institutional Enterprise
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              Future paid tier
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-3 text-[13px] leading-relaxed text-neutral-600">
              {ENTERPRISE_FEATURES.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400/80"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] leading-relaxed text-neutral-500">
              Not available for self-serve yet. Talk to us about timing and fit.
            </p>
            <Link
              href="/contact"
              onClick={onClose}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black/[0.1] bg-white/80 px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:border-black/[0.18] hover:bg-white"
            >
              Contact the registry
            </Link>
          </section>
        </div>

        <p className="mt-8 text-center text-[12px] text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login?next=/institutional-studio-dashboard"
            className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.2em] hover:text-neutral-950"
            onClick={onClose}
          >
            Sign in
          </Link>
        </p>
      </div>
    </ModalShell>
  );
}
