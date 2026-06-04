"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import ModalShell from "@/components/ui/ModalShell";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { MessageKey } from "@/lib/locale-messages";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const PRO_FEATURE_KEYS: MessageKey[] = [
  "pricing.pro.f1",
  "pricing.pro.f2",
  "pricing.pro.f3",
  "pricing.pro.f4",
  "pricing.pro.f5",
];

const ENTERPRISE_FEATURE_KEYS: MessageKey[] = [
  "pricing.enterprise.f1",
  "pricing.enterprise.f2",
  "pricing.enterprise.f3",
  "pricing.enterprise.f4",
  "pricing.enterprise.f5",
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
          {t("pricing.eyebrow")}
        </p>
        <InfoTooltip text="Institutional studio accounts are on a paid tier. Review what is included now and what is planned next, then continue to create an account when you are ready." />
        <h2
          id="gallery-pricing-title"
          className="mt-3 font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]"
        >
          {t("pricing.title")}
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
              {t("pricing.pro.title")}
            </h3>
            <p className="mt-3 font-serif text-[1.75rem] font-normal tabular-nums tracking-[-0.01em] text-neutral-950 md:text-[1.85rem]">
              {formatGalleryMonthlyPrice()}
            </p>
            <p className="mt-1.5 text-sm font-medium text-neutral-500">
              {t("common.perMonth")}
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-3 text-[13px] leading-relaxed text-neutral-600">
              {PRO_FEATURE_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-500/55"
                    aria-hidden
                  />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup?role=gallery"
              onClick={onClose}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
            >
              {t("pricing.pro.continue")}
            </Link>
            <p className="mt-3 text-center text-[11px] text-neutral-500">
              {t("pricing.pro.nextStep")}
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
              {t("pricing.enterprise.title")}
            </h3>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {t("pricing.enterprise.future")}
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-3 text-[13px] leading-relaxed text-neutral-600">
              {ENTERPRISE_FEATURE_KEYS.map((key) => (
                <li key={key} className="flex gap-2.5">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400/80"
                    aria-hidden
                  />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] leading-relaxed text-neutral-500">
              {t("pricing.enterprise.note")}
            </p>
            <Link
              href="/contact"
              onClick={onClose}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_88%,transparent)] px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_90%,transparent)]"
            >
              {t("pricing.enterprise.contact")}
            </Link>
          </section>
        </div>

        <p className="mt-8 text-center text-[12px] text-neutral-500">
          {t("pricing.alreadyAccount")}{" "}
          <Link
            href="/login?next=/studio/organisation"
            className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.2em] hover:text-neutral-950"
            onClick={onClose}
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </ModalShell>
  );
}
