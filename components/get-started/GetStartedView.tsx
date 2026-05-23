"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { AmbientNarrativeField } from "@/components/LandingPage/AmbientNarrativeField";
import { GalleryPricingModal } from "./GalleryPricingModal";
import { IconArtist, IconCollector, IconGallery } from "./role-icons";

/** Stroke/fill use `currentColor` on the SVG — restrained neutral tints only. */
const ICON_TINT: Record<"artist" | "gallery" | "collector", string> = {
  artist: "text-stone-600",
  gallery: "text-slate-600",
  collector: "text-neutral-600",
};

const CARD_CLASS =
  "group flex h-full w-full flex-col rounded-[1.35rem] border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel)_82%,transparent)] p-7 text-left shadow-[0_18px_48px_-32px_rgba(15,23,42,0.14)] backdrop-blur-sm transition-[transform,opacity,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_88%,rgb(55_48_43))] hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_76%,transparent)] hover:shadow-[0_22px_52px_-34px_rgba(15,23,42,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900/20 md:p-8";

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
      <h2 className="mt-7 font-serif text-[1.4rem] font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.5rem]">
        {title}
      </h2>
      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-neutral-600 md:text-sm">
        {description}
      </p>
      <p className="mt-8 text-xs font-medium tracking-wide text-neutral-900 transition group-hover:text-neutral-950">
        {cta}
        <span
          className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden
        >
          →
        </span>
      </p>
    </>
  );
}

export function GetStartedView() {
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  return (
    <div className="rrowm-narrative-page ds-page-environment relative min-h-screen overflow-x-clip px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-28 lg:px-12">
      <div className="ds-narrative-chrome" aria-hidden />
      <AmbientNarrativeField />

      <main className="relative z-10 mx-auto w-full max-w-[min(100%,72rem)]">
        <header className="max-w-2xl">
          <h1 className="font-serif text-[2rem] font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-[2.35rem] md:leading-[1.08]">
            Choose how you take part
          </h1>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 md:text-lg md:leading-relaxed">
            Each path opens the right studio (artist, institutional, or collector).
            Underneath: one chronology per work, on file.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:text-neutral-950 hover:decoration-neutral-500"
            >
              Sign in
            </Link>
            . Your role follows your profile, not this page alone.
          </p>
        </header>

        <section
          className="rrowm-atmo-section--warm relative mt-14 overflow-hidden rounded-[1.75rem] sm:mt-16 lg:mt-20"
          aria-label="Role paths"
        >
          <nav
            className="relative z-10 grid grid-cols-1 gap-6 p-6 sm:gap-7 sm:p-8 lg:grid-cols-3 lg:gap-8 lg:p-10"
            aria-label="Choose how you take part on the registry"
          >
            <Link href="/signup?role=artist" className={CARD_CLASS}>
              <CardBody
                role="artist"
                title="I am an Artist"
                description="Register represented works so your catalogue presence, chronology, and certificates stay on one record."
                cta="Continue as artist"
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
                title="I run an institutional studio"
                description="Verified gallery workflows: participant confirmations and listings on file for represented artists."
                cta="View plans and continue"
                icon={<IconGallery />}
              />
            </button>

            <Link href="/signup?role=collector" className={CARD_CLASS}>
              <CardBody
                role="collector"
                title="I am a Collector"
                description="Browse the public catalogue, read the current record, and file custody when you hold a work."
                cta="Continue as collector"
                icon={<IconCollector />}
              />
            </Link>
          </nav>
        </section>

        <section className="rrowm-atmo-section--blend relative mt-16 overflow-hidden rounded-[1.5rem] md:mt-20">
          <div className="relative z-10 max-w-2xl px-6 py-10 md:px-8 md:py-12">
            <h2 className="font-serif text-xl font-normal text-neutral-950">
              On the catalogue
            </h2>
            <p className="mt-4 text-sm leading-[1.75] text-neutral-600 md:text-[15px]">
              Verified listings and chronology offer a shared surface for inquiry, not a
              marketplace pitch.
            </p>
          </div>
        </section>
      </main>

      <GalleryPricingModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
      />
    </div>
  );
}
