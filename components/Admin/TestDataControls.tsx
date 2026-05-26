"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { summarizeRpcError } from "@/lib/supabase-rpc-error";
import { testModeEnabled } from "@/lib/test-mode";

/**
 * Admin-only QA panel. Requires NEXT_PUBLIC_ENABLE_TEST_MODE=true and artists.is_admin.
 */
export function TestDataControls() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!testModeEnabled()) return;
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("artists")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      setVisible(Boolean(data?.is_admin));
    })();
  }, []);

  const call = useCallback(
    async (path: string, label: string, body?: Record<string, unknown>) => {
      setBusy(label);
      setMessage(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const res = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body ?? {}),
        });
        const j = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
          email?: string;
          password?: string;
          role?: string;
          deletedPublicTestUsers?: number;
          deletedAuthUsers?: number;
          authErrors?: string[];
        };
        if (!res.ok) {
          setMessage(j.error || res.statusText || "Request failed");
          return;
        }
        if (j.email && j.password) {
          setMessage(
            `Created ${j.role}: ${j.email}, password (once): ${j.password}`
          );
        } else if (path.endsWith("/reset")) {
          const extra =
            j.authErrors?.length && j.authErrors.length > 0
              ? ` (notes: ${j.authErrors.join("; ")})`
              : "";
          setMessage(
            `Reset: ${j.deletedPublicTestUsers ?? 0} test profiles cleared, ${j.deletedAuthUsers ?? 0} auth users removed.${extra}`
          );
        } else {
          setMessage(j.message || "Done.");
        }
      } catch (e) {
        setMessage(summarizeRpcError(e) || "Request failed");
      } finally {
        setBusy(null);
      }
    },
    []
  );

  if (!testModeEnabled() || !visible) return null;

  return (
    <div className="mb-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-amber-950 shadow-sm">
      <p className="text-sm font-semibold text-amber-900/80">
        Test mode
      </p>
      <p className="mt-2 text-sm text-amber-950/90">
        Test Data Controls: synthetic accounts only. Not shown to non-admins.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            void call("/api/admin/test/create-user", "a", { role: "artist" })
          }
          className="rounded-full border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition hover:bg-white disabled:opacity-50"
        >
          {busy === "a" ? "…" : "Create test artist"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            void call("/api/admin/test/create-user", "c", { role: "collector" })
          }
          className="rounded-full border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition hover:bg-white disabled:opacity-50"
        >
          {busy === "c" ? "…" : "Create test collector"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            void call("/api/admin/test/create-user", "g", { role: "gallery" })
          }
          className="rounded-full border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition hover:bg-white disabled:opacity-50"
        >
          {busy === "g" ? "…" : "Create test gallery"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void call("/api/admin/test/reset", "r")}
          className="rounded-full border border-red-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-red-900 transition hover:bg-white disabled:opacity-50"
        >
          {busy === "r" ? "…" : "Reset test data"}
        </button>
      </div>
      {message ? (
        <p className="mt-3 whitespace-pre-wrap break-all text-xs text-amber-950/85">
          {message}
        </p>
      ) : null}
    </div>
  );
}
