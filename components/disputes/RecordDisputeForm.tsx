"use client";

import { useState } from "react";
import Link from "next/link";

import type { DisputeTargetType } from "@/lib/disputes";
import { fetchRegistryCsrfToken } from "@/lib/registry-action-security/fetch-csrf";

type Props = {
  targetType: DisputeTargetType;
  targetId: string;
  /** Short label for the challenged record (e.g. work title, artist). */
  contextLabel?: string;
};

export function RecordDisputeForm({
  targetType,
  targetId,
  contextLabel,
}: Props) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const csrfToken = await fetchRegistryCsrfToken();
      if (!csrfToken) {
        setError("Could not prepare a secure session. Refresh the page and try again.");
        return;
      }
      const res = await fetch("/api/disputes/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
          details,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        dispute?: { id?: string };
      };
      if (!res.ok) {
        setError(
          typeof body.error === "string" && body.error.trim()
            ? body.error.trim()
            : `Request failed (${res.status}).`
        );
        return;
      }
      const id = body.dispute?.id ? String(body.dispute.id) : null;
      setCreatedId(id);
      setDone(true);
      setReason("");
      setDetails("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-sm text-neutral-600" role="status">
        <p>
          Your dispute was submitted. You will not receive public replies here; registry
          staff will review the record.
        </p>
        {createdId ? (
          <p className="mt-2">
            <Link
              href={`/disputes/${encodeURIComponent(createdId)}`}
              className="font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
            >
              Add evidence
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200/90 bg-white/70 p-4 shadow-sm">
      <h3 className="text-[13px] font-semibold text-neutral-800">
        Submit a challenge
      </h3>
      {contextLabel ? (
        <p className="mt-2 text-[13px] text-neutral-600">
          Record: <span className="font-medium text-neutral-900">{contextLabel}</span>
        </p>
      ) : null}
      <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
        Use for factual disagreements with how this registry entry is shown. Sign in is
        required; your identity is not shown on public pages.
      </p>
      <label className="mt-4 block text-[12px] font-medium text-neutral-700">
        Summary
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
          placeholder="Short summary of the issue"
          disabled={busy}
        />
      </label>
      <label className="mt-3 block text-[12px] font-medium text-neutral-700">
        Details
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
          placeholder="What should be corrected, and why? Include anything staff should verify."
          disabled={busy}
        />
      </label>
      {error ? (
        <p className="mt-2 text-[13px] text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={
          busy ||
          reason.trim().length < 4 ||
          details.trim().length < 12
        }
        onClick={() => void submit()}
        className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Submitting…" : "Submit dispute"}
      </button>
    </div>
  );
}
