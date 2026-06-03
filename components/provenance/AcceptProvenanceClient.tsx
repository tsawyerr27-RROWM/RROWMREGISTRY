"use client";

import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PROVENANCE_REGISTRY_DISCLAIMER } from "@/lib/provenance-transfer";
import type { ProvenanceContinuationPreview } from "@/lib/provenance-transfer";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export function AcceptProvenanceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || "").trim();
  const [preview, setPreview] = useState<ProvenanceContinuationPreview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErr("Missing invitation link.");
      return;
    }
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/provenance-transfer/preview?token=${encodeURIComponent(token)}`
        );
        const j = (await res.json().catch(() => null)) as ProvenanceContinuationPreview | null;
        if (cancel) return;
        if (!j || typeof j.valid !== "boolean") {
          setErr("Could not load this invitation.");
          setPreview(null);
          return;
        }
        setPreview(j);
      } catch {
        if (!cancel) setErr("Could not load this invitation.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [token]);

  const accept = async () => {
    setBusy(true);
    setErr(null);
    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setErr("Could not prepare a secure session. Refresh and try again.");
        return;
      }
      const res = await fetch("/api/provenance-transfer/accept", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ token }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        setErr(
          typeof j.error === "string" && j.error.trim()
            ? j.error.trim()
            : "This step could not be completed."
        );
        return;
      }
      setDone(true);
      const reg = preview?.registryId?.trim();
      if (reg) {
        window.setTimeout(
          () => router.push(`/artwork/${encodeURIComponent(reg)}`),
          2400
        );
      } else {
        window.setTimeout(() => router.push("/account"), 2400);
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const loginHref = `/login?next=${encodeURIComponent(`/provenance/accept?token=${encodeURIComponent(token)}`)}`;

  if (loading) {
    return (
      <p className="text-center text-[14px] text-neutral-500">
        Opening invitation…
      </p>
    );
  }

  if (err && !preview) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-6 text-[14px] text-neutral-800">
        {err}
      </div>
    );
  }

  if (preview?.expired) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-6 text-[14px] leading-relaxed text-neutral-800">
        <p>
          This invitation has expired. The offering participant may send a new
          chronology continuation invitation when appropriate.
        </p>
      </div>
    );
  }

  if (preview?.completed) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-6 text-[14px] leading-relaxed text-neutral-800">
        <p>This continuation is already on file in the chronology.</p>
      </div>
    );
  }

  if (preview?.cancelled) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-6 text-[14px] leading-relaxed text-neutral-800">
        <p>This invitation is no longer active.</p>
      </div>
    );
  }

  if (!preview?.valid) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-6 text-[14px] text-neutral-800">
        <p>This invitation is not valid.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 rounded-xl border border-neutral-200/90 bg-white px-6 py-8 text-center shadow-[0_20px_50px_-40px_rgba(15,23,42,0.12)]">
        <InfoTooltip text="A new custodial chapter is now part of the historical record." />
        <p className="font-serif text-[1.35rem] font-normal text-neutral-950 md:text-[1.75rem]">
          The chronology has been continued.
        </p>
        <p className="text-[13px] text-neutral-500">
          Returning to the published record…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200/90 bg-white px-5 py-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.1)]">
        <InfoTooltip text="You have been identified as the next recorded custodian of this work. This invitation continues the historical record." />
        <p className="mt-2 font-mono text-[11px] text-neutral-400">
          {preview.registryId}
        </p>
        <h1 className="mt-4 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950">
          {preview.artworkTitle}
        </h1>

        <ol className="mt-8 list-none space-y-3 border-t border-neutral-100 pt-6 text-[13px] leading-relaxed text-neutral-600">
          <li className="flex gap-3">
            <span className="font-mono text-[11px] text-neutral-400">1.</span>
            <span>
              The offering participant is acknowledged on file:{" "}
              <span className="font-medium text-neutral-900">
                {preview.holderLabel}
              </span>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[11px] text-neutral-400">2.</span>
            <span>You confirm as the invited participant.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[11px] text-neutral-400">3.</span>
            <span>The chronology extends with a dated custodial milestone.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[11px] text-neutral-400">4.</span>
            <span>Continuity remains visible in the public chronology.</span>
          </li>
        </ol>

        <dl className="mt-8 space-y-3 border-t border-neutral-100 pt-5 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Transition narrated as</dt>
            <dd className="max-w-[55%] text-right text-neutral-900">
              {preview.transferTypeLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Invitation addressed to</dt>
            <dd className="text-right text-neutral-900">
              {preview.maskedRecipientEmail}
            </dd>
          </div>
        </dl>
      </div>

      <p className="text-[12px] leading-relaxed text-neutral-500">
        {PROVENANCE_REGISTRY_DISCLAIMER} This step does not constitute legal transfer of
        title or a determination of ownership by the registry.
      </p>

      {err ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-800">
          {err}
          {err.toLowerCase().includes("unauthorized") ||
          err.toLowerCase().includes("sign in") ? (
            <div className="mt-3">
              <Link
                href={loginHref}
                className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={busy}
          onClick={() => void accept()}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-5 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? "Extending chronology…" : "Confirm and extend chronology"}
        </button>
        <Link
          href={loginHref}
          className="text-center text-[13px] font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 sm:text-left"
        >
          Sign in as invited participant
        </Link>
      </div>
    </div>
  );
}
