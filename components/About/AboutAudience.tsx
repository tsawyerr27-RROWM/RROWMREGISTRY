import { narrativeLayout } from "@/styles/narrative-layout";

type AboutAudienceProps = {
  density?: "default" | "digest";
};

export function AboutAudience({ density = "default" }: AboutAudienceProps) {
  const digest = density === "digest";
  const Shell = digest ? "div" : "section";

  return (
    <Shell
      className={
        digest
          ? ""
          : `rrowm-atmo-section--dusk ${narrativeLayout.gutter} ${narrativeLayout.sectionPadY}`
      }
      {...(!digest ? { "aria-labelledby": "about-audience-heading" } : {})}
    >
      <h2
        {...(!digest ? { id: "about-audience-heading" } : {})}
        className={
          digest
            ? "font-serif text-xl font-normal leading-snug tracking-tight text-neutral-950 md:text-[1.35rem]"
            : "font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-normal leading-tight tracking-tight text-neutral-950"
        }
      >
        Who it is for
      </h2>
      <div
        className={
            digest
              ? "mt-6 grid gap-8 md:mt-7 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--rrowm-atmo-rim)]"
              : "mt-16 grid gap-14 md:mt-20 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--rrowm-atmo-rim)]"
        }
      >
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:pr-6 md:text-sm lg:pr-8"
              : "text-sm leading-[1.82] text-neutral-600 md:pr-10 md:text-base lg:pr-14"
          }
        >
          <span className="font-medium text-neutral-900">
            Artists &amp; studios
          </span>{" "}
          establishing a lasting record for works they stand behind, with
          certificates and provenance tied to one identity.
        </p>
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:px-6 md:text-sm lg:px-8"
              : "text-sm leading-[1.82] text-neutral-600 md:px-10 md:text-base lg:px-14"
          }
        >
          <span className="font-medium text-neutral-900">
            Galleries &amp; estates
          </span>{" "}
          maintaining continuity across exhibitions and transfers without
          fragmenting the story of each piece.
        </p>
        <p
          className={
            digest
              ? "text-[13px] leading-[1.78] text-neutral-600 md:pl-6 md:text-sm lg:pl-8"
              : "text-sm leading-[1.82] text-neutral-600 md:pl-10 md:text-base lg:pl-14"
          }
        >
          <span className="font-medium text-neutral-900">
            Collectors &amp; researchers
          </span>{" "}
          using the public layer to verify what is on record before going
          further through authenticated channels.
        </p>
      </div>
    </Shell>
  );
}
