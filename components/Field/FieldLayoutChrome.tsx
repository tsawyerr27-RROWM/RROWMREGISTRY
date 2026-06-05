"use client";

import { usePathname } from "next/navigation";

import { FieldExplorerSubNav } from "@/components/Field/FieldExplorerSubNav";
import { isFieldExplorerPath } from "@/lib/field-nav";

type Props = {
  children: React.ReactNode;
};

export function FieldLayoutChrome({ children }: Props) {
  const pathname = usePathname();
  const showExplorerSubNav = isFieldExplorerPath(pathname);

  return (
    <div className="ds-page-environment relative min-h-[100dvh] overflow-x-clip text-neutral-900 selection:bg-neutral-900/10">
      <div className="ds-narrative-chrome" aria-hidden />
      <div className="relative z-10 flex min-h-[inherit] flex-col pt-24 md:pt-28">
        {showExplorerSubNav ? <FieldExplorerSubNav /> : null}
        {children}
      </div>
    </div>
  );
}
