"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { RrowmLogo } from "@/components/brand/RrowmLogo";
import { DashboardNavLink } from "@/components/DashboardNavLink";
import { FooterRegionSelector } from "@/components/LandingPage/FooterRegionSelector";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import type { MessageKey } from "@/lib/locale-messages";
import type { RegionId } from "@/lib/regions";
import { landingGutterXClass } from "@/styles/landing-redesign";

export function Footer() {
  const { regionId, setRegionId, t } = useLocalePreferences();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      data-rrowm-chrome-suppress-invite-signup
      className="archive-footer relative overflow-hidden"
    >
      {isHome ? (
        <section
          className={`archive-footer__closing relative overflow-hidden pb-16 pt-24 md:pb-20 md:pt-28 ${landingGutterXClass}`}
          aria-labelledby="landing-footer-closing"
        >
          <div className="archive-footer__scan pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
          <div className="relative mx-auto max-w-[min(100%,76rem)]">
            <h2
              id="landing-footer-closing"
              className="max-w-[18ch] font-serif text-[clamp(2.5rem,5.5vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.03em] text-[var(--v2-paper-bone,#f4efe6)]"
            >
              {t("landing.v2.footer.closing")}
            </h2>
          </div>
        </section>
      ) : null}

      <div className={`archive-footer__surface pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-12 md:pb-16 md:pt-14 ${landingGutterXClass}`}>
        <div className="archive-footer__grid pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
        <div className="relative mx-auto w-full max-w-[min(100%,76rem)]">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="max-w-md lg:max-w-sm">
              <Link href="/" className="inline-flex shrink-0" aria-label="RROWM home">
                <RrowmLogo
                  variant="mark"
                  sizes="88px"
                  className="rrowm-logo-crisp--on-dark h-[88px] w-[88px] shrink-0"
                />
              </Link>
            </div>

            <ArchiveFooterNav t={t} />
          </div>

          <ArchiveFooterMeta regionId={regionId} setRegionId={setRegionId} t={t} />
        </div>
      </div>
    </footer>
  );
}

function ArchiveFooterNav({
  t,
}: {
  t: (key: MessageKey) => string;
}) {
  const linkClass =
    "w-fit text-sm text-white/50 transition duration-300 ease-out hover:text-white/90";

  const columnHeading = "v2-type-mono text-[9px] uppercase tracking-[0.22em] text-white/35";

  return (
    <nav
      className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-4 lg:gap-x-10"
      aria-label="Footer"
    >
      <div className="flex flex-col gap-3">
        <span className={columnHeading}>{t("footer.surfaces")}</span>
        <Link href="/studio/creative" className={linkClass}>
          {t("footer.studio")}
        </Link>
        <a href={fieldExplorerRecordsHref()} className={linkClass}>
          {t("footer.registry")}
        </a>
        <Link href="/field" className={linkClass}>
          {t("footer.field")}
        </Link>
        <Link href="/studio/deals" className={linkClass}>
          {t("footer.deals")}
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <span className={columnHeading}>{t("footer.infrastructure")}</span>
        <Link href="/field/verify" className={linkClass}>
          {t("footer.verification")}
        </Link>
        <a href={fieldExplorerRecordsHref()} className={linkClass}>
          {t("footer.certificates")}
        </a>
        <Link href="/studio/collector" className={linkClass}>
          {t("footer.ownership")}
        </Link>
        <Link href="/studio/rights" className={linkClass}>
          {t("footer.rightsLedger")}
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <span className={columnHeading}>{t("footer.legal")}</span>
        <Link href="/privacy" className={linkClass}>
          {t("footer.privacy")}
        </Link>
        <Link href="/terms" className={linkClass}>
          {t("footer.terms")}
        </Link>
        <Link href="/disclaimer" className={linkClass}>
          {t("footer.disclaimer")}
        </Link>
        <Link href="/about" className={linkClass}>
          {t("footer.about")}
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <span className={columnHeading}>{t("footer.social")}</span>
        <a
          href="https://instagram.com/RROWM_"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {t("footer.instagram")}
        </a>
        <a
          href="https://twitter.com/RROWM_"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {t("footer.twitter")}
        </a>
        <Link href="/login" className={linkClass}>
          {t("footer.signIn")}
        </Link>
        <DashboardNavLink className={linkClass}>{t("footer.account")}</DashboardNavLink>
      </div>
    </nav>
  );
}

function ArchiveFooterMeta({
  regionId,
  setRegionId,
  t,
}: {
  regionId: RegionId;
  setRegionId: (id: RegionId) => void;
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="mt-14 border-t border-white/[0.08] pt-8">
      <p className="v2-type-mono text-center text-[10px] uppercase tracking-[0.2em] text-white/40 sm:text-left">
        {t("footer.systemRail")}
      </p>

      <div className="mt-8 grid gap-8 text-xs text-white/40 md:grid-cols-3 md:items-end md:gap-10">
        <p>
          © {new Date().getFullYear()} RROWM. {t("footer.copyright")}
        </p>
        <div className="flex flex-col gap-1.5 md:max-w-xs">
          <p id="footer-region-label" className="text-sm font-medium text-white/50">
            {t("footer.regionLabel")}
          </p>
          <FooterRegionSelector
            regionId={regionId}
            onRegionChange={setRegionId}
            labelId="footer-region-label"
          />
        </div>
        <p className="text-white/30 md:text-right">{t("footer.tagline")}</p>
      </div>
    </div>
  );
}
