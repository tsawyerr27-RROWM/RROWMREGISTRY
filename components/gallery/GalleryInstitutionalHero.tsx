"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { ArtworksHeroPreview } from "@/components/Dashboard/ArtworksHeroPreview";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldOrganisationHref } from "@/lib/field-nav";
import { fillMessage } from "@/lib/locale-messages";
import type { MessageKey } from "@/lib/locale-messages";
import { rrowmButton } from "@/styles/rrowm-theme";
import { studioV2 } from "@/styles/studio-v2";
import { publicPath } from "@/components/workspace/WorkspaceHeroPrimitives";

type HeroArtwork = {
  id: string;
  image_url?: string | null;
  title?: string | null;
  registry_id?: string | null;
};

type GallerySection = "catalogue" | "verification" | "invitations";

type Props = {
  orgName: string;
  slug: string;
  verified: boolean;
  location: string | null;
  subscriptionStatus: string | null;
  artworks: HeroArtwork[];
  worksOnFile: number;
  verifiedWorks: number;
  pendingVerification: number;
  artistsRepresented: number;
  certificatesIssued: number;
  activeDeals: number;
  participationPendingCount?: number;
  amendmentsPendingCount?: number;
  onGoToSection: (section: GallerySection) => void;
  onRegister: () => void;
  onInvite: () => void;
  isAdmin: boolean;
  onAboutWorkspace?: () => void;
  onGoToAmendments?: () => void;
};

const SUBSCRIPTION_KEYS: Record<string, MessageKey> = {
  grace: "gallery.hero.subscriptionGrace",
  active: "gallery.hero.subscriptionActive",
  inactive: "gallery.hero.subscriptionInactive",
  trial: "gallery.hero.subscriptionTrial",
};

function formatMetric(value: number): string {
  return Number.isFinite(value) ? String(value) : "-";
}

