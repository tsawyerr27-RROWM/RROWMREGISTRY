"use client";

import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  PROVENANCE_REGISTRY_DISCLAIMER,
  PROVENANCE_TRANSFER_TYPES,
  chronologyContinuationKindLabel,
  type ProvenanceTransferType,
} from "@/lib/provenance-transfer";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none focus:border-neutral-400";

export function ContinueProvenanceFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registryId = String(searchParams.get("registry_id") || "").trim();

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [artworkId, setArtworkId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [regs, setRegs] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [transferType, setTransferType] =
    useState<ProvenanceTransferType>("private_transfer");
  const [note, setNote] = useState("");
  const [confirmIntent, setConfirmIntent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!registryId) {
      setLoading(false);
      setEligible(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/provenance-transfer/eligibility?registry_id=${encodeURIComponent(registryId)}`
      );
      const j = (await res.json().catch(() => ({}))) as {
        eligible?: boolean;
        artwork_id?: string;
        title?: string;
        registry_id?: string;
        error?: string;
      };
      if (res.status === 401) {
        setEligible(false);
        setError("Sign in to continue.");
        return;
      }
      if (!res.ok) {
        setEligible(false);
        setError(
          typeof j.error === "string" ? j.error : "Could not verify eligibility."
        );
        return;
      }
      setEligible(Boolean(j.eligible));
      setArtworkId(typeof j.artwork_id === "string" ? j.artwork_id : null);
      setTitle(String(j.title || ""));
      setRegs(String(j.registry_id || registryId));
      if (!j.eligible) {
        setError(
          "Only the participant recorded as custodian on this verified catalogue record may invite the next recorded custodian."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [registryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!artworkId || !confirmIntent) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setError("Could not prepare a secure session. Refresh and try again.");
        return;
      }
      const res = await fetch("/api/provenance-transfer/initiate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          artwork_id: artworkId,
          recipient_email: recipientEmail.trim(),
          transfer_type: transferType,
          note: note.trim() || undefined,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        emailSent?: boolean;
        emailNotice?: string;
        ok?: boolean;
      };
      if (!res.ok) {
        setError(
          typeof j.error === "string" && j.error.trim()
            ? j.error.trim()
            : "Request failed."
        );
        return;
      }
      if (j.emailNotice) {
        setMessage(j.emailNotice);
      } else if (j.emailSent) {
        setMessage(
          "A formal invitation has been sent. The invited participant will receive a secure link by email."
        );
      } else {
        setMessage(
          "The invitation is prepared on file; email could not be sent automatically. Share the acceptance link with the invited participant if you already have a channel."
        );
      }
      window.setTimeout(
        () => router.push(`/artwork/${encodeURIComponent(registryId)}`),
        2600
      );
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const loginHref = `/login?next=${encodeURIComponent(`/collector-studio/continue-provenance?registry_id=${encodeURIComponent(registryId)}`)}`;

  if (!registryId) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-6 text-[14px] text-neutral-700">
        <p>
          Open this flow from a work you hold. Choose{" "}
          <strong>Continue chronology</strong> on the published work or chronology page.
        </p>
        <Link
          href="/collector-studio"
          className="mt-4 inline-block text-[13px] font-medium text-neutral-900 underline"
        >
          Collector studio
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-[14px] text-neutral-500">
        Checking studio access for this record…
      </p>
    );
  }

  if (error && !eligible) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white px-5 py-5 text-[14px] text-neutral-800">
          {error}
        </div>
        {error.includes("Sign in") ? (
          <Link
            href={loginHref}
            className="text-[14px] font-medium text-neutral-900 underline"
          >
            Sign in
          </Link>
        ) : (
          <Link
            href={`/artwork/${encodeURIComponent(regs || registryId)}`}
            className="text-[14px] text-neutral-600 underline"
          >
            Published work
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-neutral-200 pb-8">
        <InfoTooltip text="Invite the next recorded custodian so the historical record of this work can advance. Deliberate, on file, participant-confirmed." />
        <p className="mt-2 font-mono text-[11px] text-neutral-400">{regs}</p>
        <h1 className="mt-4 font-serif text-[1.75rem] font-normal tracking-[-0.01em] text-neutral-950 md:text-3xl">
          Continue the chronology
        </h1>
        <p className="mt-3 text-[15px] font-medium text-neutral-900">{title}</p>
      </header>

      <p className="text-[12px] leading-relaxed text-neutral-500">
        {PROVENANCE_REGISTRY_DISCLAIMER}
      </p>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div>
          <label className="block text-[13px] font-medium text-neutral-800">
            Next participant (email)
          </label>
          <input
            type="email"
            required
            className={inputClass}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            autoComplete="email"
          />
          <p className="mt-1.5 text-[12px] text-neutral-500">
            They will be asked to confirm before the chronology extends.
          </p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-neutral-800">
            How the custodial transition is narrated
          </label>
          <select
            className={inputClass}
            value={transferType}
            onChange={(e) =>
              setTransferType(e.target.value as ProvenanceTransferType)
            }
          >
            {PROVENANCE_TRANSFER_TYPES.map((t) => (
              <option key={t} value={t}>
                {chronologyContinuationKindLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-neutral-800">
            Context for the record{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
          />
          <p className="mt-1.5 text-[12px] text-neutral-500">
            Becomes part of the durable chronology when the invitation is accepted.
          </p>
        </div>

        <label className="flex cursor-pointer gap-3 rounded-lg border border-neutral-200/90 bg-neutral-50/50 px-4 py-3 text-[13px] leading-snug text-neutral-800">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300"
            checked={confirmIntent}
            onChange={(e) => setConfirmIntent(e.target.checked)}
          />
          <span>
            I confirm this step extends the chronology for this work and will become
            part of the historical registry record.
          </span>
        </label>

        {error ? (
          <p className="text-[13px] text-neutral-800">{error}</p>
        ) : null}
        {message ? (
          <p className="text-[13px] text-neutral-700">{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={
            submitting || !recipientEmail.trim() || !confirmIntent
          }
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-3 text-[14px] font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
        >
          {submitting ? "Sending invitation…" : "Send formal invitation"}
        </button>
      </form>

      <p className="text-[12px] text-neutral-500">
        <Link
          href={`/artwork/${encodeURIComponent(registryId)}#disputes`}
          className="underline decoration-neutral-300 underline-offset-2"
        >
          Formal review & challenges
        </Link>
      </p>
    </div>
  );
}
