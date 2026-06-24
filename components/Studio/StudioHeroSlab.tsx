"use client";

import type { ReactNode } from "react";

import { rrowmButton, rrowmStudioSurface, rrowmZoneClass } from "@/styles/rrowm-theme";

type Props = {
  overline?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  metrics?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  /** Top-align aside content — better when the rail stacks multiple panels */
  asideAlign?: "center" | "start";
  className?: string;
};

export function StudioHeroSlab({
  overline,
  title,
  subtitle,
  headerExtra,
  metrics,
  actions,
  aside,
  asideAlign = "center",
  className = "",
}: Props) {
  return (
    <div className={`relative -mt-1 mb-10 md:mb-12 ${className}`}>
      <div className={`${rrowmStudioSurface.heroSlab} ${rrowmZoneClass.studio} relative`}>
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--rrowm-zone-accent)_45%,transparent)] to-transparent md:inset-x-10"
          aria-hidden
        />

        <div className="relative grid gap-10 px-6 py-10 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-12 xl:px-12">
          <div
            className={`flex flex-col justify-between ${
              aside && asideAlign === "start" ? "lg:col-span-8" : "lg:col-span-7"
            }`}
          >
            <div>
              {overline ? (
                <p className="text-sm font-medium text-neutral-500">{overline}</p>
              ) : null}
              {headerExtra ? (
                <div className={overline ? "mt-4" : undefined}>{headerExtra}</div>
              ) : null}
              <div
                className={
                  headerExtra || overline ? "mt-4" : "mt-3"
                }
              >
                {title}
              </div>
              {subtitle ? <div className="mt-3">{subtitle}</div> : null}
            </div>

            {metrics ? <div className="mt-10 space-y-5 lg:mt-12">{metrics}</div> : null}

            {actions ? (
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-neutral-900/[0.06] pt-8">
                {actions}
              </div>
            ) : null}
          </div>

          {aside ? (
            <div
              className={`flex ${
                asideAlign === "start" ? "lg:col-span-4" : "lg:col-span-5"
              } ${
                asideAlign === "start"
                  ? "items-start justify-start lg:min-h-0"
                  : "min-h-[260px] items-center justify-center lg:min-h-[320px]"
              }`}
            >
              {aside}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
