"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionSafe } from "@/lib/supabase";
import { useSupabaseBrowserLazy } from "@/hooks/useSupabaseBrowserLazy";
import { homePathForRole } from "@/lib/onboarding";

const LOGIN_WITH_NEXT =
  "/login?next=" + encodeURIComponent("/studio/creative");

/**
 * Links to the role home studio when signed in, otherwise sign-in with return URL.
 */
export function DashboardNavLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const sb = useSupabaseBrowserLazy();
  const [href, setHref] = useState(LOGIN_WITH_NEXT);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = await getSessionSafe();
      if (!mounted) return;
      if (!session?.user?.id) {
        setHref(LOGIN_WITH_NEXT);
        return;
      }
      const { data } = await sb()
        .from("actor_profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      const role = data?.role ? String(data.role) : null;
      setHref(homePathForRole(role) ?? "/studio/creative");
    })();
    const supabase = sb();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: unknown, session: unknown) => {
      const s = session as { user?: { id?: string } } | null;
      if (!s?.user?.id) {
        setHref(LOGIN_WITH_NEXT);
        return;
      }
      const { data } = await supabase
        .from("actor_profiles")
        .select("role")
        .eq("user_id", s.user.id)
        .maybeSingle();
      const role = data?.role ? String(data.role) : null;
      setHref(homePathForRole(role) ?? "/studio/creative");
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sb]);

  return (
    <Link href={href} prefetch={false} className={className}>
      {children ?? "Account"}
    </Link>
  );
}
