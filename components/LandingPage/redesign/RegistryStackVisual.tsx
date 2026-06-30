"use client";

import { motion } from "framer-motion";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingMotion } from "@/hooks/useLandingMotion";
import { landingEase, landingMotion, landingType } from "@/styles/landing-redesign";

const CARD_OFFSETS = [0, 2.25, 4.5] as const;

export function RegistryStackVisual() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useLandingMotion();

  const cards = [
    {
      label: t("landing.v2.visual.layerRecord"),
      meta: "RROWM-2026-00481",
      lines: [
        t("landing.v2.visual.lineAuthorship"),
        t("landing.v2.visual.lineStewardship"),
      ],
    },
    {
      label: t("landing.v2.visual.layerChronology"),
      meta: t("landing.v2.visual.chronologyMeta"),
      lines: [
        t("landing.v2.showcase.layer1"),
        t("landing.v2.showcase.layer4"),
      ],
    },
    {
      label: t("landing.v2.visual.layerCertificate"),
      meta: t("landing.v2.visual.certificateMeta"),
      lines: [t("landing.v2.visual.lineVerified"), t("landing.v2.visual.lineIssued")],
    },
  ];

  return (
    <div className="landing-registry-stack relative w-full" aria-hidden>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="landing-registry-card absolute inset-x-0"
          style={{
            top: `${CARD_OFFSETS[i]}rem`,
            zIndex: 10 + i,
          }}
          initial={
            motionEnabled
              ? {
                  opacity: 0,
                  y: 16,
                  rotate: i === 0 ? -0.4 : i === 1 ? 0.25 : -0.15,
                }
              : false
          }
          animate={{
            opacity: 1,
            y: 0,
            rotate: i === 0 ? -0.4 : i === 1 ? 0.25 : -0.15,
          }}
          transition={{
            duration: landingMotion.heroDuration,
            delay: 0.15 + i * 0.12,
            ease: landingEase,
          }}
        >
          <div className="landing-archive-fragment landing-archive-fragment--stack p-6 md:p-7">
            <p className={landingType.meta}>{card.label}</p>
            <p
              className={`${landingType.display} mt-4 text-[1.25rem] leading-snug text-[var(--landing-charcoal)] md:text-[1.35rem]`}
            >
              {t("landing.v2.showcase.recordTitle")}
            </p>
            <ul className="mt-4 space-y-2">
              {card.lines.map((line) => (
                <li
                  key={line}
                  className="text-[13px] leading-relaxed text-[var(--landing-charcoal-muted)]"
                >
                  {line}
                </li>
              ))}
            </ul>
            <p className={`${landingType.registryId} mt-5`}>{card.meta}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
