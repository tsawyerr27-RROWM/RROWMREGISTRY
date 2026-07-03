"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { FieldExplorerHubContentFallback } from "@/components/Field/FieldExplorerSuspenseFallbacks";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { useFieldIntelligence } from "@/hooks/useFieldIntelligence";
import { fieldSignature } from "@/styles/field-signature";

import { FieldSignatureArchiveNav } from "./FieldSignatureArchiveNav";
import { FieldSignatureHubSearch } from "./FieldSignatureHubSearch";

function FieldSignatureExplorerRailInner() {
  const searchParams = useSearchParams();
  const { t } = useLocalePreferences();
  const { searchFocus } = useFieldIntelligence();
  const initialQuery = searchParams.get("q")?.trim() ?? "";

  return (
    <FieldV2Container className="pb-16 md:pb-20">
      <section
        className={`${fieldSignature.surfaces.archiveRail}${searchFocus ? " field-signature-archive-rail--query" : ""}`}
        aria-label={t("field.signature.archive.railAria")}
      >
        <header className="field-signature-archive-rail__header">
          <p className={fieldSignature.type.slabMeta}>{t("field.signature.archive.kicker")}</p>
          <h2 className={`${fieldSignature.type.archiveRailTitle} mt-2`}>
            {t("field.signature.archive.searchTitle")}
          </h2>
        </header>

        <div className="mt-6">
          <FieldSignatureHubSearch initialQuery={initialQuery} />
        </div>

        <div className="field-signature-archive-rail__rule" aria-hidden />

        <FieldSignatureArchiveNav />
      </section>
    </FieldV2Container>
  );
}

export function FieldSignatureExplorerRail() {
  return (
    <Suspense fallback={<FieldExplorerHubContentFallback />}>
      <FieldSignatureExplorerRailInner />
    </Suspense>
  );
}
