"use client";

import { motion } from "framer-motion";

import { FieldSignalCanvas } from "@/components/Field/signature/FieldSignalCanvas";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useFieldHeroIntel } from "@/hooks/useFieldHeroIntel";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { useFieldMotion } from "@/hooks/useFieldMotion";
import { fillMessage } from "@/lib/locale-messages";
import { fieldSignature } from "@/styles/field-signature";

const HERO_NODES = [
  { top: "18%", left: "12%", delay: 0 },
  { top: "34%", left: "78%", delay: 1.2 },
  { top: "52%", left: "24%", delay: 2.4 },
  { top: "28%", left: "56%", delay: 3.6 },
  { top: "62%", left: "68%", delay: 4.8 },
  { top: "44%", left: "88%", delay: 6 },
] as const;

export function FieldSignatureHero() {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useFieldMotion();
  const { coords, signalPct } = useFieldHeroIntel();
  const { activeCluster, searchFocus } = useFieldIntelligence();
  const coordsIntel = Boolean(activeCluster || searchFocus);

  const content = (
    <>
      <p className={`${fieldSignature.type.terminalMono} opacity-70`}>
        {t("field.signature.hero.kicker")}
      </p>
      <h1
        id="field-signature-hero-title"
        className={`${fieldSignature.type.heroDisplay} mt-5 max-w-[15ch]`}
      >
        {t("field.signature.hero.title")}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--field-signature-hero-muted)] md:text-lg">
        {t("field.signature.hero.lede")}
      </p>
    </>
  );

  return (
    <section
      className={`${fieldSignature.surfaces.darkHero} relative flex min-h-[100dvh] flex-col justify-end overflow-hidden`}
      aria-labelledby="field-signature-hero-title"
    >
      <div className="field-signature-dark-hero__base" aria-hidden />
      <div className="field-signature-dark-hero__halftone" aria-hidden />
      <div className="field-signature-dark-hero__grain" aria-hidden />
      <div className="field-signature-dark-hero__scan" aria-hidden />
      <div className="field-signature-dark-hero__accent field-signature-dark-hero__accent--cobalt" aria-hidden />
      <div className="field-signature-dark-hero__accent field-signature-dark-hero__accent--lime" aria-hidden />
      <div className="field-signature-dark-hero__accent field-signature-dark-hero__accent--ember" aria-hidden />

      <FieldSignalCanvas />

      <div className="field-signature-hero-system" aria-hidden>
        <div className="field-signature-hero-rails">
          <span className="field-signature-hero-rail field-signature-hero-rail--h field-signature-hero-rail--top" />
          <span className="field-signature-hero-rail field-signature-hero-rail--h field-signature-hero-rail--mid" />
          <span className="field-signature-hero-rail field-signature-hero-rail--v field-signature-hero-rail--left" />
          <span className="field-signature-hero-rail field-signature-hero-rail--v field-signature-hero-rail--right" />
          <span className="field-signature-hero-tick field-signature-hero-tick--a" />
          <span className="field-signature-hero-tick field-signature-hero-tick--b" />
          <span className="field-signature-hero-tick field-signature-hero-tick--c" />
        </div>

        <div className={`${fieldSignature.type.coord} field-signature-hero-coords${coordsIntel ? " field-signature-hero-coords--intel" : ""}`}>
          {coords.map((coord, index) => (
            <span key={index}>{coord}</span>
          ))}
        </div>

        <p className={`${fieldSignature.type.coord} field-signature-hero-signal`}>
          {fillMessage(t("field.signature.hero.signalReadout"), { pct: signalPct })}
        </p>

        <svg
          className="field-signature-hero-node-links"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line x1="12" y1="18" x2="56" y2="28" />
          <line x1="56" y1="28" x2="78" y2="34" />
          <line x1="24" y1="52" x2="56" y2="28" />
          <line x1="68" y1="62" x2="78" y2="34" />
        </svg>

        {HERO_NODES.map((node, index) => (
          <span
            key={index}
            className={`field-signature-hero-node ${
              motionEnabled ? fieldSignature.motion.nodePulse : ""
            }`}
            style={
              {
                top: node.top,
                left: node.left,
                animationDelay: `${node.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,88rem)] px-4 pb-16 pt-24 sm:px-6 md:pb-20 md:pt-28 lg:px-8">
        {motionEnabled ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
          </motion.div>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
