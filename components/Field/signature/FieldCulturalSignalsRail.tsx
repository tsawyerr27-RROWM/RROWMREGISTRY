"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import type { FieldCulturalSignals } from "@/lib/fetch-field-cultural-signals";
import { fillMessage } from "@/lib/locale-messages";
import { fieldSignature } from "@/styles/field-signature";

type Props = {
  cultural: FieldCulturalSignals;
};

type SignalItem = {
  key: string;
  labelKey:
    | "field.signature.signals.newRecords"
    | "field.signature.signals.verifications"
    | "field.signature.signals.transfers"
    | "field.signature.signals.openCalls";
  value: string;
};

function formatMetric(value: number | null, locale: string): string {
  if (value === null) return "-";
  return value.toLocaleString(locale);
}

export function FieldCulturalSignalsRail({ cultural }: Props) {
  const { t, region } = useLocalePreferences();
  const { signals } = cultural;

  const items: SignalItem[] = [
    {
      key: "new-records",
      labelKey: "field.signature.signals.newRecords",
      value: fillMessage(t("field.signature.signals.newRecordsValue"), {
        count: formatMetric(signals.newRecords7d, region.locale),
      }),
    },
    {
      key: "verifications",
      labelKey: "field.signature.signals.verifications",
      value: fillMessage(t("field.signature.signals.verificationsValue"), {
        count: formatMetric(signals.verificationPending, region.locale),
      }),
    },
    {
      key: "transfers",
      labelKey: "field.signature.signals.transfers",
      value: fillMessage(t("field.signature.signals.transfersValue"), {
        count: formatMetric(signals.transfersActive7d, region.locale),
      }),
    },
    {
      key: "open-calls",
      labelKey: "field.signature.signals.openCalls",
      value: fillMessage(t("field.signature.signals.openCallsValue"), {
        count: formatMetric(signals.closingSoon72h, region.locale),
      }),
    },
  ];

  return (
    <section
      className="field-signature-signals-rail"
      aria-label={t("field.signature.signals.aria")}
    >
      <div className="field-signature-signals-rail__inner mx-auto max-w-[min(100%,88rem)] px-4 sm:px-6 lg:px-8">
        <div className="field-signature-signals-rail__track">
          <div className="field-signature-signals-rail__label">
            <p className={fieldSignature.type.terminalMono}>
              {t("field.signature.signals.label")}
            </p>
          </div>

          {items.map((item, index) => (
            <div key={item.key} className="field-signature-signals-rail__item">
              {index > 0 ? (
                <span className="field-signature-signals-rail__sep" aria-hidden />
              ) : null}
              <div className="field-signature-signals-rail__metric">
                <p className={fieldSignature.type.terminalMono}>{t(item.labelKey)}</p>
                <p className="field-signature-signals-rail__value">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
