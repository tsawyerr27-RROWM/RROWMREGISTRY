"use client";

import { motion } from "framer-motion";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useLandingMotion } from "@/hooks/useLandingMotion";
import { landingEase, landingMotion, landingType } from "@/styles/landing-redesign";

import { LandingArtworkTile, LANDING_ARTWORK_TITLE_KEYS } from "./LandingArtworkTile";

const CHRONOLOGY_KEYS = [
  "landing.v2.showcase.layer1",
  "landing.v2.showcase.layer3",
  "landing.v2.showcase.layer4",
] as const;

const META_ITEMS = [
  { id: "reg", text: "RROWM-2026-00481" },
  { id: "auth", key: "landing.v2.visual.lineAuthorship" as const },
  { id: "ver", key: "landing.v2.visual.lineVerified" as const },
  { id: "cert", key: "landing.v2.visual.lineIssued" as const },
] as const;

export function LandingHeroCinematic() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useLandingMotion();

  return (
    <div className="landing-cinematic flex w-full flex-col gap-5 sm:gap-6" aria-hidden>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <LandingArtworkTile
          variant="ember"
          title={t(LANDING_ARTWORK_TITLE_KEYS.ember)}
        />
        <LandingArtworkTile
          variant="cobalt"
          title={t(LANDING_ARTWORK_TITLE_KEYS.cobalt)}
        />
      </div>

      <motion.div
        className="landing-plane landing-plane--certificate relative p-5 sm:p-6"
        initial={motionEnabled ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: landingMotion.heroDuration, delay: 0.25, ease: landingEase }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={landingType.meta}>{t("landing.v2.visual.layerCertificate")}</p>
            <p className={`${landingType.display} mt-2 text-lg text-[var(--landing-charcoal)]`}>
              {t("landing.v2.visual.certificateMeta")}
            </p>
          </div>
          <div className="landing-emboss-stamp shrink-0 scale-90">
            <span className="landing-emboss-stamp__ring" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--landing-ember)]">
              RROWM
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="landing-plane landing-plane--record relative p-6 md:p-7"
        initial={motionEnabled ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: landingMotion.heroDuration, delay: 0.4, ease: landingEase }}
      >
        <p className={landingType.signal}>{t("landing.v2.visual.layerRecord")}</p>
        <p
          className={`${landingType.display} mt-3 text-[1.35rem] leading-snug text-[var(--landing-charcoal)] md:text-[1.5rem]`}
        >
          {t("landing.v2.showcase.recordTitle")}
        </p>
        <ul className="mt-4 space-y-2">
          <li className="text-[12px] text-[var(--landing-charcoal-muted)]">
            {t("landing.v2.visual.lineAuthorship")}
          </li>
          <li className="text-[12px] text-[var(--landing-charcoal-muted)]">
            {t("landing.v2.visual.lineStewardship")}
          </li>
        </ul>
        <p className={`${landingType.registryId} mt-5`}>RROWM-2026-00481</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {META_ITEMS.map((item) => (
          <span key={item.id} className="landing-meta-fragment">
            <span className="landing-meta-fragment__dot" />
            <span className={landingType.meta}>
              {"key" in item ? t(item.key) : item.text}
            </span>
          </span>
        ))}
      </div>

      <div className="space-y-2 border-t border-[var(--landing-border)] pt-4">
        {CHRONOLOGY_KEYS.map((key, i) => (
          <motion.div
            key={key}
            className="landing-chronology-chip flex items-center gap-2"
            initial={motionEnabled ? { opacity: 0, x: -8 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.55 + i * 0.08,
              ease: landingEase,
            }}
          >
            <span className="landing-chronology-chip__pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--landing-charcoal-soft)]">
              {t(key)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
