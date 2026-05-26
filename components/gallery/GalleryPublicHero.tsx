import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export type GalleryPublicHeroProps = {
  name: string;
  verified: boolean;
  locationLine: string | null;
  description: string | null;
  websiteHref: string | null;
  stats: {
    artists: number;
    works: number;
    verifiedWorks: number;
  };
  /** Observational endurance copy — documentary, not promotional. */
  enduranceNote?: string | null;
};

/**
 * Public institutional gallery hero — dark premium band aligned with in-app gallery hero language.
 */
export function GalleryPublicHero({
  name,
  verified,
  locationLine,
  description,
  websiteHref,
  stats,
  enduranceNote,
}: GalleryPublicHeroProps) {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-neutral-950 via-[#131820] to-neutral-900 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.42),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-sky-500/12 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[90px]"
        aria-hidden
      />
      <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <InfoTooltip text="Public catalogue profile. Works and institutional continuity visible to the registry." theme="dark" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              verified
                ? "border border-white/15 bg-white/[0.08] text-white/85"
                : "bg-white/10 text-white/55"
            }`}
          >
            {verified ? "Institution-linked on file" : "Registry participant"}
          </span>
        </div>

        <h1 className="mt-5 max-w-[20ch] font-serif text-[2.125rem] font-normal leading-[1.05] tracking-tight text-white md:max-w-none md:text-[2.75rem] lg:text-[3.25rem]">
          {name}
        </h1>

        {locationLine ? (
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">{locationLine}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[13px] tabular-nums text-white/90 backdrop-blur-sm">
            <span className="font-semibold text-white">{stats.artists}</span>
            <span className="ml-1.5 text-white/50">
              {stats.artists === 1 ? "represented participant" : "represented participants"}
            </span>
          </span>
          <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[13px] tabular-nums text-white/90 backdrop-blur-sm">
            <span className="font-semibold text-white">{stats.works}</span>
            <span className="ml-1.5 text-white/50">
              {stats.works === 1 ? "work" : "works"} on file
            </span>
          </span>
          {stats.verifiedWorks > 0 ? (
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[13px] tabular-nums text-white/80 backdrop-blur-sm">
              <span className="font-semibold text-white/90">{stats.verifiedWorks}</span>
              <span className="ml-1.5 font-normal text-white/45">
                with verified listing in the current record
              </span>
            </span>
          ) : null}
        </div>

        {enduranceNote ? (
          <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-white/45">
            {enduranceNote}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
          {websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/[0.07] px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.12]"
            >
              Visit website →
            </a>
          ) : null}
          <Link
            href="/registry"
            className="text-[13px] font-medium text-white/45 transition hover:text-white/75"
          >
            Browse registry
          </Link>
        </div>
      </div>
    </section>
  );
}
