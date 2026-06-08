"use client";

import Link from "next/link";

/** Static footer link to account settings — no auth bootstrap on mount. */
export function DashboardNavLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const href = "/studio/account";

  return (
    <Link href={href} prefetch={false} className={className}>
      {children ?? "Account"}
    </Link>
  );
}
