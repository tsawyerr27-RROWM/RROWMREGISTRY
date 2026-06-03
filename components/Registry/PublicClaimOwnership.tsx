"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionSafe, getSupabaseBrowserClient } from "@/lib/supabase";
import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  artworkId: string;
  registryId: string;
  loginNextPath: string;
};

export function PublicClaimOwnership({
  artworkId,
  registryId,
  loginNextPath,
}: Props) {
  const { t } = useLocalePreferences();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const run = async () => {
      const session = await getSessionSafe();
      setUserId(session?.user?.id ?? null);
    };
    run();
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e: unknown, session: unknown) => {
        setUserId((session as { user?: { id?: string } })?.user?.id ?? null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const loginHref = `/login?next=${encodeURIComponent(loginNextPath)}`;

  const submit = async () => {
    if (!userId) return;
    const trimmed = note.trim();
    if (trimmed.length < 12) {
      alert(
        "Please add a short explanation (at least 12 characters) for the artist to review."
      );
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data: existing } = await supabase
      .from("ownership_claims")
      .select("id")
      .eq("artwork_id", artworkId)
      .eq("collector_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      setLoading(false);
      alert(t("registry.record.claim.pending"));
      return;
    }

    const { error } = await supabase.from("ownership_claims").insert({
      artwork_id: artworkId,
      collector_id: userId,
      note: trimmed,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      console.error(error);
      alert(error.message || t("registry.record.claim.error"));
      return;
    }
    void supabase.rpc("ownership_certificate_verify", {
      p_artwork_id: artworkId,
    });
    setDone(true);
    setOpen(false);
    setNote("");
  };

  if (userId === undefined) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
        {t("registry.record.claim.checkingSession")}
      </div>
    );
  }

  if (!userId) {
    return (
      <Link
        href={loginHref}
        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
      >
        {t("registry.record.claim.signIn")}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-black/[0.08] bg-white/80 px-4 py-3 text-sm font-medium text-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-md transition hover:bg-white"
      >
        {t("registry.record.claim.button")}
      </button>
      <ModalShell
        isOpen={open}
        onClose={() => !loading && setOpen(false)}
        tone="silver"
        panelClassName="relative max-w-md w-full p-8"
      >
        <p className="text-sm text-neutral-400">
          {t("registry.record.claim.title")}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-neutral-900">
          {t("registry.record.claim.request")}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {t("registry.record.claim.recordId")}{" "}
          <span className="font-mono text-neutral-800">{registryId}</span>.{" "}
          {t("registry.record.claim.artistReview")}
        </p>
        <textarea
          className="liquid-glass-inset mt-6 w-full bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900/20"
          rows={4}
          placeholder={t("registry.record.claim.placeholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="flex-1 rounded-xl bg-neutral-950 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading
              ? t("registry.record.claim.submitting")
              : t("registry.record.claim.submit")}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="border border-black/[0.1] bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 backdrop-blur-sm hover:bg-white/80"
          >
            {t("registry.record.claim.cancel")}
          </button>
        </div>
      </ModalShell>
      {done ? (
        <p className="mt-2 text-center text-xs text-emerald-700">
          {t("registry.record.claim.submitted")}
        </p>
      ) : null}
    </>
  );
}
