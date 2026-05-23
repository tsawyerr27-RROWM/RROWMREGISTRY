"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  COLLECTOR_VAULT_CATEGORIES,
  COLLECTOR_VAULT_FRAME,
  textOnlyVaultCategories,
  vaultCategoryLabel,
  isVaultCategory,
} from "@/lib/collector-vault";

type VaultListItem = {
  id: string;
  categoryLabel: string;
  title: string | null;
  notes: string | null;
  hasFile: boolean;
  originalFilename: string | null;
  byteSize: number | null;
  createdAt: string;
  deletable: boolean;
};

function formatBytes(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const fileCategoryOptions = COLLECTOR_VAULT_CATEGORIES.filter(
  (c) => !textOnlyVaultCategories().includes(c)
);

export function CollectorVaultSection({
  registryId,
  loginNextHref,
  isLoggedIn,
  canViewVault,
  canWriteVault,
}: {
  registryId: string;
  loginNextHref: string;
  isLoggedIn: boolean;
  canViewVault: boolean;
  canWriteVault: boolean;
}) {
  const [items, setItems] = useState<VaultListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const base = `/api/collector/vault/${encodeURIComponent(registryId)}`;

  const load = useCallback(async () => {
    if (!canViewVault || !isLoggedIn) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(base, { credentials: "include" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not load materials.");
        setItems([]);
        return;
      }
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch {
      setError("Could not load materials.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, canViewVault, isLoggedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const m = new Map<string, VaultListItem[]>();
    for (const it of items) {
      const list = m.get(it.categoryLabel) ?? [];
      list.push(it);
      m.set(it.categoryLabel, list);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  async function onUpload(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!canWriteVault) return;
    const fd = new FormData(ev.currentTarget);
    setBusy("upload");
    setError(null);
    try {
      const res = await fetch(`${base}/upload`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : "Upload failed.");
        setBusy(null);
        return;
      }
      ev.currentTarget.reset();
      await load();
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onNote(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!canWriteVault) return;
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const cat = String(fd.get("category") || "").trim();
    if (!isVaultCategory(cat) || !textOnlyVaultCategories().includes(cat)) {
      setError("Invalid category.");
      setBusy(null);
      return;
    }
    const notes = String(fd.get("notes") || "").trim();
    const title = String(fd.get("title") || "").trim();
    setBusy("note");
    setError(null);
    try {
      const res = await fetch(`${base}/note`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: cat,
          notes,
          title: title || undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not save note.");
        setBusy(null);
        return;
      }
      form.reset();
      await load();
    } catch {
      setError("Could not save note.");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(id: string) {
    if (!canWriteVault) return;
    if (!window.confirm("Remove this vault entry?")) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/collector/vault/item/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not remove.");
        setBusy(null);
        return;
      }
      await load();
    } catch {
      setError("Could not remove.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white/80 px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:px-8 md:py-9">
      <h2 className="font-serif text-xl font-normal tracking-tight text-neutral-950">
        Private registry materials
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
        {COLLECTOR_VAULT_FRAME}
      </p>

      {!isLoggedIn ? (
        <p className="mt-6 text-sm text-neutral-700">
          <Link
            href={loginNextHref}
            className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
          >
            Sign in
          </Link>{" "}
          to see whether you can access private stewardship files for this work.
        </p>
      ) : !canViewVault ? (
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600">
          Private materials are available only to the current holder and the attributed artist.
          You do not have access to this vault.
        </p>
      ) : (
        <>
          {error ? (
            <p className="mt-5 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-6 text-sm text-neutral-500">Loading vault…</p>
          ) : grouped.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-600">
              No private materials on file yet.{canWriteVault ? " Add invoices, records, or references below." : ""}
            </p>
          ) : (
            <div className="mt-8 space-y-10">
              {grouped.map(([label, rows]) => (
                <section key={label}>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                    {label}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {rows.map((row) => (
                      <li
                        key={row.id}
                        className="rounded-lg border border-neutral-200/80 bg-neutral-50/50 px-4 py-3"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <time className="text-[11px] uppercase tracking-wide text-neutral-500">
                            {formatStamp(row.createdAt)}
                          </time>
                          {row.byteSize != null && row.hasFile ? (
                            <span className="text-[11px] text-neutral-400">
                              {formatBytes(row.byteSize)}
                            </span>
                          ) : null}
                        </div>
                        {row.title ? (
                          <p className="mt-2 text-sm font-medium text-neutral-900">{row.title}</p>
                        ) : null}
                        {row.hasFile ? (
                          <p className="mt-1 font-mono text-xs text-neutral-600">
                            {row.originalFilename ?? "File"}
                          </p>
                        ) : null}
                        {row.notes ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                            {row.notes}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-3">
                          {row.hasFile ? (
                            <a
                              href={`/api/collector/vault/item/${encodeURIComponent(row.id)}/download`}
                              className="text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-500"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open download
                            </a>
                          ) : null}
                          {row.deletable ? (
                            <button
                              type="button"
                              onClick={() => void onDelete(row.id)}
                              disabled={busy === row.id}
                              className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-800 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {canWriteVault ? (
            <div className="mt-10 space-y-10 border-t border-neutral-200/80 pt-10">
              <div>
                <h3 className="text-sm font-medium text-neutral-900">Add document</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  PDF, images, Word, or plain text. Files stay in private storage; downloads use
                  short-lived signed links.
                </p>
                <form className="mt-5 space-y-4" onSubmit={(e) => void onUpload(e)}>
                  <label className="block text-xs font-medium text-neutral-600">
                    Category
                    <select
                      name="category"
                      required
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      {fileCategoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {vaultCategoryLabel(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-neutral-600">
                    Title (optional)
                    <input
                      name="title"
                      type="text"
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="block text-xs font-medium text-neutral-600">
                    File
                    <input
                      name="file"
                      type="file"
                      required
                      className="mt-1.5 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border file:border-neutral-200 file:bg-white file:px-3 file:py-1.5 file:text-sm"
                    />
                  </label>
                  <label className="block text-xs font-medium text-neutral-600">
                    Note (optional)
                    <textarea
                      name="notes"
                      rows={2}
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy === "upload"}
                    className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {busy === "upload" ? "Uploading…" : "Add to vault"}
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-900">Internal note or shipping reference</h3>
                <p className="mt-1 text-xs text-neutral-500">Text-only registry; no file attachment.</p>
                <form className="mt-5 space-y-4" onSubmit={(e) => void onNote(e)}>
                  <label className="block text-xs font-medium text-neutral-600">
                    Category
                    <select
                      name="category"
                      required
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    >
                      {textOnlyVaultCategories().map((c) => (
                        <option key={c} value={c}>
                          {vaultCategoryLabel(c)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-neutral-600">
                    Title (optional)
                    <input
                      name="title"
                      type="text"
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="block text-xs font-medium text-neutral-600">
                    Text
                    <textarea
                      name="notes"
                      required
                      rows={4}
                      className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy === "note"}
                    className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-300 disabled:opacity-50"
                  >
                    {busy === "note" ? "Saving…" : "Save reference"}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
