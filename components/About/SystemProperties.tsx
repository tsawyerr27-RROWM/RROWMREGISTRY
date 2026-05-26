import { narrativeLayout } from "@/styles/narrative-layout";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type SystemPropertiesProps = {
  density?: "default" | "digest";
};

const ITEMS = [
  {
    title: "Immutable records",
    body: "Once committed, core registry facts and timestamps are not silently rewritten. Changes are explicit, not overwritten in place.",
  },
  {
    title: "Verification layer",
    body: "Cryptographic checks and record linkage allow anyone with access to validate against the public layer without trusting a single intermediary.",
  },
  {
    title: "Provenance tracking",
    body: "Transfers and material events can be appended over time so the lineage of a work remains inspectable within policy.",
  },
] as const;

export function SystemProperties({ density = "default" }: SystemPropertiesProps) {
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  return (
    <Shell
      className={
        digest
          ? ""
          : `rrowm-atmo-section--mist ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-properties-heading" } : {})}
    >
      <div
        className={
          digest
            ? "pt-0"
            : "border-t border-[color:var(--rrowm-atmo-rim)] pt-16 md:pt-20"
        }
      >
        <h2
          {...(!digest ? { id: "about-properties-heading" } : {})}
          className={
            digest
              ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
              : "font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-normal leading-tight tracking-tight text-neutral-950"
          }
        >
          System properties
        </h2>
        <ul
          className={
            digest
              ? "mt-6 divide-y divide-[color:var(--rrowm-atmo-rim)] border-y border-[color:var(--rrowm-atmo-rim)]"
              : "mt-12 divide-y divide-[color:var(--rrowm-atmo-rim)] border-y border-[color:var(--rrowm-atmo-rim)] md:mt-16"
          }
        >
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className={
                digest
                  ? "py-5 md:py-6"
                  : "py-10 md:py-12"
              }
            >
              <InfoTooltip text={item.body} />
              <h3
                className={
                  digest
                    ? "text-sm font-medium text-neutral-950 md:pt-0.5 md:text-[15px]"
                    : "text-lg font-medium text-neutral-950 md:pt-0.5"
                }
              >
                {item.title}
              </h3>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
