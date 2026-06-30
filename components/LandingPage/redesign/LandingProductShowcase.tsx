"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingMotion } from "@/hooks/useLandingMotion";
import type { MessageKey } from "@/lib/locale-messages";
import { landingEase, landingMotion, landingType } from "@/styles/landing-redesign";

import { LandingReveal } from "./LandingReveal";
import { RegistryStackVisual } from "./RegistryStackVisual";
import { LandingContainer, LandingSection } from "./LandingSection";

type ShowcaseTab = "record" | "chronology" | "certificate" | "transfer";

const TABS: { id: ShowcaseTab; index: string; labelKey: MessageKey }[] = [
  { id: "record", index: "01", labelKey: "landing.v2.showcase.tabRecord" },
  { id: "chronology", index: "02", labelKey: "landing.v2.showcase.tabChronology" },
  { id: "certificate", index: "03", labelKey: "landing.v2.showcase.tabCertificate" },
  { id: "transfer", index: "04", labelKey: "landing.v2.showcase.tabTransfer" },
];

const REGISTRY_ID = "RROWM-2026-00481";

export function LandingProductShowcase() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useLandingMotion();
  const [tab, setTab] = useState<ShowcaseTab>("record");

  return (
    <LandingSection id="landing-showcase" tone="bone">
      <LandingContainer>
        <LandingReveal variant="file">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <p className={landingType.signal}>{t("landing.v2.showcase.eyebrow")}</p>
              <h2
                className={`${landingType.display} mt-5 max-w-[16ch] text-[clamp(2.1rem,3.8vw,3.35rem)] leading-[1.04] text-[var(--landing-charcoal)]`}
              >
                {t("landing.v2.showcase.title")}
              </h2>
            </div>
            <p className={`${landingType.lead} lg:col-span-5 lg:pb-2`}>
              {t("landing.v2.showcase.body")}
            </p>
          </div>
        </LandingReveal>

        <div className="mt-16 grid items-start gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-12 xl:gap-20">
          <LandingReveal variant="stamp" className="lg:col-span-5">
            <RegistryStackVisual />
          </LandingReveal>

          <div className="lg:col-span-7">
            <nav
              className="landing-archive-index mb-10 flex flex-wrap gap-x-8 gap-y-3 lg:mb-12"
              aria-label="Product views"
            >
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id ? "true" : undefined}
                  className={`landing-archive-index__item ${
                    tab === item.id ? "landing-archive-index__item--active" : ""
                  }`}
                >
                  <span className="landing-archive-index__num">{item.index}</span>
                  <span>{t(item.labelKey)}</span>
                </button>
              ))}
            </nav>

            <LandingReveal delay={0.06} variant="stamp">
              <motion.div
                key={tab}
                className="landing-archive-sheet"
                initial={motionEnabled ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: landingMotion.revealDuration,
                  ease: landingEase,
                }}
              >
                {tab === "record" ? <RecordPanel /> : null}
                {tab === "chronology" ? <ChronologyPanel /> : null}
                {tab === "certificate" ? <CertificatePanel /> : null}
                {tab === "transfer" ? <TransferPanel /> : null}
              </motion.div>
            </LandingReveal>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

function RecordPanel() {
  const { t } = useLocalePreferences();
  return (
    <div className="landing-archive-sheet__body">
      <p className={landingType.meta}>{t("landing.v2.showcase.recordLabel")}</p>
      <h3 className={`${landingType.display} mt-4 text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.06] text-[var(--landing-charcoal)]`}>
        {t("landing.v2.showcase.recordTitle")}
      </h3>
      <dl className="mt-12 space-y-8">
        <Field label={t("landing.v2.showcase.authorship")} value={t("landing.v2.showcase.authorshipValue")} />
        <Field label={t("landing.v2.showcase.stewardship")} value={t("landing.v2.showcase.stewardshipValue")} />
        <Field label={t("landing.v2.showcase.medium")} value={t("landing.v2.showcase.mediumValue")} />
      </dl>
      <RegistryFooter />
    </div>
  );
}

function ChronologyPanel() {
  const { t } = useLocalePreferences();
  const events = [
    "landing.v2.showcase.layer1",
    "landing.v2.showcase.layer2",
    "landing.v2.showcase.layer3",
    "landing.v2.showcase.layer4",
  ] as const;

  return (
    <div className="landing-archive-sheet__body">
      <h3 className={`${landingType.display} text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.06] text-[var(--landing-charcoal)]`}>
        {t("landing.v2.showcase.chronologyTitle")}
      </h3>
      <p className={`${landingType.meta} mt-4 normal-case tracking-[0.06em]`}>
        {t("landing.v2.showcase.immutableBadge")}
      </p>
      <ol className="mt-10 space-y-6">
        {events.map((key, i) => (
          <li key={key} className="flex gap-4">
            <span className="font-mono text-[10px] tabular-nums text-[var(--landing-charcoal-muted)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-[var(--landing-charcoal)] md:text-base">
              {t(key)}
            </span>
          </li>
        ))}
      </ol>
      <RegistryFooter />
    </div>
  );
}

function CertificatePanel() {
  const { t } = useLocalePreferences();
  return (
    <div className="landing-archive-sheet__body">
      <h3 className={`${landingType.display} text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.06] text-[var(--landing-charcoal)]`}>
        {t("landing.v2.showcase.certificateTitle")}
      </h3>
      <p className={`${landingType.display} mt-10 text-[clamp(1.35rem,2vw,1.65rem)] leading-snug text-[var(--landing-charcoal)]`}>
        {t("landing.v2.showcase.certificateIssued")}
      </p>
      <p className={`${landingType.body} mt-6 max-w-prose`}>
        {t("landing.v2.showcase.certificateBody")}
      </p>
      <RegistryFooter />
    </div>
  );
}

function TransferPanel() {
  const { t } = useLocalePreferences();
  return (
    <div className="landing-archive-sheet__body">
      <h3 className={`${landingType.display} text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.06] text-[var(--landing-charcoal)]`}>
        {t("landing.v2.showcase.transferTitle")}
      </h3>
      <p className="mt-10 text-[15px] leading-relaxed text-[var(--landing-charcoal)] md:text-base">
        {t("landing.v2.showcase.transferTo")}
      </p>
      <p className={`${landingType.body} mt-6 max-w-prose`}>
        {t("landing.v2.showcase.transferBody")}
      </p>
      <RegistryFooter />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <dt className={landingType.meta}>{label}</dt>
      <dd className="text-[15px] leading-relaxed text-[var(--landing-charcoal)] md:text-base">
        {value}
      </dd>
    </div>
  );
}

function RegistryFooter() {
  return (
    <p className={`${landingType.registryId} mt-14 pt-6 md:mt-16`}>{REGISTRY_ID}</p>
  );
}
