import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { fieldV2 } from "@/styles/field-v2";

export function FieldExplorerSubNavFallback() {
  return (
    <nav
      aria-hidden
      className="field-v2-subnav border-b border-[var(--v2-border)] bg-[var(--v2-white)]/88 backdrop-blur-md"
    >
      <div className={`${fieldV2.container} !pb-0 !pt-0`}>
        <div className="flex flex-wrap gap-x-1 gap-y-0 sm:flex-nowrap sm:gap-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="inline-flex min-h-[44px] shrink-0 animate-pulse items-center px-4 py-3 md:min-h-0 md:px-5 md:py-4"
            >
              <span className="h-3 w-14 rounded bg-[var(--v2-cool-grey)]/20 md:w-20" />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function FieldExplorerDiscoveryStripFallback() {
  return (
    <section
      aria-hidden
      className="mt-8 animate-pulse rounded-[1rem] border border-neutral-900/[0.06] bg-white/70 p-4 shadow-sm md:mt-10 md:p-5"
    >
      <div className="h-6 w-40 rounded bg-[var(--v2-cool-grey)]/15 md:w-52" />
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className="inline-flex min-h-[44px] w-24 items-center rounded-2xl border border-neutral-200/80 bg-white px-4 py-2.5 md:w-28"
          />
        ))}
      </div>
    </section>
  );
}

export function FieldExplorerHubContentFallback() {
  return (
    <FieldV2Container className="pt-2 md:pt-3">
      <div className="animate-pulse">
        <div className="h-9 w-48 rounded bg-[var(--v2-cool-grey)]/15 md:h-10 md:w-56" />
        <div className="mt-4 h-11 max-w-xl rounded-2xl bg-[var(--v2-cool-grey)]/10" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`${fieldV2.surface.indexCard} flex min-h-[56px] items-center p-4 md:p-5`}
            >
              <span className="h-5 w-3/4 rounded bg-[var(--v2-cool-grey)]/15" />
            </div>
          ))}
        </div>
      </div>
      <FieldExplorerDiscoveryStripFallback />
    </FieldV2Container>
  );
}
