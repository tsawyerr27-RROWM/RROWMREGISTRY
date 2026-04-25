"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { GalleryPricingModal } from "./GalleryPricingModal";
import { IconArtist, IconCollector, IconGallery } from "./role-icons";

/** Stroke/fill use `currentColor` on the SVG — tint only the icon, no box outline. */
const ICON_TINT: Record<"artist" | "gallery" | "collector", string> = {
  artist: "text-emerald-600",
  gallery: "text-violet-600",
  collector: "text-sky-600",
};

const CARD_CLASS =
  "group flex h-full w-full flex-col rounded-[1.35rem] border border-white/90 bg-gradient-to-b from-white/95 to-white/[0.72] p-7 text-left shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05),0_18px_48px_-32px_rgba(15,23,42,0.14),inset_0_1px_0_0_rgba(255,255,255,1),inset_0_-12px_32px_-20px_rgba(186,199,214,0.14)] backdrop-blur-[18px] transition duration-300 ease-out hover:-translate-y-[2px] hover:border-white hover:shadow-[0_8px_32px_-16px_rgba(15,23,42,0.12),0_24px_56px_-36px_rgba(15,23,42,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900/20 md:p-8";

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
    <div className="ds-page-environment min-h-screen px-5 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-28 lg:px-12">
      <main className="mx-auto w-full max-w-[min(100%,72rem)]">
        <header className="max-w-2xl">
          <h1 className="font-serif text-[2rem] font-normal leading-[1.1] tracking-tight text-neutral-950 md:text-[2.35rem] md:leading-[1.08]">
            Get started
          </h1>
          <p className="mt-5 text-base leading-relaxed text-neutral-600 md:text-lg md:leading-relaxed">
            Choose how you will use the registry — each path opens the right
            workspace and onboarding.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-[0.25em] transition hover:text-neutral-950 hover:decoration-neutral-500"
            >
              Sign in
            </Link>
            — your role follows your profile, not this page alone.
          </p>
        </header>

        <nav
          className="mt-14 grid grid-cols-1 gap-6 sm:mt-16 sm:gap-7 lg:mt-20 lg:grid-cols-3 lg:gap-8"
          aria-label="Choose how you will use the registry"
        >
          <Link href="/signup?role=artist" className={CARD_CLASS}>
            <CardBody
              role="artist"
              title="I am an Artist"
              description="Register works, anchor identity, and build provenance and value history with immutable records."
              cta="Continue as Artist"
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
              description="Run verification-oriented workflows and multi-artist registry operations — paid institutional access."
              cta="View plans & continue"
              icon={<IconGallery />}
            />
          </button>

          <Link href="/signup?role=collector" className={CARD_CLASS}>
            <CardBody
              role="collector"
              title="I am a Collector"
              description="Search the registry, verify records, and claim ownership when you hold a work."
              cta="Continue as Collector"
              icon={<IconCollector />}
            />
          </Link>
        </nav>

        <div className="mt-20 max-w-2xl border-t border-black/[0.06] pt-12 md:mt-24 md:pt-14">
          <h2 className="font-serif text-xl font-normal text-neutral-950">
            Why this matters
          </h2>
          <p className="mt-4 text-sm leading-[1.75] text-neutral-600 md:text-[15px]">
            RROWM records identity, provenance, and value over time so
            collectors and the public can rely on a consistent verification
            layer — not a marketplace pitch.
          </p>
        </div>
      </main>

      <GalleryPricingModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
      />
    </div>
  );
}
