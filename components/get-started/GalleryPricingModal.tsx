"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import ModalShell from "@/components/ui/ModalShell";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const PROFESSIONAL_FEATURES = [
  "Represented artist roster on the registry",
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
      tone="light"
      panelClassName="rrowm-atmo-section--blend w-full max-w-3xl max-h-[min(92vh,44rem)] overflow-y-auto p-8 pb-10 sm:p-10 md:max-w-4xl"
    >
      <div className="pr-2 md:pr-4">
        <p className="text-sm font-medium text-neutral-700">
          Institutional studio · Paid access
        </p>
        <InfoTooltip text="Institutional studio accounts are on a paid tier. Review what is included now and what is planned next, then continue to create an account when you are ready." />
        <h2
          id="gallery-pricing-title"
          className="mt-3 font-serif text-2xl font-normal leading-tight tracking-tight text-neutral-950 md:text-[1.75rem]"
        >
          Choose how your institutional studio uses RROWM
        </h2>

        <div className="mt-10 grid gap-8 border-t border-[color:var(--rrowm-atmo-rim)] pt-10 md:grid-cols-2 md:gap-10">
          <section
            aria-labelledby="tier-professional"
            className="rrowm-atmo-panel flex flex-col rounded-2xl border p-6 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.14)]"
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
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-500/55"
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
            className="rrowm-atmo-panel--muted flex flex-col rounded-2xl border border-dashed p-6"
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
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_88%,transparent)] px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_90%,transparent)]"
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
