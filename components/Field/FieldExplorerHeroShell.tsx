import type { ReactNode } from "react";

import { registryV2 } from "@/styles/registry-v2";

type Props = {
  indexLabel: string;
  title: string;
  lede: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function FieldExplorerHeroShell({
  indexLabel,
  title,
  lede,
  meta,
  actions,
}: Props) {
  return (
    <section
      className={`relative mt-2 overflow-hidden ${registryV2.surface.filingMajor} p-8 lg:p-12 xl:p-14 ${registryV2.motion.reveal}`}
    >
      <p className={registryV2.type.metaLabel}>{indexLabel}</p>
      <h1 className={`${registryV2.type.recordTitle} mt-4 max-w-3xl`}>{title}</h1>
      <p className={`${registryV2.type.metaValue} mt-6 max-w-2xl text-base`}>{lede}</p>
      {meta ? <div className={`${registryV2.type.monoId} mt-8`}>{meta}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
