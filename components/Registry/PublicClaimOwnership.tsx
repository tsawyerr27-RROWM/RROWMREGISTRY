"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionSafe } from "@/lib/supabase";
import ModalShell from "@/components/ui/ModalShell";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import {
  OWNERSHIP_CLAIM_NOTE_MIN_LENGTH,
  type OwnershipClaimPath,
} from "@/lib/ownership-claim-eligibility";

type Props = {
  artworkId: string;
  registryId: string;
  loginNextPath: string;
  initialClaimPath?: OwnershipClaimPath | null;
};

export function PublicClaimOwnership({
  artworkId,
  registryId,
  loginNextPath,
  initialClaimPath = null,
}: Props) {
  const { t } = useLocalePreferences();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [claimPath, setClaimPath] = useState<OwnershipClaimPath | null>(
    initialClaimPath
  );
  const [pathLoading, setPathLoading] = useState(!initialClaimPath);

  useEffect(() => {
    if (initialClaimPath) {
      setClaimPath(initialClaimPath);
      setPathLoading(false);
    }
  }, [initialClaimPath]);

  useEffect(() => {
    const run = async () => {
      const session = await getSessionSafe();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setPathLoading(false);
        return;
      }

      if (initialClaimPath) {
        setClaimPath(initialClaimPath);
        setPathLoading(false);
        return;
      }

      setPathLoading(true);
      try {
        const res = await fetch(
          `/api/registry/ownership-claim?artwork_id=${encodeURIComponent(artworkId)}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const payload = (await res.json()) as { path?: OwnershipClaimPath };
          if (payload.path) setClaimPath(payload.path);
        } else {
          setClaimPath(null);
        }
      } catch {
        setClaimPath(null);
      } finally {
        setPathLoading(false);
      }
    };
    void run();
  }, [artworkId, initialClaimPath]);

  const loginHref = `/login?next=${encodeURIComponent(loginNextPath)}`;

  const submit = async () => {
    if (!userId) return;
    const trimmed = note.trim();
    if (trimmed.length < OWNERSHIP_CLAIM_NOTE_MIN_LENGTH) {
      alert(
        "Please add a short explanation (at least 12 characters) for the artist to review."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/registry/ownership-claim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artwork_id: artworkId,
          note: trimmed,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (res.status === 409) {
          const conflict = payload as {
            code?: string;
            accept_href?: string | null;
            error?: string;
          };
          if (conflict.code === "use_provenance_accept" && conflict.accept_href) {
            window.location.href = conflict.accept_href;
            return;
          }
          alert(conflict.error || t("registry.record.claim.pending"));
          return;
        }
        alert(payload.error || t("registry.record.claim.error"));
        return;
      }
      setDone(true);
      setOpen(false);
      setNote("");
    } catch {
      alert(t("registry.record.claim.error"));
    } finally {
      setLoading(false);
    }
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

  if (pathLoading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm text-neutral-500">
        Checking stewardship status…
      </div>
    );
  }

  if (claimPath?.kind === "already_owner") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
        Stewardship for this work is already recorded to your account.
      </div>
    );
  }

  if (claimPath?.kind === "provenance_accept") {
    const href = claimPath.accept_href;
    return href ? (
      <Link
        href={href}
        className="w-full rounded-xl border border-neutral-900 bg-neutral-950 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        Accept acquisition
      </Link>
    ) : (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
        {claimPath.message}
      </div>
    );
  }

  if (claimPath?.kind === "blocked" || !claimPath) {
    return null;
  }

  if (claimPath.kind !== "manual_eligible") {
    return null;
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
