"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ArtworkReplayData } from "@/lib/get-artwork-replay-data";
import type { ReplayState } from "@/lib/artwork-replay-engine";
import {
  galleryAuthorityFromRecord,
  normUuid,
  replayPartial,
  sortEvents,
  stateBeforeEventAtIndex,
  stateSignature,
  timelineFromWire,
} from "@/lib/artwork-replay-engine";

function shortId(id: string | null | undefined): string {
  if (!id) return "–";
  const s = String(id);
  if (s.length <= 12) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

function wireForEvent(
  payload: ArtworkReplayData,
  eventId: string
): (typeof payload.events)[0] | undefined {
  return payload.events.find((e) => e.id === eventId);
}

function eventLabel(payload: ArtworkReplayData, eventId: string): string {
  const we = wireForEvent(payload, eventId);
  if (!we) return eventId;
  switch (we.type) {
    case "ownership":
      return `Transferred to ${shortId(we.data.to_user_id as string | null)}`;
    case "value": {
      const cur = String(we.data.currency || "").toUpperCase() || "?";
      const v = we.data.declared_value;
      return `Value set: ${cur} ${Number(v).toLocaleString()}`;
    }
    case "verification": {
      const src = String(we.data.source || "");
      if (src === "gallery") return "Gallery verification signal";
      if (src === "artist") return "Artist verification signal";
      if (src === "certificate") return "Certificate verification signal";
      return `Verification (${src || "?"})`;
    }
    case "certificate":
      return "Certificate issued";
    case "system":
      return "System / import";
    default:
      return we.type;
  }
}

function diffReplayState(a: ReplayState, b: ReplayState): {
  owner: [string, string] | null;
  verification: [string, string] | null;
  values: Array<{ currency: string; from: string; to: string }>;
  certs: [string, string] | null;
} {
  const ao = shortId(a.current_owner_id);
  const bo = shortId(b.current_owner_id);
  const owner: [string, string] | null = ao === bo ? null : [ao, bo];

  const av = a.verification_status;
  const bv = b.verification_status;
  const verification: [string, string] | null =
    av === bv ? null : [String(av), String(bv)];

  const currencies = new Set([...Object.keys(a.value_by_currency), ...Object.keys(b.value_by_currency)]);
  const values: Array<{ currency: string; from: string; to: string }> = [];
  for (const c of currencies) {
    const x = a.value_by_currency[c];
    const y = b.value_by_currency[c];
    const xs = x === undefined ? "–" : String(x);
    const ys = y === undefined ? "–" : String(y);
    if (xs !== ys) values.push({ currency: c, from: xs, to: ys });
  }

  const as = [...a.certificates]
    .map((x) => `${shortId(x.id)}${x.revoked ? "(rev)" : ""}`)
    .sort()
    .join(", ");
  const bs = [...b.certificates]
    .map((x) => `${shortId(x.id)}${x.revoked ? "(rev)" : ""}`)
    .sort()
    .join(", ");
  const certs: [string, string] | null =
    as === bs ? null : [as || "–", bs || "–"];

  return { owner, verification, values, certs };
}

type Loaded = { artworkId: string; payload: ArtworkReplayData };

export default function ReplayDebuggerClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Loaded[]>([]);
  const [permMode, setPermMode] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const mod = await import("@/lib/supabase");
      const supabase = mod.getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token ?? null);
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoaded([]);
    const raw = query
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!raw.length) {
      setError("Enter one or more artwork UUIDs.");
      return;
    }
    setLoading(true);
    try {
      const mod = await import("@/lib/supabase");
      const supabase = mod.getSupabaseBrowserClient();
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token ?? accessToken;
      const res = await fetch("/api/internal/replay-data", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ artworkIds: raw }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
        return;
      }
      const arr = json.artworks as Array<{ ok: boolean; data?: ArtworkReplayData; error?: string }>;
      const next: Loaded[] = [];
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item.ok && item.data) next.push({ artworkId: raw[i], payload: item.data });
        else if (!item.ok) setError(item.error || "Load failed");
      }
      if (next.length) setLoaded(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [query, accessToken]);

  if (loaded.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-[#1a1a1a]">
        <header className="mb-12 border-b border-black/10 pb-8">
          <p className="text-sm font-medium text-black/45">
            Forensics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-black">
            Visual replay debugger
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/60">
            Reconstruct provenance from events only. Replay state does not read{" "}
            <code className="text-xs text-black/50">current_owner_id</code> or{" "}
            <code className="text-xs text-black/50">verification_status</code> as inputs. Those columns are
            shown separately as DB cache for comparison.
          </p>
        </header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs font-medium text-black/50">
            Artwork id(s)
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="uuid or uuid, uuid…"
              className="mt-2 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/30 focus:border-black/40 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => void fetchData()}
            disabled={loading}
            className="border border-black bg-black px-6 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load"}
          </button>
        </div>
        {error ? (
          <p className="mt-6 text-sm text-red-700/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#fafafa] text-[#111]">
      <div className="border-b border-black/10 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-black/45">
              Forensics
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Visual replay debugger</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-black/60">
              <input
                type="checkbox"
                checked={permMode}
                onChange={(e) => setPermMode(e.target.checked)}
                className="accent-black"
              />
              Permutation test order
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-[200px] border border-black/15 bg-[#fafafa] px-3 py-2 text-sm focus:border-black/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="border border-black/20 bg-white px-4 py-2 text-xs font-medium hover:bg-black/5 disabled:opacity-40"
            >
              Reload
            </button>
          </div>
        </div>
        {error ? (
          <p className="mx-auto mt-4 max-w-[1400px] text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div
        className={`mx-auto grid max-w-[1400px] gap-8 px-6 py-10 ${loaded.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1"}`}
      >
        {loaded.map(({ artworkId, payload }) => (
          <ReplayPanel key={artworkId} artworkId={artworkId} payload={payload} permMode={permMode} />
        ))}
      </div>
    </div>
  );
}

function ReplayPanel({
  artworkId,
  payload,
  permMode,
}: {
  artworkId: string;
  payload: ArtworkReplayData;
  permMode: boolean;
}) {
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [lockedStep, setLockedStep] = useState<number | null>(null);
  const [focusCertId, setFocusCertId] = useState<string | null>(null);

  const authority = useMemo(
    () => galleryAuthorityFromRecord(payload.galleryAuthority),
    [payload.galleryAuthority]
  );
  const certMap = useMemo(() => new Map(Object.entries(payload.certRevokedById)), [payload.certRevokedById]);

  const rawTimeline = useMemo(
    () =>
      timelineFromWire(
        payload.events.map((e) => ({
          id: e.id,
          type: e.type,
          sortTs: e.sortTs,
          data: e.data,
        }))
      ),
    [payload.events]
  );

  const timeline = useMemo(
    () => (permMode ? sortEvents(rawTimeline, "second_bucket") : sortEvents(rawTimeline, "full")),
    [rawTimeline, permMode]
  );

  const canonicalTimeline = useMemo(() => sortEvents(rawTimeline, "full"), [rawTimeline]);

  const permOutcomeDiffers = useMemo(() => {
    const a = replayPartial(
      sortEvents(rawTimeline, "full"),
      sortEvents(rawTimeline, "full").length,
      authority,
      certMap,
      payload.meta
    ).state;
    const b = replayPartial(
      sortEvents(rawTimeline, "second_bucket"),
      sortEvents(rawTimeline, "second_bucket").length,
      authority,
      certMap,
      payload.meta
    ).state;
    return stateSignature(a) !== stateSignature(b);
  }, [rawTimeline, authority, certMap, payload.meta]);

  const meta = payload.meta;
  const n = timeline.length;

  const activeStep =
    lockedStep !== null ? lockedStep : hoverStep !== null ? hoverStep : n;

  const stateAfter = useMemo(() => {
    return replayPartial(timeline, activeStep, authority, certMap, meta).state;
  }, [timeline, activeStep, authority, certMap, meta]);

  const stateBefore = useMemo(() => {
    if (activeStep <= 0) {
      return replayPartial(timeline, 0, authority, certMap, meta).state;
    }
    return replayPartial(timeline, activeStep - 1, authority, certMap, meta).state;
  }, [timeline, activeStep, authority, certMap, meta]);

  const diff = activeStep > 0 ? diffReplayState(stateBefore, stateAfter) : null;

  const issuesFor = (id: string) => payload.validation.eventIssues[id] ?? [];

  const eventAtStep =
    activeStep > 0 && activeStep <= n ? timeline[activeStep - 1] : null;

  const preCertState =
    focusCertId && eventAtStep?.kind === "certificate_issue" && eventAtStep.id === focusCertId
      ? stateBeforeEventAtIndex(
          canonicalTimeline,
          canonicalTimeline.findIndex((t) => t.id === focusCertId),
          authority,
          certMap,
          meta
        )
      : null;

  const snapJson =
    focusCertId && eventAtStep?.kind === "certificate_issue"
      ? JSON.stringify(eventAtStep.snapshot, null, 2)
      : null;

  const snapCompare =
    preCertState && eventAtStep?.kind === "certificate_issue"
      ? {
          replay_owner: preCertState.current_owner_id,
          snap_owner:
            eventAtStep.snapshot &&
            typeof eventAtStep.snapshot === "object" &&
            !Array.isArray(eventAtStep.snapshot)
              ? String((eventAtStep.snapshot as Record<string, unknown>).current_owner_id ?? "")
              : "",
        }
      : null;

  return (
    <div className="flex flex-col gap-0 border border-black/10 bg-white">
      {permMode && permOutcomeDiffers ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
          Ordering ambiguity detected. This record is not deterministic under alternate legal orderings
          of simultaneous events.
        </div>
      ) : null}
      {!permMode && payload.validation.ordering_ambiguous ? (
        <div className="border-b border-black/10 bg-black/[0.03] px-4 py-2 text-[11px] text-black/55">
          Validator flagged possible ordering sensitivity. Enable permutation mode to preview.
        </div>
      ) : null}

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_340px]">
        <div className="border-r border-black/10 px-4 py-6 md:px-6">
          <p className="text-sm font-medium text-black/40">Timeline</p>
          <p className="mt-1 font-mono text-xs text-black/55">{artworkId}</p>
          <ul className="relative mt-8 space-y-0 border-l border-black/10 pl-6">
            <li className="relative -ml-px pb-6 pl-2">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-black/20" />
              <button
                type="button"
                className={`text-left text-sm ${activeStep === 0 ? "text-black" : "text-black/55"}`}
                onClick={() => {
                  setLockedStep(0);
                  setFocusCertId(null);
                }}
              >
                Initial state
              </button>
            </li>
            {timeline.map((te, stepIdx) => {
              const orderIdx = stepIdx + 1;
              const iss = issuesFor(te.id);
              const isActive = activeStep === orderIdx;
              const we = wireForEvent(payload, te.id);
              return (
                <li key={te.id} className="relative -ml-px pb-6 pl-2">
                  <span
                    className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full ${
                      iss.length ? "bg-red-500" : isActive ? "bg-black" : "bg-black/25"
                    }`}
                  />
                  <button
                    type="button"
                    className={`group w-full text-left transition-colors duration-150 ${
                      isActive ? "text-black" : "text-black/60 hover:text-black/80"
                    }`}
                    onMouseEnter={() => setHoverStep(orderIdx)}
                    onMouseLeave={() => setHoverStep(null)}
                    onClick={() => {
                      setLockedStep(orderIdx);
                      setFocusCertId(te.kind === "certificate_issue" ? te.id : null);
                    }}
                  >
                    <span className="text-sm text-black/40">
                      {we?.type ?? te.kind.replace("_issue", "")}
                      {iss.length ? (
                        <span
                          className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-sm font-semibold tracking-normal text-white"
                          title={iss.join(" · ")}
                        >
                          Issue
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-snug">
                      {eventLabel(payload, te.id)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-black/45">
                      {we?.timestamp ?? new Date(te.ts).toISOString()}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="px-4 py-6 md:px-5">
          <p className="text-sm font-medium text-black/40">
            Replayed state
          </p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-sm text-black/40">Registry</dt>
              <dd className="mt-1 font-medium">{payload.artwork.registry_id ?? "–"}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/40">Artist</dt>
              <dd className="mt-1">{payload.artwork.artist_label ?? shortId(payload.artwork.artist_id)}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/40">Created</dt>
              <dd className="mt-1 font-mono text-xs text-black/70">
                {payload.artwork.created_at ?? "–"}
              </dd>
            </div>
            <div className="border-t border-black/10 pt-4">
              <dt className="text-sm text-black/40">Owner (replay)</dt>
              <dd className="mt-1 break-all">{shortId(stateAfter.current_owner_id)}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/40">Verification (replay)</dt>
              <dd className="mt-1 capitalize">{stateAfter.verification_status}</dd>
            </div>
            <div>
              <dt className="text-sm text-black/40">Values</dt>
              <dd className="mt-1 space-y-1 font-mono text-xs">
                {Object.keys(stateAfter.value_by_currency).length === 0 ? (
                  <span className="text-black/45">–</span>
                ) : (
                  Object.entries(stateAfter.value_by_currency).map(([k, v]) => (
                    <div key={k}>
                      {k} {Number(v).toLocaleString()}
                    </div>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-black/40">Certificates</dt>
              <dd className="mt-1 space-y-1 font-mono text-xs">
                {stateAfter.certificates.length === 0 ? (
                  <span className="text-black/45">–</span>
                ) : (
                  stateAfter.certificates.map((c) => (
                    <div key={c.id}>
                      {shortId(c.id)}
                      {c.revoked ? " · revoked" : ""}
                    </div>
                  ))
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-sm font-medium text-black/40">
              Step change
            </p>
            {diff && activeStep > 0 ? (
              <ul className="mt-3 space-y-2 text-xs leading-relaxed">
                {diff.owner ? (
                  <li>
                    <span className="text-black/45">Owner</span>
                    <div className="mt-0.5">
                      <span className="text-red-700/80 line-through">{diff.owner[0]}</span>
                      <span className="mx-1 text-black/30">→</span>
                      <span className="font-medium text-emerald-800">{diff.owner[1]}</span>
                    </div>
                  </li>
                ) : null}
                {diff.verification ? (
                  <li>
                    <span className="text-black/45">Verification</span>
                    <div className="mt-0.5">
                      {diff.verification[0]} → {diff.verification[1]}
                    </div>
                  </li>
                ) : null}
                {diff.values.map((v) => (
                  <li key={v.currency}>
                    <span className="text-black/45">Value {v.currency}</span>
                    <div className="mt-0.5">
                      {v.from} → {v.to}
                    </div>
                  </li>
                ))}
                {diff.certs ? (
                  <li>
                    <span className="text-black/45">Certificates</span>
                    <div className="mt-0.5 break-words">{diff.certs[1]}</div>
                  </li>
                ) : null}
                {!diff.owner &&
                !diff.verification &&
                diff.values.length === 0 &&
                !diff.certs ? (
                  <li className="text-black/45">No replayed fields changed at this step.</li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-black/45">Select a step to compare transition.</p>
            )}
          </div>

          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-sm font-medium text-black/40">
              DB cache (not replay input)
            </p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-black/50">
              owner {shortId(payload.artwork.db_cache.current_owner_id)} ·{" "}
              {payload.artwork.db_cache.verification_status ?? "–"}
            </p>
            {payload.validation.mismatches.length ? (
              <ul className="mt-2 list-inside list-disc text-[11px] text-red-700/90">
                {payload.validation.mismatches.slice(0, 5).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
            {payload.validation.warnings.length ? (
              <ul className="mt-2 text-[11px] text-amber-800/90">
                {payload.validation.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {focusCertId && snapJson ? (
            <div className="mt-8 border-t border-black/10 pt-6">
              <p className="text-sm font-medium text-black/40">
                Certificate snapshot
              </p>
              {snapCompare ? (
                <p className="mt-2 text-xs">
                  <span className="text-black/45">Replay owner at issuance</span>{" "}
                  <span className="font-mono">{shortId(snapCompare.replay_owner)}</span>
                  <br />
                  <span className="text-black/45">Snapshot current_owner_id</span>{" "}
                  <span
                    className={
                      normUuid(snapCompare.snap_owner) === normUuid(snapCompare.replay_owner)
                        ? "font-mono"
                        : "font-mono text-red-700"
                    }
                  >
                    {snapCompare.snap_owner || "–"}
                  </span>
                </p>
              ) : null}
              <pre className="mt-3 max-h-48 overflow-auto border border-black/10 bg-[#fafafa] p-3 font-mono text-[10px] leading-relaxed text-black/80">
                {snapJson}
              </pre>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
