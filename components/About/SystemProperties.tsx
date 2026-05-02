import { narrativeLayout } from "@/styles/narrative-layout";

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
      className={digest ? "" : narrativeLayout.sectionPadY}
      {...(!digest ? { "aria-labelledby": "about-properties-heading" } : {})}
    >
      <div
        className={
          digest
            ? "pt-0"
            : "border-t border-neutral-200/60 pt-16 md:pt-20"
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
              ? "mt-6 divide-y divide-neutral-200/50 border-y border-neutral-200/50"
              : "mt-12 divide-y divide-neutral-200/55 border-y border-neutral-200/55 md:mt-16"
          }
        >
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className={
                digest
                  ? "grid gap-3 py-5 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:gap-8 md:py-6"
                  : "grid gap-5 py-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-12 md:py-12"
              }
            >
              <h3
                className={
                  digest
                    ? "text-sm font-medium text-neutral-950 md:pt-0.5 md:text-[15px]"
                    : "text-lg font-medium text-neutral-950 md:pt-0.5"
                }
              >
                {item.title}
              </h3>
              <p
                className={
                  digest
                    ? "max-w-2xl text-[13px] leading-[1.75] text-neutral-600 md:text-sm md:leading-[1.78]"
                    : "max-w-2xl text-sm leading-[1.78] text-neutral-600 md:text-base md:leading-[1.8]"
                }
              >
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
