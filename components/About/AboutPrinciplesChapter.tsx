import { InfoTooltip } from "@/components/ui/InfoTooltip";

const PRINCIPLES = [
  {
    title: "Neutral infrastructure",
    body: "A shared layer: careful in tone, explicit in what is on record, and durable over time.",
  },
  {
    title: "Visibility is policy",
    body: "The public layer proves the record without exposing private detail. Access is authenticated where it needs to be.",
  },
  {
    title: "One identity per work",
    body: "Certificates and provenance events refer to the same registry identity so documentation does not drift.",
  },
] as const;

export function AboutPrinciplesChapter() {
  return (
    <section
      className="rrowm-atmo-section--reflective relative overflow-hidden rounded-[1.75rem] border border-[color:var(--rrowm-atmo-rim)] py-14 shadow-[0_28px_88px_-56px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:py-16 md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_82%,rgb(75_72_88))] md:hover:shadow-[0_30px_90px_-54px_rgba(15,23,42,0.2)]"
      aria-labelledby="about-principles-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        aria-hidden
      >
        <div className="absolute left-[8%] top-[-20%] h-[min(22rem,50vw)] w-[min(22rem,50vw)] rounded-full bg-gradient-to-br from-stone-200/22 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-[-25%] right-[5%] h-[min(20rem,45vw)] w-[min(26rem,55vw)] rounded-full bg-gradient-to-tl from-slate-200/22 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative grid gap-10 px-6 md:px-10 lg:grid-cols-12 lg:items-stretch lg:gap-8 lg:px-12">
        <header className="flex flex-col justify-between gap-6 lg:col-span-4">
          <div>
            <InfoTooltip text="A record layer built to stay stable, readable, and verifiable, not a product category page." />
            <h2
              id="about-principles-heading"
              className="font-serif text-[clamp(1.65rem,2.6vw,2.25rem)] font-normal leading-[1.12] tracking-tight text-neutral-950"
            >
              A registry designed for trust
            </h2>
          </div>
          <div
            className="hidden h-px w-full max-w-[12rem] bg-gradient-to-r from-neutral-300/70 via-neutral-200/35 to-transparent lg:block"
            aria-hidden
          />
        </header>

        <div className="lg:col-span-8">
          <ul className="grid gap-3 sm:grid-cols-3 sm:gap-3">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <article className="flex h-full flex-col rounded-2xl border border-[color:var(--rrowm-atmo-rim)] bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-muted)_88%,transparent)] px-5 py-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-6 md:py-6 md:hover:border-[color:color-mix(in_srgb,var(--rrowm-atmo-rim)_80%,rgb(75_72_88))] md:hover:bg-[color-mix(in_srgb,var(--rrowm-atmo-panel-raise)_86%,transparent)] md:hover:shadow-[0_20px_52px_-38px_rgba(15,23,42,0.18)]">
                  <InfoTooltip text={p.body} />
                  <h3 className="text-[13px] font-medium leading-snug text-neutral-950 md:text-sm">
                    {p.title}
                  </h3>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
