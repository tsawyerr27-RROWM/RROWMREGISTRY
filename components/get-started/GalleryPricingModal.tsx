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

const FOUNDATION_FEATURE_KEYS: MessageKey[] = [
  "pricing.foundation.f1",
  "pricing.foundation.f2",
  "pricing.foundation.f3",
  "pricing.foundation.f4",
  "pricing.foundation.f5",
  "pricing.foundation.f6",
  "pricing.foundation.f7",
];

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

function FeatureList({
  keys,
  tone = "primary",
  columns = "auto",
}: {
  keys: MessageKey[];
  tone?: "primary" | "muted";
  columns?: "auto" | "single";
}) {
  const { t } = useLocalePreferences();
  const dotClass =
    tone === "primary"
      ? "bg-neutral-500/55"
      : "bg-neutral-400/70";
  const gridClass =
    columns === "single"
      ? "grid gap-2.5"
      : "grid gap-2.5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5";

  return (
    <ul className={gridClass}>
      {keys.map((key) => (
        <li key={key} className="flex gap-2.5 text-[13px] leading-relaxed text-neutral-600">
          <span
            className={`mt-[0.45rem] h-1 w-1 shrink-0 rounded-full ${dotClass}`}
            aria-hidden
          />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}

function ComingLaterBadge() {
  const { t } = useLocalePreferences();
  return (
    <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-neutral-50/90 px-2.5 py-0.5 font-mono text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-500">
      {t("pricing.comingLater")}
    </span>
  );
}

export function GalleryPricingModal({ isOpen, onClose }: Props) {
  const { t } = useLocalePreferences();

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
      panelClassName="w-full max-w-3xl md:max-w-4xl"
      innerClassName="!m-2 max-h-[min(calc(92vh-5rem),48rem)] overflow-y-auto overscroll-y-contain sm:!m-3"
      closeClassName="absolute right-5 top-5 z-20 rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition hover:bg-black/[0.04] hover:text-neutral-800"
    >
      <div className="px-6 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-14">
        <header className="border-b border-black/[0.06] pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-neutral-500">
              {t("pricing.eyebrow")}
            </p>
            <InfoTooltip text="Organisation Studio is free registry infrastructure. Create your verified presence now; optional paid capabilities arrive in future releases." />
          </div>
          <h2
            id="gallery-pricing-title"
            className="mt-4 max-w-2xl font-serif text-[1.65rem] font-normal leading-[1.12] tracking-[-0.02em] text-neutral-950 sm:text-[1.85rem]"
          >
            {t("pricing.title")}
          </h2>
        </header>

        <section
          aria-labelledby="tier-foundation"
          className="mt-6 rounded-2xl border border-black/[0.07] bg-white/90 p-6 shadow-[0_20px_48px_-40px_rgba(15,23,42,0.18)] sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 gap-y-3">
            <div className="min-w-0 flex-1">
              <h3
                id="tier-foundation"
                className="font-serif text-xl font-normal text-neutral-950"
              >
                {t("pricing.foundation.title")}
              </h3>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600">
                {t("pricing.foundation.description")}
              </p>
            </div>
            <p className="shrink-0 font-serif text-[2rem] font-normal leading-none tracking-[-0.02em] text-neutral-950">
              {t("pricing.foundation.free")}
            </p>
          </div>

          <div className="mt-6 border-t border-black/[0.05] pt-6">
            <FeatureList keys={FOUNDATION_FEATURE_KEYS} tone="primary" />
          </div>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:max-w-sm">
            <Link
              href="/signup?role=gallery"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
            >
              {t("pricing.foundation.cta")}
            </Link>
            <p className="text-center text-[11px] leading-relaxed text-neutral-500">
              {t("pricing.foundation.nextStep")}
            </p>
          </div>
        </section>

        <div className="mt-8">
          <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-neutral-500">
            {t("pricing.comingLater")}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-5">
            <section
              aria-labelledby="tier-professional"
              className="flex flex-col rounded-2xl border border-dashed border-black/[0.1] bg-neutral-50/50 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  id="tier-professional"
                  className="font-serif text-[1.05rem] font-normal text-neutral-900"
                >
                  {t("pricing.pro.title")}
                </h3>
                <ComingLaterBadge />
              </div>
              <div className="mt-4 flex-1">
                <FeatureList keys={PRO_FEATURE_KEYS} tone="muted" columns="single" />
              </div>
            </section>

            <section
              aria-labelledby="tier-enterprise"
              className="flex flex-col rounded-2xl border border-dashed border-black/[0.1] bg-neutral-50/50 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  id="tier-enterprise"
                  className="font-serif text-[1.05rem] font-normal text-neutral-900"
                >
                  {t("pricing.enterprise.title")}
                </h3>
                <ComingLaterBadge />
              </div>
              <div className="mt-4 flex-1">
                <FeatureList keys={ENTERPRISE_FEATURE_KEYS} tone="muted" columns="single" />
              </div>
              <p className="mt-5 text-[12px] leading-relaxed text-neutral-500">
                {t("pricing.enterprise.note")}
              </p>
              <Link
                href="/contact"
                onClick={onClose}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-black/[0.08] bg-white/80 px-4 py-2.5 text-center text-sm font-medium text-neutral-800 transition hover:bg-white"
              >
                {t("pricing.enterprise.contact")}
              </Link>
            </section>
          </div>
        </div>

        <p className="mt-8 border-t border-black/[0.05] pt-6 text-center text-[12px] text-neutral-500">
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
