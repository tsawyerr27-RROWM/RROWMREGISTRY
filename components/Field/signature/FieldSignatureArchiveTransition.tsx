"use client";

import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldSignature } from "@/styles/field-signature";

export function FieldSignatureArchiveTransition() {
  const { t } = useLocalePreferences();

  return (
    <div className={fieldSignature.surfaces.paperTransition} aria-hidden={false}>
      <div className="mx-auto w-full max-w-[min(100%,88rem)] px-4 py-10 sm:px-6 lg:px-8">
        <p className={`${fieldSignature.type.slabMeta} text-center`}>
          {t("field.signature.archive.kicker")}
        </p>
        <div className="field-signature-paper-transition__rule mx-auto mt-4 max-w-md">
          <span className="field-signature-paper-transition__index-label">
            {t("field.signature.archive.indexBridge")}
          </span>
        </div>
      </div>
    </div>
  );
}
