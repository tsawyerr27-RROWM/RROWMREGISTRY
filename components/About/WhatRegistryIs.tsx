import { narrativeLayout } from "@/styles/narrative-layout";

type WhatRegistryIsProps = {
  /** Compact panel for tabbed About digest */
  density?: "default" | "digest";
};

export function WhatRegistryIs({ density = "default" }: WhatRegistryIsProps) {
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  const h2Class = digest
    ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
    : "font-serif text-[clamp(1.85rem,3.2vw,2.85rem)] font-normal leading-tight tracking-tight text-neutral-950";

  const bodyClass = digest
    ? "space-y-4 text-[13px] leading-[1.75] text-neutral-600 md:text-sm md:leading-[1.78]"
    : "space-y-10 text-sm leading-[1.82] text-neutral-600 md:space-y-12 md:text-base md:leading-[1.78]";

  return (
    <Shell
      className={
        digest
          ? "relative"
          : `rrowm-atmo-section--warm ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-what-heading" } : {})}
    >
      <div
        className={
          digest
            ? "grid gap-6"
            : "grid gap-16 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-x-24 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:gap-x-32"
        }
      >
        <div
          className={
            digest
              ? ""
              : "lg:border-r lg:border-[color:var(--rrowm-atmo-rim)] lg:pr-14"
          }
        >
          <div className={digest ? "" : "lg:sticky lg:top-32 lg:max-w-[13rem]"}>
            <h2 {...(!digest ? { id: "about-what-heading" } : {})} className={h2Class}>
              What the registry is
            </h2>
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden">
          {!digest ? (
            <>
              <div
                className="pointer-events-none absolute -right-24 top-0 h-[min(100%,42rem)] w-[min(58%,22rem)] rounded-full bg-gradient-to-bl from-stone-200/35 via-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_40%,transparent)] to-transparent opacity-75 blur-2xl md:-right-32"
                aria-hidden
              />
              <div
                className="ds-record-grid pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 opacity-95 md:-inset-x-10"
                aria-hidden
              />
            </>
          ) : (
            <div
              className="ds-record-grid pointer-events-none absolute -inset-x-4 -inset-y-6 -z-10 opacity-50"
              aria-hidden
            />
          )}
          <div className={`${bodyClass} ${digest ? "max-w-3xl" : ""}`}>
            <p
              className={
                digest
                  ? "max-w-3xl text-neutral-700"
                  : "max-w-3xl text-base leading-[1.82] text-neutral-700 md:text-lg md:leading-[1.76]"
              }
            >
              RROWM Registry is a system for recording authorship, provenance,
              and verification of artworks as durable records. Each work can
              receive a stable registry identity that persists across transfers
              and time.
            </p>
            <p className={digest ? "max-w-3xl" : "max-w-3xl"}>
              Certificates and provenance events refer to that identity, so
              authenticity documents and history stay aligned instead of
              drifting across disconnected files or claims.
            </p>
            <p className={digest ? "max-w-3xl" : "max-w-3xl"}>
              The registry is designed as infrastructure: neutral in tone,
              explicit about what is on record, and careful about what remains
              private.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
