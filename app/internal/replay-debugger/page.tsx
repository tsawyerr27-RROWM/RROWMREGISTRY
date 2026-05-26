"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { deferredRouterReplace } from "@/lib/deferred-app-router";
import ReplayDebuggerClient from "@/components/replay-debugger/ReplayDebuggerClient";

export default function ReplayDebuggerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
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
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-black/60 sm:px-6">
        Checking access…
      </div>
    );
  }

  return (
    <div>
      <ReplayDebuggerClient />
    </div>
  );
}
