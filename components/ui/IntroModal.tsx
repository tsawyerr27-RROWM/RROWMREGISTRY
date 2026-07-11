"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type IntroStep = {
  title: string;
  body: ReactNode;
  icon?: ReactNode;
};

type Props = {
  /** Unique key used to persist dismissal in localStorage. */
  storageKey: string;
  steps: IntroStep[];
  /** Optional welcome title shown above the stepper. */
  welcomeTitle?: string;
  /** If true, show even if previously dismissed (e.g. triggered by sessionStorage flag). */
  forceOpen?: boolean;
  /** Label for the final step CTA — defaults to dismiss-only when omitted. */
  finalCtaLabel?: string;
  /** Optional href for the final CTA (e.g. claim flow). */
  finalCtaHref?: string;
  /** Optional action when the final CTA is clicked (runs before dismiss). */
  onFinalCta?: () => void;
};

/**
 * A first-time introductory modal that shows sequential steps to orient
 * new users. Dismissal is remembered in localStorage so it only appears once.
 */
export function IntroModal({
  storageKey,
  steps,
  welcomeTitle,
  forceOpen = false,
  finalCtaLabel,
  finalCtaHref,
  onFinalCta,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    try {
      if (forceOpen) {
        setVisible(true);
        return;
      }
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) setVisible(true);
    } catch {
      /* SSR or private browsing */
    }
  }, [storageKey, forceOpen]);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(storageKey, "1");
      } catch { /* ignore */ }
    }, 250);
  }, [storageKey]);

  const handleFinalCta = useCallback(() => {
    onFinalCta?.();
    dismiss();
  }, [dismiss, onFinalCta]);

  const finalLabel = finalCtaLabel ?? "Close";

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const multiStep = steps.length > 1;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-opacity duration-250 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transform rounded-2xl border border-black/[0.08] bg-white p-7 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.25)] transition-all duration-250 sm:p-9 ${
          exiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          aria-label="Close"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Welcome title (shown on first step only) */}
        {welcomeTitle && isFirst ? (
          <InfoTooltip text={welcomeTitle} className="mb-1" />
        ) : null}

        {/* Icon */}
        {step.icon ? (
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100/80">
            {step.icon}
          </div>
        ) : null}

        {/* Content */}
        <h2 className="font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 sm:text-2xl">
          {step.title}
        </h2>
        <div className="mt-3 text-sm leading-relaxed text-neutral-600">
          {step.body}
        </div>

        {/* Step indicator + navigation */}
        <div className="mt-8 flex items-center justify-between">
          {multiStep ? (
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-5 bg-neutral-900"
                      : "w-1.5 bg-neutral-200"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {multiStep && !isFirst ? (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                Back
              </button>
            ) : null}
            {isLast ? (
              finalCtaHref ? (
                <Link
                  href={finalCtaHref}
                  onClick={dismiss}
                  className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                >
                  {finalLabel}
                </Link>
              ) : (
                <button
                  onClick={onFinalCta ? handleFinalCta : dismiss}
                  className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
                >
                  {finalLabel}
                </button>
              )
            ) : (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition hover:bg-neutral-800"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A post-onboarding welcome modal that fires once from sessionStorage.
 * Uses the same IntroModal under the hood.
 */
export function WelcomeModal({
  role,
  steps,
  finalCtaLabel,
  finalCtaHref,
  onFinalCta,
}: {
  role: "artist" | "collector" | "gallery";
  steps: IntroStep[];
  finalCtaLabel?: string;
  finalCtaHref?: string;
  onFinalCta?: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const flag = sessionStorage.getItem("rrowm_show_welcome");
      if (flag === role) {
        sessionStorage.removeItem("rrowm_show_welcome");
        setShow(true);
      }
    } catch { /* ignore */ }
  }, [role]);

  if (!show) return null;

  return (
    <IntroModal
      storageKey={`rrowm_intro_${role}_studio`}
      steps={steps}
      welcomeTitle="Welcome to RROWM"
      forceOpen
      finalCtaLabel={finalCtaLabel}
      finalCtaHref={finalCtaHref}
      onFinalCta={onFinalCta}
    />
  );
}
