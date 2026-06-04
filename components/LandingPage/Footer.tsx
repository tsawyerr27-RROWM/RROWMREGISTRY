"use client";

import Link from "next/link";
import { RrowmLogo } from "@/components/brand/RrowmLogo";
import { usePathname } from "next/navigation";
import { DashboardNavLink } from "@/components/DashboardNavLink";
import { FooterRegionSelector } from "@/components/LandingPage/FooterRegionSelector";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

export function Footer() {
  const { regionId, setRegionId, t } = useLocalePreferences();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      data-rrowm-chrome-suppress-invite-signup
      className={
        isHome
          ? "border-t border-black/[0.04] pb-[max(3rem,env(safe-area-inset-bottom,0px))] pt-8 md:pb-16 md:pt-10"
          : "border-t border-black/[0.06] pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-20 md:pb-24 md:pt-28"
      }
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

          <nav
            className="grid grid-cols-1 gap-12 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 xl:gap-14"
            aria-label="Footer"
          >
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-neutral-700">
                {t("footer.navigate")}
              </span>
              <a
                href="/registry"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.registry")}
              </a>
              <Link
                href="/about"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.about")}
              </Link>
              <Link
                href="/contact"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.contact")}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-neutral-700">
                {t("footer.access")}
              </span>
              <a
                href={"/login?next=" + encodeURIComponent("/studio/creative")}
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.signIn")}
              </a>
              <a
                href="/get-started"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.register")}
              </a>
              <DashboardNavLink className="w-fit transition duration-300 ease-out hover:text-neutral-950">
                {t("footer.account")}
              </DashboardNavLink>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-neutral-700">
                {t("footer.legal")}
              </span>
              <Link
                href="/privacy"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/terms"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href="/disclaimer"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.disclaimer")}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-neutral-700">
                {t("footer.social")}
              </span>
              <a
                href="https://instagram.com/RROWM_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.instagram")}
              </a>
              <a
                href="https://twitter.com/RROWM_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition duration-300 ease-out hover:text-neutral-950"
              >
                {t("footer.twitter")}
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-16 grid gap-8 border-t border-black/[0.06] pt-10 text-xs text-neutral-500 md:grid-cols-3 md:items-end md:gap-10">
          <p>
            © {new Date().getFullYear()} RROWM. {t("footer.copyright")}
          </p>
          <div className="flex flex-col gap-1.5 md:max-w-xs">
            <p
              id="footer-region-label"
              className="text-sm font-semibold text-[#6b7c93]"
            >
              {t("footer.regionLabel")}
            </p>
            <FooterRegionSelector
              regionId={regionId}
              onRegionChange={setRegionId}
              labelId="footer-region-label"
            />
          </div>
          <p className="text-neutral-400 md:text-right">
            {t("footer.tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
