import type { ReactNode } from "react";

import { fieldV2 } from "@/styles/field-v2";

export function FieldV2EmptyState({
  message,
  actions,
}: {
  message: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={`${fieldV2.surface.empty} mt-14 px-8 py-14 text-center md:px-12`}
    >
      <p className={`${fieldV2.type.metaValue} mx-auto max-w-md`}>{message}</p>
      {actions ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
