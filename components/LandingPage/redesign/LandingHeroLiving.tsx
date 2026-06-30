"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { landingType } from "@/styles/landing-redesign";

import { LandingInstallationVisual } from "./LandingInstallationVisual";

const REGISTRY_ID = "RROWM-2026-00481";

export function LandingHeroLiving({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const { t } = useLocalePreferences();

  const artX = useTransform(progress, [0, 0.72, 1], [52, 18, 0]);
  const artY = useTransform(progress, [0, 0.72, 1], [-48, -16, 0]);
  const artRotate = useTransform(progress, [0, 1], [7, 0]);
  const artScale = useTransform(progress, [0, 0.85, 1], [1.08, 1.02, 1]);
  const artOpacity = useTransform(progress, [0, 0.55, 0.82], [1, 0.85, 0]);

  const idX = useTransform(progress, [0, 0.72, 1], [-68, -22, 0]);
  const idY = useTransform(progress, [0, 0.72, 1], [28, 10, 0]);
  const idOpacity = useTransform(progress, [0, 0.6, 0.85], [1, 0.7, 0]);

  const certX = useTransform(progress, [0, 0.72, 1], [44, 14, 0]);
  const certY = useTransform(progress, [0, 0.72, 1], [56, 18, 0]);
  const certRotate = useTransform(progress, [0, 1], [-6, 0]);
  const certOpacity = useTransform(progress, [0, 0.58, 0.85], [1, 0.75, 0]);

  const chronoX = useTransform(progress, [0, 0.72, 1], [-40, -12, 0]);
  const chronoY = useTransform(progress, [0, 0.72, 1], [72, 24, 0]);
  const chronoOpacity = useTransform(progress, [0, 0.62, 0.88], [1, 0.65, 0]);

  const stampX = useTransform(progress, [0, 0.72, 1], [76, 24, 0]);
  const stampY = useTransform(progress, [0, 0.72, 1], [-36, -10, 0]);
  const stampRotate = useTransform(progress, [0, 1], [18, 0]);
  const stampOpacity = useTransform(progress, [0, 0.6, 0.88], [1, 0.8, 0]);

  const sigX = useTransform(progress, [0, 0.72, 1], [-56, -18, 0]);
  const sigY = useTransform(progress, [0, 0.72, 1], [96, 30, 0]);
  const sigOpacity = useTransform(progress, [0, 0.64, 0.9], [1, 0.6, 0]);

  const valueX = useTransform(progress, [0, 0.72, 1], [64, 20, 0]);
  const valueY = useTransform(progress, [0, 0.72, 1], [104, 32, 0]);
  const valueOpacity = useTransform(progress, [0, 0.66, 0.9], [1, 0.55, 0]);

  const recordOpacity = useTransform(progress, [0, 0.45, 0.78, 1], [0, 0.15, 0.92, 1]);
  const recordScale = useTransform(progress, [0.45, 1], [0.94, 1]);
  const recordY = useTransform(progress, [0.45, 1], [28, 0]);
  const fieldOpacity = useTransform(progress, [0, 0.35], [0.35, 0.08]);

  return (
    <div className="landing-hero-living relative mx-auto aspect-[4/5] w-full max-w-[34rem] sm:aspect-[5/6] lg:max-w-[38rem]">
      <motion.div
        className="landing-hero-living__field pointer-events-none absolute inset-[-8%]"
        style={{ opacity: fieldOpacity }}
        aria-hidden
      />

      <motion.div
        className="landing-hero-layer landing-hero-layer--art absolute left-[4%] top-[6%] z-20 h-[46%] w-[52%]"
        style={{ x: artX, y: artY, rotate: artRotate, scale: artScale, opacity: artOpacity }}
      >
        <div className="landing-art-crop landing-art-crop--accent h-full w-full">
          <LandingInstallationVisual
            variant="ember"
            composition="portrait"
            className="h-full w-full"
          />
        </div>
        <p className={`${landingType.meta} landing-hero-layer__caption mt-2`}>
          {t("landing.v2.visual.artworkEmber")}
        </p>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--id absolute right-[2%] top-[10%] z-30"
        style={{ x: idX, y: idY, opacity: idOpacity }}
      >
        <span className={landingType.signal}>{REGISTRY_ID}</span>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--cert absolute right-[0%] top-[38%] z-10 w-[48%]"
        style={{ x: certX, y: certY, rotate: certRotate, opacity: certOpacity }}
      >
        <div className="landing-archive-fragment landing-archive-fragment--cert p-4">
          <p className={landingType.meta}>{t("landing.v2.visual.layerCertificate")}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--landing-charcoal-muted)]">
            {t("landing.v2.visual.lineIssued")}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--chrono absolute left-[0%] top-[48%] z-20 max-w-[11rem]"
        style={{ x: chronoX, y: chronoY, opacity: chronoOpacity }}
      >
        <ul className="space-y-2">
          {(["landing.v2.showcase.layer1", "landing.v2.showcase.layer3"] as const).map((key) => (
            <li key={key} className="landing-chronology-chip flex items-center gap-2">
              <span className="landing-chronology-chip__pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--landing-charcoal-soft)]">
                {t(key)}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--stamp absolute right-[8%] top-[58%] z-40"
        style={{ x: stampX, y: stampY, rotate: stampRotate, opacity: stampOpacity }}
      >
        <div className="landing-emboss-stamp">
          <span className="landing-emboss-stamp__ring" />
          <span className="text-[8px] font-medium uppercase tracking-[0.22em] text-[var(--landing-ember)]">
            RR
          </span>
        </div>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--sig absolute bottom-[28%] left-[6%] z-30"
        style={{ x: sigX, y: sigY, opacity: sigOpacity }}
      >
        <p className="landing-signature-mark font-[var(--font-landing-display)] text-2xl italic text-[var(--landing-charcoal)]/55">
          RROWM
        </p>
      </motion.div>

      <motion.div
        className="landing-hero-layer landing-hero-layer--value absolute bottom-[18%] right-[4%] z-20"
        style={{ x: valueX, y: valueY, opacity: valueOpacity }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--landing-lime)]">
          {t("landing.v2.showcase.layer2")}
        </span>
      </motion.div>

      <motion.div
        className="landing-record-assembled absolute inset-x-[2%] bottom-[4%] top-[18%] z-50 flex flex-col justify-end p-6 md:p-8"
        style={{ opacity: recordOpacity, scale: recordScale, y: recordY }}
      >
        <div className="landing-archive-fragment landing-archive-fragment--record">
          <p className={landingType.signal}>{t("landing.v2.visual.layerRecord")}</p>
          <h2
            className={`${landingType.display} mt-4 text-[clamp(1.5rem,3vw,2rem)] leading-[1.05] text-[var(--landing-charcoal)]`}
          >
            {t("landing.v2.showcase.recordTitle")}
          </h2>
          <dl className="mt-6 grid gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--landing-charcoal-muted)]">
            <div className="flex justify-between gap-4 border-b border-black/[0.06] pb-2">
              <dt>{t("landing.v2.showcase.authorship")}</dt>
              <dd className="text-[var(--landing-charcoal)]">{t("landing.v2.showcase.authorshipValue")}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/[0.06] pb-2">
              <dt>{t("landing.v2.showcase.stewardship")}</dt>
              <dd className="text-[var(--landing-charcoal)]">{t("landing.v2.showcase.stewardshipValue")}</dd>
            </div>
          </dl>
          <p className={`${landingType.registryId} mt-6`}>{REGISTRY_ID}</p>
        </div>
      </motion.div>

      <div className="landing-paper-grain pointer-events-none absolute inset-0 z-[60] opacity-[0.18]" />
    </div>
  );
}
