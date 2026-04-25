"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import ReplayDebuggerClient from "@/components/replay-debugger/ReplayDebuggerClient";

export default function ReplayDebuggerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const gate = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        deferredRouterReplace(
          router,
          "/login?next=" + encodeURIComponent("/internal/replay-debugger")
        );
        return;
      }
      const uid = sessionData.session.user.id;
      const { data: profileData } = await supabase.from("artists").select("is_admin").eq("id", uid).single();
      if (!profileData?.is_admin) {
        deferredRouterReplace(router, "/studio");
        return;
      }
      setReady(true);
    };
    void gate();
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center text-sm text-black/60">
        Checking access…
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-black/10 bg-white px-6 py-3">
        <Link
          href="/admin"
          className="text-xs text-black/50 hover:text-black"
        >
          ← Admin
        </Link>
      </div>
      <ReplayDebuggerClient />
    </div>
  );
}
