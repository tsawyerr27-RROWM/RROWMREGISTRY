"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionSafe, supabase } from "@/lib/supabase";

const LOGIN_WITH_NEXT =
  "/login?next=" + encodeURIComponent("/studio");

/**
 * Links to `/studio` when signed in, otherwise to sign-in with return URL.
 */
export function DashboardNavLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [href, setHref] = useState(LOGIN_WITH_NEXT);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = await getSessionSafe();
      if (!mounted) return;
      setHref(session ? "/studio" : LOGIN_WITH_NEXT);
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHref(session ? "/studio" : LOGIN_WITH_NEXT);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Link href={href} prefetch={false} className={className}>
      {children ?? "Account"}
    </Link>
  );
}
