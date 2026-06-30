import type { ReactNode } from "react";

import { fieldV2 } from "@/styles/field-v2";

export function FieldV2Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${fieldV2.container} ${className}`.trim()}>{children}</div>
  );
}
