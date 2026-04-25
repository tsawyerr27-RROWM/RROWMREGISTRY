import type { ReactNode } from "react";

export type CollectorPublicHeroStats = {
  total_owned: number;
  verified_owned: number;
  first_activity_at: string | null;
};

type Props = {
  publicTitle: string;
  locationLine: string | null;
  /** Bio — only when not anonymous public */
  bio: ReactNode;
  stats: CollectorPublicHeroStats | null;
  /** Shown when viewer is owner */
  ownerTools?: ReactNode;
};

export function CollectorPublicHero({
  publicTitle,
  locationLine,
  bio,
  stats,
  ownerTools,
}: Props) {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[1.25rem] border border-neutral-900/[0.07] bg-gradient-to-br from-[#f8faf9] via-white to-sky-50/40 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-teal-400/10 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-sky-300/15 blur-[72px]"
        aria-hidden
      />
      <div className="relative max-w-3xl p-8 lg:p-12 xl:p-14">
        <h1 className="font-serif text-[2.125rem] font-normal leading-[1.06] tracking-tight text-neutral-950 md:text-5xl md:leading-[1.05]">
          {publicTitle}
        </h1>
        {locationLine ? (
          <p className="mt-4 text-[15px] text-neutral-500">{locationLine}</p>
        ) : null}

        {stats ? (
          <div className="mt-8 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center rounded-full border border-neutral-900/10 bg-white/70 px-3.5 py-1.5 text-[13px] tabular-nums text-neutral-800 shadow-sm backdrop-blur-sm">
              <span className="font-semibold text-neutral-950">
                {stats.total_owned}
              </span>
              <span className="ml-1.5 text-neutral-500">
                {stats.total_owned === 1 ? "work" : "works"} held
              </span>
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-900/15 bg-emerald-50/80 px-3.5 py-1.5 text-[13px] tabular-nums text-emerald-950/90 backdrop-blur-sm">
              <span className="font-semibold">{stats.verified_owned}</span>
              <span className="ml-1.5 font-normal text-emerald-900/75">
                verified on registry
              </span>
            </span>
            {stats.first_activity_at &&
            !Number.isNaN(new Date(stats.first_activity_at).getTime()) ? (
              <span className="inline-flex items-center rounded-full border border-neutral-900/8 bg-white/50 px-3.5 py-1.5 text-[12px] tabular-nums text-neutral-500 backdrop-blur-sm">
                Since {new Date(stats.first_activity_at).getFullYear()}
              </span>
            ) : null}
          </div>
        ) : null}

        {bio ? (
          <div className="mt-8 max-w-xl text-[15px] leading-[1.7] text-neutral-600">{bio}</div>
        ) : null}

        {ownerTools ? <div className="mt-8">{ownerTools}</div> : null}
      </div>
    </section>
  );
}
