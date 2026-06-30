"use client";

import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { RrowmLogo } from "@/components/brand/RrowmLogo";
import { usePathname } from "next/navigation";
import { DashboardNavLink } from "@/components/DashboardNavLink";
import { FooterRegionSelector } from "@/components/LandingPage/FooterRegionSelector";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import type { RegionId } from "@/lib/regions";

const landingDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-landing-display",
  display: "swap",
});

export function Footer() {
  const { regionId, setRegionId, t } = useLocalePreferences();
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <footer data-rrowm-chrome-suppress-invite-signup className={`rrowm-landing ${landingDisplay.variable}`}>
        <section
          className="landing-footer-closing relative overflow-hidden px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36 lg:px-[max(2rem,calc((100vw-72rem)/2+1.5rem))]"
          aria-labelledby="landing-footer-closing"
        >
          <div className="landing-paper-grain pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[min(40vw,20rem)] opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(26, 75, 255, 0.14) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[min(100%,76rem)]">
            <p className="font-mono text-[10px] font-normal uppercase tracking-[0.24em] text-white/45">
              RROWM
            </p>
            <h2
              id="landing-footer-closing"
              className="mt-8 max-w-[18ch] font-[var(--font-landing-display)] text-[clamp(2.5rem,5.5vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.03em] text-[var(--landing-ivory)]"
            >
              {t("landing.v2.footer.closing")}
            </h2>
          </div>
        </section>

        <div className="landing-footer-surface px-6 pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-12 md:px-10 md:pb-16 md:pt-14 lg:px-[max(2rem,calc((100vw-72rem)/2+1.5rem))]">
          <div className="mx-auto w-full max-w-[min(100%,76rem)]">
            <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-20">
              <div className="max-w-md md:max-w-sm">
                <Link href="/" className="inline-flex max-w-[180px] shrink-0" aria-label="RROWM home">
                  <RrowmLogo
                    sizes="(max-width: 430px) min(148px, 40vw), 180px"
                    className="h-11 w-auto max-h-11 max-w-full shrink-0 object-contain object-left [filter:brightness(0)_invert(1)]"
                  />
                </Link>
                <p className="mt-8 text-sm leading-relaxed text-white/55">
                  {t("footer.blurb")}
                </p>
              </div>

              <FooterNav t={t} tone="dark" />
            </div>

            <FooterMeta regionId={regionId} setRegionId={setRegionId} t={t} tone="dark" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      data-rrowm-chrome-suppress-invite-signup
      className="border-t border-black/[0.06] pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-20 md:pb-24 md:pt-28"
    >
      <div className="mx-auto w-full max-w-[min(100%,88rem)] px-6 md:px-14 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1rem))]">
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between md:gap-20">
          <div className="max-w-md md:max-w-sm">
            <Link href="/" className="inline-flex max-w-[160px] shrink-0" aria-label="RROWM home">
              <RrowmLogo
                sizes="(max-width: 430px) min(148px, 40vw), 160px"
                className="h-11 w-auto max-h-11 max-w-full shrink-0 object-contain object-left"
              />
            </Link>
            <p className="mt-8 text-sm leading-relaxed text-neutral-600">
              {t("footer.blurb")}
            </p>
          </div>

          <FooterNav t={t} tone="light" />
        </div>

        <FooterMeta regionId={regionId} setRegionId={setRegionId} t={t} tone="light" />
      </div>
    </footer>
  );
}

function FooterNav({
  t,
  tone,
}: {
  t: (key: import("@/lib/locale-messages").MessageKey) => string;
  tone: "light" | "dark";
}) {
  const linkClass =
    tone === "dark"
      ? "w-fit transition duration-300 ease-out hover:text-white"
      : "w-fit transition duration-300 ease-out hover:text-neutral-950";
  const headingClass =
    tone === "dark" ? "text-sm font-medium text-white/80" : "text-sm font-medium text-neutral-700";

  return (
    <nav
      className="grid grid-cols-1 gap-12 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 xl:gap-14"
      aria-label="Footer"
    >
      <div className={`flex flex-col gap-3 ${tone === "dark" ? "text-white/55" : "text-neutral-600"}`}>
        <span className={headingClass}>{t("footer.navigate")}</span>
        <Link href="/field" className={linkClass}>
          {t("footer.field")}
        </Link>
        <a href={fieldExplorerRecordsHref()} className={linkClass}>
          {t("footer.registry")}
        </a>
        <Link href="/about" className={linkClass}>
          {t("footer.about")}
        </Link>
        <Link href="/contact" className={linkClass}>
          {t("footer.contact")}
        </Link>
      </div>

      <div className={`flex flex-col gap-3 ${tone === "dark" ? "text-white/55" : "text-neutral-600"}`}>
        <span className={headingClass}>{t("footer.access")}</span>
        <a
          href={"/login?next=" + encodeURIComponent("/studio/creative")}
          className={linkClass}
        >
          {t("footer.signIn")}
        </a>
        <a href="/get-started" className={linkClass}>
          {t("footer.register")}
        </a>
        <DashboardNavLink className={linkClass}>{t("footer.account")}</DashboardNavLink>
      </div>

      <div className={`flex flex-col gap-3 ${tone === "dark" ? "text-white/55" : "text-neutral-600"}`}>
        <span className={headingClass}>{t("footer.legal")}</span>
        <Link href="/privacy" className={linkClass}>
          {t("footer.privacy")}
        </Link>
        <Link href="/terms" className={linkClass}>
          {t("footer.terms")}
        </Link>
        <Link href="/disclaimer" className={linkClass}>
          {t("footer.disclaimer")}
        </Link>
      </div>

      <div className={`flex flex-col gap-3 ${tone === "dark" ? "text-white/55" : "text-neutral-600"}`}>
        <span className={headingClass}>{t("footer.social")}</span>
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
      </div>
    </nav>
  );
}

function FooterMeta({
  regionId,
  setRegionId,
  t,
  tone,
}: {
  regionId: RegionId;
  setRegionId: (id: RegionId) => void;
  t: (key: import("@/lib/locale-messages").MessageKey) => string;
  tone: "light" | "dark";
}) {
  const borderClass =
    tone === "dark" ? "border-white/[0.08]" : "border-black/[0.06]";
  const mutedClass = tone === "dark" ? "text-white/40" : "text-neutral-500";
  const faintClass = tone === "dark" ? "text-white/35" : "text-neutral-400";
  const regionLabelClass =
    tone === "dark" ? "text-sm font-semibold text-white/55" : "text-sm font-semibold text-[#6b7c93]";

  return (
    <div
      className={`mt-16 grid gap-8 border-t ${borderClass} pt-10 text-xs md:grid-cols-3 md:items-end md:gap-10 ${mutedClass}`}
    >
      <p>
        © {new Date().getFullYear()} RROWM. {t("footer.copyright")}
      </p>
      <div className="flex flex-col gap-1.5 md:max-w-xs">
        <p id="footer-region-label" className={regionLabelClass}>
          {t("footer.regionLabel")}
        </p>
        <FooterRegionSelector
          regionId={regionId}
          onRegionChange={setRegionId}
          labelId="footer-region-label"
        />
      </div>
      <p className={`${faintClass} md:text-right`}>{t("footer.tagline")}</p>
    </div>
  );
}
