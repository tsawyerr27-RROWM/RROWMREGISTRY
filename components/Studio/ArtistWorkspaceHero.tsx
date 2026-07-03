"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { rrowmButton } from "@/styles/rrowm-theme";
import { studioV2 } from "@/styles/studio-v2";
import { publicPath } from "@/components/workspace/WorkspaceHeroPrimitives";

type PreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

type StudioSection = "Artworks" | "Certificates" | "Ownership";

type Props = {
  displayName: string;
  totalWorks: number;
  verifiedWorks: number;
  pricedWorks: number;
  pendingActionCount: number;
  previewArtworks: PreviewArtwork[];
  publicPageHref: string | null;
  onGoToSection: (section: StudioSection) => void;
  onRegister?: () => void;
  representationPendingCount?: number;
  onGoToRepresentationReview?: () => void;
  amendmentResponsesNeeded?: number;
  onGoToAmendments?: () => void;
};

function formatMetric(value: number): string {
  return Number.isFinite(value) ? String(value) : "-";
}

export function ArtistWorkspaceHero({
  displayName,
  totalWorks,
  verifiedWorks,
  pricedWorks,
  pendingActionCount,
  previewArtworks,
  publicPageHref,
  onGoToSection,
  onRegister,
  representationPendingCount = 0,
  onGoToRepresentationReview,
  amendmentResponsesNeeded = 0,
  onGoToAmendments,
}: Props) {
  const { t } = useLocalePreferences();
  const headline = displayName.trim() || t("studio.hero.fallbackArtist");
  const path = publicPageHref ? publicPath(publicPageHref) : null;

  const primaryMetrics = [
    { label: t("studio.creative.metric.worksOnFile"), value: totalWorks },
    { label: t("studio.hero.verified"), value: verifiedWorks },
  ];

  const secondaryMetrics = [
    { label: t("studio.hero.priced"), value: pricedWorks },
    { label: t("studio.creative.metric.pendingAction"), value: pendingActionCount },
  ];

  return (
    <section className={`studio-reveal ${studioV2.scope} -mt-1`}>
      <div
        className={`${studioV2.surface.filingSheetMajor} relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8 md:px-9 md:py-9`}
      >
        <div className="relative z-[1] grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="flex flex-wrap items-center gap-2">
              <span className={`${studioV2.type.railLabel} text-[var(--v2-ink-muted)]`}>
                {t("studio.creative.rail")}
              </span>
              <span className="studio-execution-stamp studio-execution-stamp--active">
                {t("studio.creative.stamp")}
              </span>
            </p>

            <h1 className={`${studioV2.type.commandTitle} mt-4 md:mt-5`}>{headline}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--v2-ink-muted)] md:text-[15px]">
              {t("studio.creative.subtitle")}
            </p>

            <p className="mt-4 v2-type-mono text-[10px] tracking-[0.12em] text-[var(--v2-cool-grey)]">
              {fillMessage(t("studio.creative.statusLine"), {
                works: String(totalWorks),
                verified: String(verifiedWorks),
                attention: String(pendingActionCount),
              })}
            </p>

            <div className="mt-8 space-y-3">
              <dl className="studio-reveal-stagger grid grid-cols-2 gap-2.5 sm:gap-3">
                {primaryMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    style={{ "--reveal-index": index } as CSSProperties}
                    className="rounded-lg border border-[var(--v2-border-strong)] bg-white px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] sm:px-4 sm:py-4"
                  >
                    <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                      {metric.label}
                    </dt>
                    <dd className="mt-2 font-serif text-[2rem] tabular-nums leading-none tracking-tight text-[var(--v2-ink)] sm:text-[2.15rem]">
                      {formatMetric(metric.value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <dl className="studio-reveal-stagger grid grid-cols-2 gap-2 sm:gap-2.5">
                {secondaryMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    style={{ "--reveal-index": index + 2 } as CSSProperties}
                    className="rounded-lg border border-[var(--v2-border)] bg-white/80 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                  >
                    <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                      {metric.label}
                    </dt>
                    <dd className="mt-1.5 font-serif text-xl tabular-nums leading-none text-[var(--v2-ink-soft)]">
                      {formatMetric(metric.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {(representationPendingCount > 0 && onGoToRepresentationReview) ||
            (amendmentResponsesNeeded > 0 && onGoToAmendments) ? (
              <div className="mt-5 space-y-2">
                {representationPendingCount > 0 && onGoToRepresentationReview ? (
                  <button
                    type="button"
                    onClick={onGoToRepresentationReview}
                    className="w-full rounded-lg border border-[var(--v2-amber-exception-dim)] bg-[var(--v2-amber-exception-dim)]/20 px-3 py-2.5 text-left v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink)] transition hover:bg-[var(--v2-amber-exception-dim)]/30"
                  >
                    {fillMessage(
                      t(
                        representationPendingCount === 1
                          ? "studio.hero.recordsToDeepen"
                          : "studio.hero.recordsToDeepenPlural"
                      ),
                      { count: String(representationPendingCount) }
                    )}
                  </button>
                ) : null}
                {amendmentResponsesNeeded > 0 && onGoToAmendments ? (
                  <button
                    type="button"
                    onClick={onGoToAmendments}
                    className="w-full rounded-lg border border-[var(--v2-border-strong)] bg-white/85 px-3 py-2.5 text-left v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-muted)] transition hover:bg-white"
                  >
                    {fillMessage(
                      t(
                        amendmentResponsesNeeded === 1
                          ? "studio.hero.amendmentNeedsResponse"
                          : "studio.hero.amendmentsNeedResponse"
                      ),
                      { count: String(amendmentResponsesNeeded) }
                    )}
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--v2-border)] pt-6">
              {typeof onRegister === "function" ? (
                <button type="button" onClick={onRegister} className={rrowmButton.primaryEconomic}>
                  {t("studio.registerArtwork")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onGoToSection("Artworks")}
                className={rrowmButton.secondary}
              >
                {t("studio.hero.openArtworks")}
              </button>
              <button
                type="button"
                onClick={() => onGoToSection("Certificates")}
                className={rrowmButton.secondary}
              >
                {t("studio.hero.certificates")}
              </button>
              <button
                type="button"
                onClick={() => onGoToSection("Ownership")}
                className={rrowmButton.secondary}
              >
                {t("studio.hero.ownershipLedger")}
              </button>
              <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--v2-ink-muted)] sm:ml-auto sm:w-auto">
                <Link href="/studio/account" className="transition hover:text-[var(--v2-ink)]">
                  {t("nav.account")}
                </Link>
                <RegistryCatalogueInfoTooltip theme="light" />
                <Link
                  href={fieldExplorerRecordsHref()}
                  className="transition hover:text-[var(--v2-ink)]"
                >
                  {t("nav.registry")}
                </Link>
              </div>
            </div>

            {publicPageHref ? (
              <p className="mt-4 v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-cool-grey)]">
                {t("studio.creative.publicPath")}{" "}
                <span className="text-[var(--v2-ink-soft)]">{path}</span>
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <div className={`${studioV2.surface.filingSheet} w-full max-w-[min(100%,20rem)] p-5`}>
              <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("studio.creative.preview")}
              </p>
              <div className="mt-4 flex justify-center">
                <ArtworksHeroPreview
                  artworks={previewArtworks}
                  variant="editorial"
                  pick="latest"
                  tone="light"
                />
              </div>
              {previewArtworks.length === 0 ? (
                <p className="mt-5 text-center text-xs leading-relaxed text-[var(--v2-ink-muted)]">
                  {t("studio.hero.previewEmpty")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
