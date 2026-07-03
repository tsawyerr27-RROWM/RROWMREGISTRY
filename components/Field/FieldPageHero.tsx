import type { ReactNode } from "react";

import { fieldV2 } from "@/styles/field-v2";

type Props = {
  title: string;
  infoTooltip?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

/** Compressed hero for /field and /field/explorer hub pages. */
export function FieldPageHero({ title, infoTooltip, actions, children }: Props) {
  return (
    <header
      className={`field-explorer-hero relative ${fieldV2.surface.filingMajor} p-4 sm:p-5 md:p-6`}
    >
      <div className="flex items-start gap-2.5">
        <h1
          className={`${fieldV2.type.sectionTitle} min-w-0 flex-1 text-[1.5rem] leading-[1.08] md:text-[1.75rem]`}
        >
          {title}
        </h1>
        {infoTooltip}
      </div>
      {children}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
