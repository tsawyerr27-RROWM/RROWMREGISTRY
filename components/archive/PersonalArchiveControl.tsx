"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type Props = {
  artworkId: string;
  registryId: string;
  isSignedIn: boolean;
  initialArchived: boolean;
  initialCount: number;
  /** hero: artwork page; compact: verify page */
  variant?: "hero" | "compact";
  loginNextPath?: string;
};

function ArchiveBoxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 7l2-3h12l2 3M9 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PersonalArchiveControl({
  artworkId,
  registryId,
  isSignedIn,
  initialArchived,
  initialCount,
  variant = "hero",
  loginNextPath,
}: Props) {
  const { t } = useLocalePreferences();
  const [archived, setArchived] = useState(initialArchived);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countLine =
    count === 1
      ? fillMessage(t("archive.count.one"), { count: String(count) })
      : fillMessage(t("archive.count.many"), { count: String(count) });

  const loginHref = `/login?next=${encodeURIComponent(
    loginNextPath ?? `/artwork/${encodeURIComponent(registryId)}`
  )}`;

  const mutate = useCallback(
    async (action: "archive" | "remove") => {
      setBusy(true);
      setError(null);
      try {
        const csrfToken = await fetchRegistryCsrfToken();
        if (!csrfToken) {
          setError(t("archive.error.session"));
          return;
        }
        const res = await fetch("/api/personal-archive", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ artwork_id: artworkId, action }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          archived?: boolean;
          count?: number;
          schemaUnavailable?: boolean;
        };
        if (!res.ok) {
          setError(
            typeof body.error === "string" && body.error.trim()
              ? body.error.trim()
              : t("archive.error.generic")
          );
          if (body.schemaUnavailable) {
            setCount(0);
            setArchived(false);
          }
          return;
        }
        setArchived(Boolean(body.archived));
        if (typeof body.count === "number" && Number.isFinite(body.count)) {
          setCount(Math.max(0, Math.floor(body.count)));
        }
      } catch {
        setError(t("archive.error.generic"));
      } finally {
        setBusy(false);
      }
    },
    [artworkId, t]
  );

  const actionButton = (
    <button
      type="button"
      disabled={busy}
      onClick={() => void mutate(archived ? "remove" : "archive")}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-900 hover:decoration-neutral-500 disabled:opacity-50 ${
        variant === "compact" ? "text-[13px]" : ""
      }`}
    >
      <ArchiveBoxIcon />
      {archived ? t("archive.action.remove") : t("archive.action.archive")}
    </button>
  );

  const signInAction = (
    <Link
      href={loginHref}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-[3px] transition hover:text-neutral-900 ${
        variant === "compact" ? "text-[13px]" : ""
      }`}
    >
      <ArchiveBoxIcon />
      {t("archive.action.archive")}
    </Link>
  );

  return (
    <div
      className={
        variant === "hero"
          ? "border-t border-black/[0.05] pt-4"
          : "mt-6 border-t border-black/[0.06] pt-5"
      }
    >
      <div className="flex flex-col items-center gap-2 text-center">
        {isSignedIn ? actionButton : signInAction}
        <p
          className={`text-neutral-500 ${
            variant === "compact" ? "text-[11px] leading-relaxed" : "text-xs leading-relaxed"
          }`}
        >
          {countLine}
        </p>
        {error ? (
          <p className="text-xs text-red-700/90" role="alert">
            {error}
          </p>
        ) : null}
        {variant === "hero" ? (
          <p className="max-w-sm text-[11px] leading-relaxed text-neutral-400">
            {t("archive.footnote")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
