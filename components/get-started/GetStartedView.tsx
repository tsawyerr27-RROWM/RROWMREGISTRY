"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { GalleryPricingModal } from "./GalleryPricingModal";
import { IconArtist, IconCollector, IconGallery } from "./role-icons";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

/** Stroke/fill use `currentColor` on the SVG — restrained neutral tints only. */
const ICON_TINT: Record<"artist" | "gallery" | "collector", string> = {
  artist: "text-stone-600",
  gallery: "text-slate-600",
  collector: "text-neutral-600",
};

const CARD_CLASS =
  "group flex h-full w-full flex-col rounded-2xl border border-black/[0.06] bg-white/80 p-8 text-left shadow-[0_24px_48px_-40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-[border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-black/[0.1] hover:shadow-[0_28px_56px_-36px_rgba(0,0,0,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900/15 md:p-9";

type CardContentProps = {
  role: keyof typeof ICON_TINT;
  title: string;
  description: string;
  cta: string;
  icon: ReactNode;
};

function CardBody({
  role,
  title,
  description,
  cta,
  icon,
}: CardContentProps) {
  return (
    <>
      <div
        className="flex h-[3.75rem] w-[3.75rem] items-center justify-center md:h-16 md:w-16"
        aria-hidden
      >
        <span
          className={`block h-10 w-10 transition group-hover:opacity-95 md:h-11 md:w-11 [&>svg]:h-full [&>svg]:w-full ${ICON_TINT[role]}`}
        >
          {icon}
        </span>
      </div>
      <h2 className="mt-8 font-[var(--font-landing-display)] text-[1.45rem] font-normal leading-snug tracking-[-0.02em] text-[var(--landing-charcoal)] md:text-[1.55rem]">
        {title}
      </h2>
      <p className="mt-5 flex-1 text-[14px] leading-relaxed text-neutral-600 md:text-[15px]">
        {description}
      </p>
      <p className="mt-10 text-xs font-medium tracking-[0.08em] uppercase text-neutral-800">
        {cta}
      </p>
    </>
  );
}

export function GetStartedView() {
  const { t } = useLocalePreferences();
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  return (
    <div className="rrowm-public-get-started relative min-h-screen overflow-x-clip px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-28 lg:px-12">
      <div className="landing-paper-grain pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden />

      <main className="relative z-10 mx-auto w-full max-w-[min(100%,72rem)]">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-[var(--landing-charcoal-muted)]">
            RROWM Registry
          </p>
          <h1 className="mt-5 font-[var(--font-landing-display)] text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--landing-charcoal)] md:text-[2.5rem]">
            {t("getStarted.title")}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-[var(--landing-charcoal-muted)]">
            {t("getStarted.alreadyAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--landing-charcoal)] underline decoration-black/15 underline-offset-[0.25em] transition hover:decoration-black/35"
            >
              {t("getStarted.signIn")}
            </Link>
            . {t("getStarted.roleNote")}
          </p>
        </header>

        <section
          className="relative mt-14 sm:mt-16 lg:mt-20"
          aria-label="Role paths"
        >
          <nav
            className="relative z-10 grid grid-cols-1 gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8"
            aria-label="Choose how you take part on the registry"
          >
            <Link href="/signup?role=artist" className={CARD_CLASS}>
              <CardBody
                role="artist"
                title={t("getStarted.artistTitle")}
                description={t("getStarted.artistDesc")}
                cta={t("getStarted.artistCta")}
                icon={<IconArtist />}
              />
            </Link>

            <button
              type="button"
              onClick={() => setGalleryModalOpen(true)}
              className={CARD_CLASS}
            >
              <CardBody
                role="gallery"
                title={t("getStarted.galleryTitle")}
                description={t("getStarted.galleryDesc")}
                cta={t("getStarted.galleryCta")}
                icon={<IconGallery />}
              />
            </button>

            <Link href="/signup?role=collector" className={CARD_CLASS}>
              <CardBody
                role="collector"
                title={t("getStarted.collectorTitle")}
                description={t("getStarted.collectorDesc")}
                cta={t("getStarted.collectorCta")}
                icon={<IconCollector />}
              />
            </Link>
          </nav>
        </section>
      </main>

      <GalleryPricingModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
      />
    </div>
  );
}
