"use client";

import { useEffect, useState } from "react";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useFieldMotion } from "@/hooks/useFieldMotion";
import { emitFieldIntelEvent } from "@/lib/field-intelligence-events";
import type { FieldInsight } from "@/lib/field-insight-engine";
import { fieldSignature } from "@/styles/field-signature";

type Props = {
  insights: FieldInsight[];
};

function rotationDelayMs(): number {
  return 8000 + Math.floor(Math.random() * 4000);
}

export function FieldInsightTicker({ insights }: Props) {
  const { t } = useLocalePreferences();
  const { motionEnabled } = useFieldMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const active = insights[index] ?? insights[0];

  useEffect(() => {
    if (!motionEnabled || insights.length <= 1) return;

    let swapTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      swapTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          setIndex((prev) => (prev + 1) % insights.length);
          setVisible(true);
          schedule();
        }, 220);
      }, rotationDelayMs());
    };

    schedule();

    return () => {
      if (swapTimer) clearTimeout(swapTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [motionEnabled, insights.length]);

  useEffect(() => {
    const current = insights[index];
    if (!current || current.severity === "normal") return;
    emitFieldIntelEvent({ type: "signal_alert", severity: current.severity });
  }, [index, insights]);

  if (!active) return null;

  return (
    <div
      className={`field-signature-insight-ticker${visible ? " field-signature-insight-ticker--visible" : ""}${active.severity !== "normal" ? ` field-signature-insight-ticker--${active.severity}` : ""}`}
      aria-live="polite"
      aria-atomic
    >
      <p className={fieldSignature.type.terminalMono}>{t("field.signature.insight.label")}</p>
      <div className="field-signature-insight-ticker__copy mt-1">
        <p className="field-signature-insight-ticker__headline">{active.headline}</p>
        <p className="field-signature-insight-ticker__body">{active.body}</p>
      </div>
    </div>
  );
}
