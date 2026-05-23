"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  OWNERSHIP_ACQUISITION_TYPES,
  acquisitionTypeLabel,
  type OwnershipAcquisitionType,
} from "@/lib/collector-ownership-claim";

type ArtworkPick = {
  id: string;
  title: string | null;
  registry_id: string | null;
  image_url: string | null;
  year?: string | null;
  medium?: string | null;
  artist_display_name?: string | null;
};

const stepCircle =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium";
const stepActive = "border-neutral-900 bg-neutral-900 text-white";
const stepDone = "border-neutral-400 bg-neutral-50 text-neutral-800";
const stepTodo = "border-neutral-200 bg-white text-neutral-400";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[13px] font-medium text-neutral-800">{children}</label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-0 transition focus:border-neutral-400";

export function ClaimOwnershipFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRegistryId = useMemo(
    () => String(searchParams.get("registry_id") || "").trim(),
    [searchParams]
  );

  const [step, setStep] = useState(1);
  const [artwork, setArtwork] = useState<ArtworkPick | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchHits, setSearchHits] = useState<ArtworkPick[]>([]);
  const [acquisitionType, setAcquisitionType] =
    useState<OwnershipAcquisitionType>("purchase");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [doneRegistryId, setDoneRegistryId] = useState<string | null>(null);
  const [accessGate, setAccessGate] = useState<"sign_in" | "collector_only" | null>(
    null
  );

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/collector/artworks-search?q=te");
      if (r.status === 401) setAccessGate("sign_in");
      else if (r.status === 403) setAccessGate("collector_only");
    })();
  }, []);

  const loadArtwork = useCallback(async (registryId: string) => {
    setLoadErr(null);
    const res = await fetch(
      `/api/collector/claim-artwork?registry_id=${encodeURIComponent(registryId)}`,
      { method: "GET" }
    );
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      artwork?: ArtworkPick;
    };
    if (res.status === 401) {
      setAccessGate("sign_in");
      setLoadErr("Sign in with a collector account to continue.");
      setArtwork(null);
      return;
    }
    if (res.status === 403) {
      setAccessGate("collector_only");
      setLoadErr("This flow is available to collector accounts.");
      setArtwork(null);
      return;
    }
    if (!res.ok) {
      setLoadErr(
        typeof body.error === "string" && body.error.trim()
          ? body.error.trim()
          : "Could not load this work."
      );
      setArtwork(null);
      return;
    }
    if (body.artwork?.id) {
      setArtwork(body.artwork);
      setStep(2);
    } else {
      setLoadErr("Artwork not found.");
      setArtwork(null);
    }
  }, []);

  useEffect(() => {
    if (!initialRegistryId) return;
    void loadArtwork(initialRegistryId);
  }, [initialRegistryId, loadArtwork]);

  useEffect(() => {
    if (!searchQ.trim() || searchQ.trim().length < 2) {
      setSearchHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const res = await fetch(
            `/api/collector/artworks-search?q=${encodeURIComponent(searchQ.trim())}`
          );
          const j = (await res.json().catch(() => ({}))) as {
            artworks?: ArtworkPick[];
            error?: string;
          };
          if (!res.ok) {
            setSearchHits([]);
            return;
          }
          setSearchHits(j.artworks || []);
        } finally {
          setSearching(false);
        }
      })();
    }, 320);
    return () => window.clearTimeout(t);
  }, [searchQ]);

  const selectArtwork = (row: ArtworkPick) => {
    setArtwork(row);
    setStep(2);
  };

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const submitClaim = async () => {
    if (!artwork?.id) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("artwork_id", artwork.id);
      fd.set("acquisition_type", acquisitionType);
      fd.set("acquisition_date", acquisitionDate);
      for (const f of files.slice(0, 5)) {
        fd.append("files", f);
      }
      const res = await fetch("/api/collector/ownership-claim", {
        method: "POST",
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        registry_id?: string | null;
      };
      if (!res.ok) {
        setSubmitErr(
          typeof j.error === "string" && j.error.trim()
            ? j.error.trim()
            : "Could not record your declaration."
        );
        return;
      }
      setDoneRegistryId(
        typeof j.registry_id === "string" && j.registry_id.trim()
          ? j.registry_id.trim()
          : artwork.registry_id
      );
      setStep(5);
    } catch {
      setSubmitErr("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const artworkHref =
    artwork?.registry_id != null && String(artwork.registry_id).trim()
      ? `/artwork/${encodeURIComponent(String(artwork.registry_id).trim())}`
      : null;

  const stepHeader = (n: number, label: string) => (
    <div className="flex items-center gap-3">
      <span className={`${stepCircle} ${step >= n ? (step > n ? stepDone : stepActive) : stepTodo}`}>
        {n}
      </span>
      <span className="text-[13px] font-medium text-neutral-600">{label}</span>
    </div>
  );

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg px-4 py-14 pb-24 pt-20 text-neutral-900 sm:px-6 sm:pt-24">
      <header className="border-b border-neutral-200 pb-8">
        {accessGate === "sign_in" ? (
          <p className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-800">
            <Link
              href={`/login?next=${encodeURIComponent("/collector-studio/claim-ownership")}`}
              className="font-medium underline decoration-neutral-300 underline-offset-4"
            >
              Sign in
            </Link>{" "}
            with a collector account to use this flow.
          </p>
        ) : null}
        {accessGate === "collector_only" ? (
          <p className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-800">
            This declaration flow is for collector accounts. Switch account or
            register as a collector to continue.
          </p>
        ) : null}
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Collector
        </p>
        <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight text-neutral-950 sm:text-3xl">
          Declare ownership
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
          You are declaring your position in relation to a registered work. This
          will be recorded as part of the provenance history.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {step === 1 ? (
          <section className="space-y-6">
            {stepHeader(1, "Context")}
            {initialRegistryId && loadErr ? (
              <p className="text-[14px] text-neutral-700">{loadErr}</p>
            ) : null}
            {initialRegistryId && !loadErr && !artwork ? (
              <p className="text-[14px] text-neutral-500">Loading artwork…</p>
            ) : null}
            {!initialRegistryId ? (
              <>
                <p className="text-[14px] leading-relaxed text-neutral-700">
                  Search the registry and select an existing verified work. You
                  cannot add a new listing from this flow.
                </p>
                <div>
                  <FieldLabel>Search by title or registry ID</FieldLabel>
                  <input
                    className={inputClass}
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Start typing…"
                    autoComplete="off"
                  />
                  {searching ? (
                    <p className="mt-2 text-[13px] text-neutral-500">Searching…</p>
                  ) : null}
                  {searchHits.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {searchHits.map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => selectArtwork(h)}
                            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
                          >
                            {h.image_url ? (
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={h.image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-14 w-14 shrink-0 rounded-lg bg-neutral-100" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-medium text-neutral-900">
                                {h.title?.trim() || "Untitled"}
                              </p>
                              <p className="truncate text-[12px] text-neutral-500">
                                {h.registry_id || h.id}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQ.trim().length >= 2 && !searching ? (
                    <p className="mt-3 text-[13px] text-neutral-500">
                      No matching verified works.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {step === 2 && artwork ? (
          <section className="space-y-6">
            {stepHeader(2, "Artwork")}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="flex gap-4">
                {artwork.image_url ? (
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-neutral-100" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-neutral-950">
                    {artwork.title?.trim() || "Untitled"}
                  </p>
                  {artwork.artist_display_name ? (
                    <p className="mt-1 text-[13px] text-neutral-600">
                      {artwork.artist_display_name}
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-[12px] text-neutral-500">
                    {artwork.registry_id || artwork.id}
                  </p>
                  {[artwork.year, artwork.medium].filter(Boolean).length ? (
                    <p className="mt-2 text-[13px] text-neutral-600">
                      {[artwork.year, artwork.medium].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setArtwork(null);
                  setStep(1);
                  setSearchQ("");
                  setSearchHits([]);
                  router.replace("/collector-studio/claim-ownership");
                }}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-[14px] font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Change work
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-xl bg-neutral-950 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-800"
              >
                Continue
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 && artwork ? (
          <section className="space-y-6">
            {stepHeader(3, "Ownership details")}
            <p className="text-[14px] leading-relaxed text-neutral-600">
              Provide the most accurate information available.
            </p>
            <div>
              <FieldLabel>Acquisition type</FieldLabel>
              <select
                className={inputClass}
                value={acquisitionType}
                onChange={(e) =>
                  setAcquisitionType(e.target.value as OwnershipAcquisitionType)
                }
              >
                {OWNERSHIP_ACQUISITION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {acquisitionTypeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                className={inputClass}
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-[14px] font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!acquisitionDate}
                onClick={goNext}
                className="flex-1 rounded-xl bg-neutral-950 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 && artwork ? (
          <section className="space-y-6">
            {stepHeader(4, "Evidence")}
            <div>
              <FieldLabel>Supporting documentation (optional)</FieldLabel>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                PDF or images up to 15MB each, five files maximum. Stored privately
                for verification.
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,application/pdf,image/*"
                className="mt-3 block w-full text-[13px] text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-neutral-800"
                onChange={(e) => {
                  const list = e.target.files ? Array.from(e.target.files) : [];
                  setFiles(list.slice(0, 5));
                }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-[14px] font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitErr(null);
                  goNext();
                }}
                className="flex-1 rounded-xl bg-neutral-950 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-800"
              >
                Review
              </button>
            </div>
          </section>
        ) : null}

        {step === 5 && !doneRegistryId && artwork ? (
          <section className="space-y-6">
            {stepHeader(5, "Confirmation")}
            <p className="text-[14px] text-neutral-700">
              You are about to record a declaration for{" "}
              <span className="font-medium text-neutral-900">
                {artwork.title?.trim() || "this work"}
              </span>
              .
            </p>
            <dl className="space-y-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Acquisition</dt>
                <dd className="text-right text-neutral-900">
                  {acquisitionTypeLabel(acquisitionType)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Date</dt>
                <dd className="text-right text-neutral-900">{acquisitionDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Attachments</dt>
                <dd className="text-right text-neutral-900">{files.length}</dd>
              </div>
            </dl>
            {submitErr ? (
              <p className="text-[13px] text-neutral-800">{submitErr}</p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-[14px] font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitClaim()}
                className="flex-1 rounded-xl bg-neutral-950 py-3 text-[14px] font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? "Recording…" : "Record declaration"}
              </button>
            </div>
          </section>
        ) : null}

        {step === 5 && doneRegistryId ? (
          <section className="space-y-6">
            {stepHeader(5, "Complete")}
            <p className="text-[16px] leading-relaxed text-neutral-900">
              Your ownership claim has been recorded.
            </p>
            <p className="text-[14px] leading-relaxed text-neutral-600">
              This claim may be subject to review and verification.
            </p>
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-4 text-[13px] leading-relaxed text-neutral-700">
              <p className="font-medium text-neutral-900">Disputes & evidence</p>
              <p>
                To challenge how this record appears, or to attach evidence to an
                existing review, use the dispute tools on the public artwork page.
              </p>
              <Link
                href={`/artwork/${encodeURIComponent(doneRegistryId)}#disputes`}
                className="inline-block font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
              >
                Open dispute tools on this record
              </Link>
              <p className="pt-1 text-[12px] text-neutral-500">
                Formal disputes create a private file where you can upload documents
                through the registry evidence workflow.
              </p>
            </div>
            <Link
              href="/collector-studio"
              className="inline-block text-[14px] font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
            >
              Return to collection
            </Link>
          </section>
        ) : null}
      </div>

      {artworkHref && step > 1 && step < 5 ? (
        <p className="mt-12 text-center text-[12px] text-neutral-500">
          <Link href={artworkHref} className="underline decoration-neutral-300 underline-offset-4">
            View public artwork
          </Link>
        </p>
      ) : null}
    </div>
  );
}
