import { narrativeLayout } from "@/styles/narrative-layout";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type PublicVsPrivateProps = {
  density?: "default" | "digest";
};

export function PublicVsPrivate({ density = "default" }: PublicVsPrivateProps) {
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  const h2Class = digest
    ? "max-w-3xl font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
    : "max-w-3xl font-serif text-[clamp(1.85rem,3.5vw,2.75rem)] font-normal leading-tight tracking-tight text-neutral-950";

  const panelPad = digest ? "p-6 md:p-8 lg:p-9" : "p-10 md:p-14 lg:p-16";
  const innerPad = digest ? "px-6 py-7 md:px-7 md:py-8" : "px-8 py-10 md:px-10 md:py-12";
  const stackGap = digest ? "space-y-8 md:space-y-10" : "space-y-14 md:space-y-16";

  return (
    <Shell
      className={
        digest
          ? "relative"
          : `rrowm-atmo-section--cool ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-visibility-heading" } : {})}
    >
      <h2 {...(!digest ? { id: "about-visibility-heading" } : {})} className={h2Class}>
        Public record, private detail
      </h2>
      <div
        className={
          digest
            ? "mt-4 h-px max-w-lg bg-gradient-to-r from-neutral-300/75 via-neutral-200/40 to-transparent"
            : "mt-6 h-px max-w-lg bg-gradient-to-r from-neutral-300/75 via-neutral-200/40 to-transparent"
        }
        aria-hidden
      />

      <div
        className={
          digest
            ? "mt-6 grid min-h-0 gap-0 overflow-hidden rounded-2xl border rrowm-atmo-panel shadow-[0_20px_60px_-50px_rgba(15,23,42,0.18)] backdrop-blur-sm lg:grid-cols-2 lg:items-stretch"
            : "mt-12 grid min-h-0 gap-0 overflow-hidden rounded-3xl border rrowm-atmo-panel shadow-[0_28px_80px_-60px_rgba(15,23,42,0.2)] backdrop-blur-sm md:mt-16 lg:mt-20 lg:grid-cols-2 lg:items-stretch"
        }
      >
        <div
          className={`relative z-[1] border-b border-[color:var(--rrowm-atmo-rim)] rrowm-atmo-panel--muted ${panelPad} lg:border-b-0 lg:border-r`}
        >
          <div
            className="ds-record-grid pointer-events-none absolute inset-0 opacity-[0.65]"
            aria-hidden
          />
          <div className="relative max-w-xl">
            <InfoTooltip text="Searchable entries show what the public layer includes: typically identifiers, record status, and what has been opted into visibility. This is the open verification surface." />
            <h3
              className={
                digest
                  ? "font-serif text-lg font-normal tracking-tight text-neutral-950"
                  : "font-serif text-xl font-normal tracking-tight text-neutral-950"
              }
            >
              Public registry
            </h3>
          </div>
        </div>

        <div
          className={`relative bg-[rgba(10,11,14,0.92)] text-neutral-100 ${digest ? "px-6 py-10 md:px-8 md:py-12" : "px-10 py-14 md:px-14 md:py-16 lg:p-16"}`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"
            aria-hidden
          />
          <div
            className={`relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md ${innerPad}`}
          >
            <div className={stackGap}>
              <div>
                <InfoTooltip text="Full certificates and sensitive documentation are available through authenticated access. Viewing is tied to login and permissions, not to anonymous browsing." />
                <h3 className="text-sm font-medium text-neutral-100 md:text-[15px]">
                  Certificates and account access
                </h3>
              </div>
              <div>
                <InfoTooltip text="Current ownership and personal details are not exposed by default. The system separates what proves the record from what protects people involved in a transaction." />
                <h3 className="text-sm font-medium text-neutral-100 md:text-[15px]">
                  Ownership and privacy
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
