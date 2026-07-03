import type { ReactNode } from "react";

import { registryV2 } from "@/styles/registry-v2";

type Props = {
  title: string;
  infoTooltip?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

/** Compressed Field explorer hero — title + optional ⓘ, no decorative eyebrow. */
export function FieldExplorerHeroShell({
  title,
  infoTooltip,
  meta,
  actions,
  children,
}: Props) {
  return (
    <section
      className={`field-explorer-hero relative mt-1 overflow-hidden ${registryV2.surface.filingMajor} p-4 sm:p-5 md:p-6 ${registryV2.motion.reveal}`}
    >
      <div className="flex items-start gap-2.5">
        <h1
          className={`${registryV2.type.sectionTitle} min-w-0 flex-1 text-[1.5rem] leading-[1.08] md:text-[1.75rem]`}
        >
          {title}
        </h1>
        {infoTooltip}
      </div>
      {meta ? (
        <div className={`${registryV2.type.monoId} mt-3 text-[10px]`}>{meta}</div>
      ) : null}
      {children}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}