export function GalleryInstitutionalHero({
  orgName,
  slug,
  verified,
  location,
  subscriptionStatus,
  artworks,
  worksOnFile,
  verifiedWorks,
  pendingVerification,
  artistsRepresented,
  certificatesIssued,
  activeDeals,
  participationPendingCount = 0,
  amendmentsPendingCount = 0,
  onGoToSection,
  onRegister,
  onInvite,
  isAdmin,
  onAboutWorkspace,
  onGoToAmendments,
}: Props) {
  const { t } = useLocalePreferences();
  const subscriptionKey = String(subscriptionStatus || "")
    .toLowerCase()
    .trim();
  const subscriptionLabel = SUBSCRIPTION_KEYS[subscriptionKey]
    ? t(SUBSCRIPTION_KEYS[subscriptionKey])
    : subscriptionStatus?.trim() || null;
  const publicHref = fieldOrganisationHref(slug);
  const path = publicPath(publicHref);

  const primaryMetrics = [
    { label: t("gallery.organisation.metric.worksOnFile"), value: worksOnFile },
    { label: t("gallery.organisation.metric.verifiedWorks"), value: verifiedWorks },
    { label: t("gallery.organisation.metric.pendingVerification"), value: pendingVerification },
  ];

  const secondaryMetrics = [
    { label: t("gallery.organisation.metric.artistsRepresented"), value: artistsRepresented },
    { label: t("gallery.organisation.metric.certificatesIssued"), value: certificatesIssued },
    { label: t("gallery.organisation.metric.activeDeals"), value: activeDeals },
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
                {t("gallery.organisation.rail")}
              </span>
              <span className="studio-execution-stamp studio-execution-stamp--active">
                {t("gallery.organisation.stamp")}
              </span>
              <span
                className={`studio-execution-stamp ${
                  verified ? "studio-execution-stamp--active" : ""
                }`}
              >
                {verified
                  ? t("gallery.hero.institutionVerified")
                  : t("gallery.hero.verificationPending")}
              </span>
              {subscriptionLabel ? (
                <span className="v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-cool-grey)]">
                  {subscriptionLabel}
                </span>
              ) : null}
            </p>

            <h1 className={`${studioV2.type.commandTitle} mt-4 md:mt-5`}>{orgName}</h1>
            {location ? (
              <p className="mt-2 text-sm text-[var(--v2-ink-muted)]">{location}</p>
            ) : null}
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--v2-ink-muted)] md:text-[15px]">
              {t("gallery.organisation.subtitle")}
            </p>

            <p className="mt-4 v2-type-mono text-[10px] tracking-[0.12em] text-[var(--v2-cool-grey)]">
              {fillMessage(t("gallery.organisation.statusLine"), {
                works: String(worksOnFile),
                verified: String(verifiedWorks),
                pending: String(pendingVerification),
              })}
            </p>

            <div className="mt-8 space-y-3">
              <dl className="studio-reveal-stagger grid grid-cols-3 gap-2 sm:gap-2.5">
                {primaryMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    style={{ "--reveal-index": index } as CSSProperties}
                    className="rounded-lg border border-[var(--v2-border-strong)] bg-white px-3 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_28px_-22px_rgba(15,23,42,0.18)] sm:px-3.5 sm:py-4"
                  >
                    <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                      {metric.label}
                    </dt>
                    <dd className="mt-2 font-serif text-[1.65rem] tabular-nums leading-none tracking-tight text-[var(--v2-ink)] sm:text-[2rem]">
                      {formatMetric(metric.value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <dl className="studio-reveal-stagger grid grid-cols-3 gap-2 sm:gap-2.5">
                {secondaryMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    style={{ "--reveal-index": index + 3 } as CSSProperties}
                    className="rounded-lg border border-[var(--v2-border)] bg-white/80 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:px-3"
                  >
                    <dt className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                      {metric.label}
                    </dt>
                    <dd className="mt-1.5 font-serif text-lg tabular-nums leading-none text-[var(--v2-ink-soft)] sm:text-xl">
                      {formatMetric(metric.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {(participationPendingCount > 0 || amendmentsPendingCount > 0) &&
            typeof onGoToAmendments === "function" ? (
              <div className="mt-5 space-y-2">
                {participationPendingCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => onGoToSection("invitations")}
                    className="w-full rounded-lg border border-[var(--v2-border-strong)] bg-white/85 px-3 py-2.5 text-left v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink-muted)] transition hover:bg-white"
                  >
                    {participationPendingCount}{" "}
                    {t("gallery.hero.mayDeepen")}
                  </button>
                ) : null}
                {amendmentsPendingCount > 0 ? (
                  <button
                    type="button"
                    onClick={onGoToAmendments}
                    className="w-full rounded-lg border border-[var(--v2-amber-exception-dim)] bg-[var(--v2-amber-exception-dim)]/20 px-3 py-2.5 text-left v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-ink)] transition hover:bg-[var(--v2-amber-exception-dim)]/30"
                  >
                    {fillMessage(t("gallery.hero.openAmendments"), {
                      count: String(amendmentsPendingCount),
                    })}
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--v2-border)] pt-6">
              <button type="button" onClick={onRegister} className={rrowmButton.primaryEconomic}>
                {t("gallery.hero.registerWork")}
              </button>
              <button
                type="button"
                onClick={() => onGoToSection("verification")}
                className={rrowmButton.secondary}
              >
                {t("gallery.hero.trustAndCerts")}
              </button>
              <button
                type="button"
                onClick={() => onGoToSection("catalogue")}
                className={rrowmButton.secondary}
              >
                {t("gallery.hero.openCatalogue")}
              </button>
              {isAdmin ? (
                <button type="button" onClick={onInvite} className={rrowmButton.secondary}>
                  {t("gallery.hero.inviteToAuthenticate")}
                </button>
              ) : null}
              <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--v2-ink-muted)] sm:ml-auto sm:w-auto">
                {typeof onAboutWorkspace === "function" ? (
                  <button
                    type="button"
                    onClick={onAboutWorkspace}
                    className="transition hover:text-[var(--v2-ink)]"
                  >
                    {t("gallery.hero.aboutWorkspace")}
                  </button>
                ) : null}
                <Link href={publicHref} className="transition hover:text-[var(--v2-ink)]">
                  {t("gallery.hero.publicPage")}
                </Link>
                <Link href="/studio/account" className="transition hover:text-[var(--v2-ink)]">
                  {t("gallery.hero.account")}
                </Link>
              </div>
            </div>

            <p className="mt-4 v2-type-mono text-[10px] tracking-[0.1em] text-[var(--v2-cool-grey)]">
              {t("gallery.organisation.publicPath")}{" "}
              <span className="text-[var(--v2-ink-soft)]">{path}</span>
            </p>
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <div className={`${studioV2.surface.filingSheet} w-full max-w-[min(100%,20rem)] p-5`}>
              <p className="v2-type-mono text-[9px] uppercase tracking-[0.18em] text-[var(--v2-ink-muted)]">
                {t("gallery.organisation.preview")}
              </p>
              <div className="mt-4 flex justify-center">
                <ArtworksHeroPreview
                  artworks={artworks}
                  variant="editorial"
                  pick="latest"
                  tone="light"
                />
              </div>
              {artworks.length === 0 ? (
                <p className="mt-5 text-center text-xs leading-relaxed text-[var(--v2-ink-muted)]">
                  {t("gallery.hero.previewEmpty")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
