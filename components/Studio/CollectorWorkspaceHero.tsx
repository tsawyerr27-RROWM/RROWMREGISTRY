"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { RegistryCatalogueInfoTooltip } from "@/components/Registry/RegistryCatalogueInfoTooltip";
import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import { studioV2 } from "@/styles/studio-v2";
import { publicPath } from "@/components/workspace/WorkspaceHeroPrimitives";

type PreviewArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

export type CollectorArchiveMetrics = {
  holdings: number;
  verified: number;
  transfers: number;
  certificates: number;
};

export type CollectorWorkspaceSnapshot = {
  attentionCount: number;
  profilePublic: boolean;
  anonymousOnPublic: boolean;
};

type Props = {
  displayName: string;
  location: string | null;
  publicPageHref: string | null;
  previewArtworks: PreviewArtwork[];
  metrics: CollectorArchiveMetrics;
  snapshot: CollectorWorkspaceSnapshot;
  onGoToSection: (section: "works" | "attention") => void;
};

function formatMetric(value: number): string {
  return Number.isFinite(value) ? String(value) : "-";
}

export function CollectorWorkspaceHero({
  displayName,
  location,
  publicPageHref,
  previewArtworks,
  metrics,
  snapshot,
  onGoToSection,
}: Props) {
  const { t } = useLocalePreferences();
  const stewardName = displayName.trim() || t("collector.hero.fallbackCollection");
  const path = publicPageHref ? publicPath(publicPageHref) : null;

  const metricTiles = [
    { label: t("collector.archive.metric.holdings"), value: metrics.holdings },
    { label: t("collector.archive.metric.verified"), value: metrics.verified },
    { label: t("collector.archive.metric.transfers"), value: metrics.transfers },
    { label: t("collector.archive.metric.certificates"), value: metrics.certificates },
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
                {t("collector.archive.rail")}
              </span>
              <span className="studio-execution-stamp studio-execution-stamp--active">
                {t("collector.archive.stamp")}
              </span>
            </p>

            <h1 className={`${studioV2.type.commandTitle} mt-4 md:mt-5`}>
              {t("collector.archive.title")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--v2-ink-muted)] md:text-[15px]">
              {t("collector.archive.subtitle")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  snapshot.profilePublic
                    ? "border border-[var(--v2-lime-pulse-dim)] bg-[var(--v2-lime-pulse-dim)]/25 text-[var(--v2-ink)]"
                    : "border border-[var(--v2-border)] bg-white/70 text-[var(--v2-ink-muted)]"
                }`}
              >
                {t("collector.hero.profile")}{" "}
                {snapshot.profilePublic ? t("collector.hero.on") : t("collector.hero.off")}
              </span>
              <span className="v2-type-mono text-[10px] tracking-[0.12em] text-[var(--v2-ink-muted)]">
                {t("collector.archive.steward")} · {stewardName}
                {location ? ` · ${location}` : ""}
              </span>
            </div>

            <dl className="studio-reveal-stagger mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {metricTiles.map((metric, index) => (
                <div
                  key={metric.label}
                  style={{ "--reveal-index": index } as CSSProperties}
                  className="rounded-lg border border-[var(--v2-border)] bg-white/85 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
                >
                  <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                    {metric.label}
                  </dt>
                  <dd className="mt-1.5 font-serif text-2xl tabular-nums leading-none tracking-tight text-[var(--v2-ink)]">
                    {formatMetric(metric.value)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--v2-border)] pt-6">
              <button
                type="button"
                onClick={() => onGoToSection("works")}
                className="v2-cta-primary min-h-[44px] px-6 py-2.5 text-xs"
              >
                {t("collector.hero.viewWorks")}
              </button>
              {snapshot.attentionCount > 0 ? (
                <button
                  type="button"
                  onClick={() => onGoToSection("attention")}
                  className="v2-cta-secondary min-h-[44px] px-6 py-2.5 text-xs"
                >
                  {fillMessage(t("collector.hero.openAttention"), {
                    count: String(snapshot.attentionCount),
                  })}
                </button>
              ) : null}
              <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--v2-ink-muted)] sm:ml-auto sm:w-auto">
                <Link href="/studio/account" className="transition hover:text-[var(--v2-ink)]">
                  {t("nav.account")}
                </Link>
                <RegistryCatalogueInfoTooltip theme="light" />
                <Link
                  href={fieldExplorerRecordsHref()}
                  className="transition hover:text-[var(--v2-ink)]"
                >
                  {t("collector.hero.registry")}
                </Link>
              </div>
            </div>

            {publicPageHref ? (
              <p className="mt-4 v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-cool-grey)]">
                {t("collector.archive.publicPath")}{" "}
                <span className="text-[var(--v2-ink-soft)]">{path}</span>
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <div className={`${studioV2.surface.filingSheet} w-full max-w-[min(100%,20rem)] p-5`}>
              <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("collector.archive.preview")}
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
                  {t("collector.hero.previewEmpty")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
