"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type EvidenceType = "document" | "image" | "certificate" | "external_link";

type DisputeRow = {
  id: string;
  created_at: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
};

type EvidenceRow = {
  id: string;
  created_at: string;
  dispute_id: string;
  type: EvidenceType;
  file_url: string | null;
  file_hash?: string | null;
  signed_url: string | null;
  external_url: string | null;
  description: string | null;
  verified: boolean;
  record_fingerprint?: string | null;
  record_fingerprint_short?: string | null;
};

function formatDisputeStatus(raw: string) {
  const s = String(raw || "").toLowerCase().trim();
  switch (s) {
    case "pending":
      return "Pending";
    case "under_review":
      return "Under review";
    case "resolved":
      return "Resolved";
    case "rejected":
      return "Rejected";
    default:
      return raw || "–";
  }
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function guessEvidenceTypeFromMime(mime: string): EvidenceType {
  const m = String(mime || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  return "document";
}

export function DisputeEvidenceSection({ disputeId }: { disputeId: string }) {
  const [dispute, setDispute] = useState<DisputeRow | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadType, setUploadType] = useState<EvidenceType>("document");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkDesc, setLinkDesc] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [evidenceNotice, setEvidenceNotice] = useState<string | null>(null);

  const hasAnyEvidence = evidence.length > 0;

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dRes, eRes] = await Promise.all([
        fetch(`/api/disputes/get/${encodeURIComponent(disputeId)}`, {
          credentials: "include",
        }),
        fetch(`/api/disputes/evidence/${encodeURIComponent(disputeId)}`, {
          credentials: "include",
        }),
      ]);

      const dJson = (await dRes.json().catch(() => ({}))) as {
        error?: string;
        dispute?: DisputeRow;
      };
      if (!dRes.ok || !dJson.dispute) {
        setError(dJson.error || `Could not load dispute (${dRes.status}).`);
        setDispute(null);
        setEvidence([]);
        return;
      }
      setDispute(dJson.dispute);

      const eJson = (await eRes.json().catch(() => ({}))) as {
        error?: string;
        evidence?: EvidenceRow[];
      };
      if (!eRes.ok) {
        setError(eJson.error || `Could not load evidence (${eRes.status}).`);
        setEvidence([]);
        return;
      }
      setEvidence(Array.isArray(eJson.evidence) ? eJson.evidence : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  const canUpload = useMemo(() => {
    if (uploadBusy || loading) return false;
    return uploadType !== "external_link";
  }, [uploadBusy, loading, uploadType]);

  const submitFile = async (file: File) => {
    setUploadBusy(true);
    setError(null);
    try {
      // Step 1: upload bytes to private storage
      const fd = new FormData();
      fd.set("dispute_id", disputeId);
      fd.set("file", file);

      const upRes = await fetch("/api/disputes/upload-evidence", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const upJson = (await upRes.json().catch(() => ({}))) as {
        error?: string;
        file_url?: string;
        content_type?: string;
      };
      if (!upRes.ok || !upJson.file_url) {
        setError(upJson.error || `Upload failed (${upRes.status}).`);
        return;
      }

      // Step 2: append evidence row metadata
      const typeFinal =
        uploadType === "document" || uploadType === "image" || uploadType === "certificate"
          ? uploadType
          : guessEvidenceTypeFromMime(String(upJson.content_type || ""));

      const addRes = await fetch("/api/disputes/add-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dispute_id: disputeId,
          type: typeFinal,
          file_url: upJson.file_url,
          description: uploadDesc.trim() || null,
        }),
      });
      const addJson = (await addRes.json().catch(() => ({}))) as { error?: string };
      if (!addRes.ok) {
        setError(addJson.error || `Attach failed (${addRes.status}).`);
        return;
      }

      setUploadDesc("");
      setEvidenceNotice("Evidence submitted.");
      window.setTimeout(() => setEvidenceNotice(null), 4000);
      await refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setUploadBusy(false);
    }
  };

  const submitExternalLink = async () => {
    setLinkBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/disputes/add-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dispute_id: disputeId,
          type: "external_link",
          external_url: linkUrl.trim(),
          description: linkDesc.trim() || null,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error || `Request failed (${res.status}).`);
        return;
      }
      setLinkUrl("");
      setLinkDesc("");
      setEvidenceNotice("Evidence submitted.");
      window.setTimeout(() => setEvidenceNotice(null), 4000);
      await refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLinkBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      {loading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {dispute ? (
        <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/45 p-6 backdrop-blur-sm">
          <InfoTooltip text="Private challenge on your registry record. Status updates when staff complete review; evidence is append-only." />
          <p className="text-[13px] font-semibold text-neutral-800">
            Dispute
          </p>
          <div className="mt-4 space-y-2 text-sm text-neutral-800">
            <p>
              <span className="font-medium text-neutral-950">Status:</span>{" "}
              {formatDisputeStatus(dispute.status)}
            </p>
            <p>
              <span className="font-medium text-neutral-950">Submitted:</span>{" "}
              {formatWhen(dispute.created_at)}
            </p>
            <p>
              <span className="font-medium text-neutral-950">Reason:</span>{" "}
              {dispute.reason}
            </p>
            <p className="whitespace-pre-wrap text-neutral-700">
              {dispute.details}
            </p>
            {dispute.resolution ? (
              <div className="mt-4 rounded-xl border border-neutral-300/70 bg-neutral-50/60 p-4">
                <p className="text-[13px] font-semibold text-neutral-800">
                  Resolution
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">
                  {dispute.resolution}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/45 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <InfoTooltip text="Evidence is private. Links to files use signed URLs and expire." />
            <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
              Evidence
            </h2>
            {evidenceNotice ? (
              <p className="mt-2 text-sm font-medium text-neutral-800" role="status">
                {evidenceNotice}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-neutral-200/90 bg-white/70 p-4">
            <h3 className="text-[13px] font-semibold text-neutral-800">
              Upload a file
            </h3>
            <p className="mt-2 text-[12px] text-neutral-500">
              PDF, images, and Word docs up to 15MB.
            </p>

            <label className="mt-4 block text-[12px] font-medium text-neutral-700">
              Type
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as EvidenceType)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
                disabled={uploadBusy}
              >
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="certificate">Certificate</option>
              </select>
            </label>

            <label className="mt-3 block text-[12px] font-medium text-neutral-700">
              Description (optional)
              <input
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
                placeholder="e.g. invoice, exhibition photo, certificate scan"
                disabled={uploadBusy}
              />
            </label>

            <label className="mt-3 block text-[12px] font-medium text-neutral-700">
              File
              <input
                type="file"
                className="mt-1.5 block w-full text-sm text-neutral-700"
                disabled={!canUpload}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f) void submitFile(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            {uploadBusy ? (
              <p className="mt-2 text-[12px] text-neutral-500" role="status">
                Uploading…
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-neutral-200/90 bg-white/70 p-4">
            <h3 className="text-[13px] font-semibold text-neutral-800">
              Add an external link
            </h3>
            <p className="mt-2 text-[12px] text-neutral-500">
              Use for public references. The registry will not display this publicly.
            </p>

            <label className="mt-4 block text-[12px] font-medium text-neutral-700">
              URL
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
                placeholder="https://…"
                disabled={linkBusy}
              />
            </label>
            <label className="mt-3 block text-[12px] font-medium text-neutral-700">
              Description (optional)
              <input
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-300/90 bg-white px-3 py-2 text-[14px] text-neutral-900 outline-none ring-neutral-900/5 focus:border-neutral-400 focus:ring-2"
                placeholder="What should staff look for?"
                disabled={linkBusy}
              />
            </label>
            <button
              type="button"
              disabled={linkBusy || linkUrl.trim().length < 8}
              onClick={() => void submitExternalLink()}
              className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {linkBusy ? "Adding…" : "Add link"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-[13px] font-semibold text-neutral-800">
            Submitted evidence
          </h3>
          {!hasAnyEvidence ? (
            <p className="mt-3 text-sm text-neutral-600">
              No evidence submitted yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {evidence.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-xl border border-neutral-200/90 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-950">
                        {ev.type.replace(/_/g, " ")}
                        {ev.verified ? (
                          <span className="ml-2 text-[12px] font-medium text-neutral-600">
                            Verified
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[12px] text-neutral-500">
                        {formatWhen(ev.created_at)}
                      </p>
                      {ev.record_fingerprint_short ? (
                        <p className="mt-2 text-[12px] text-neutral-600">
                          <span className="font-medium text-neutral-900">
                            Record fingerprint:
                          </span>{" "}
                          <span className="font-mono tabular-nums">
                            {ev.record_fingerprint_short}
                          </span>
                        </p>
                      ) : null}
                      {ev.description ? (
                        <p className="mt-2 text-sm text-neutral-700">
                          {ev.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {ev.signed_url ? (
                        <a
                          href={ev.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
                        >
                          Open file
                        </a>
                      ) : null}
                      {ev.external_url ? (
                        <a
                          href={ev.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
                        >
                          Open link
                        </a>
                      ) : null}
                      <Link
                        href={`/disputes/${encodeURIComponent(ev.dispute_id)}`}
                        className="text-[12px] text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-800"
                      >
                        View dispute
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

