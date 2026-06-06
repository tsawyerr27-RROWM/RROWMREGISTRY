"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import { CULTURAL_SECTOR_OPTIONS } from "@/lib/cultural-sectors";
import {
  BRIEF_TYPES,
  briefTypeLabel,
  participationModeLabel,
  type BriefType,
  type ParticipationMode,
} from "@/lib/opportunity-types";
import { PRACTICE_TYPES } from "@/lib/practice-types";
import { fieldOpportunityHref } from "@/lib/field-nav";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";

type BriefRow = {
  id: string;
  title: string;
  description: string | null;
  sector: string;
  practices_required: string[] | null;
  brief_type: BriefType;
  participation_mode: ParticipationMode;
  visibility_state: string;
  opens_at: string | null;
  closes_at: string | null;
  published_at: string | null;
};

type Props = {
  galleryId: string;
  galleryVerified: boolean;
  gallerySlug: string;
};

const EMPTY_FORM = {
  title: "",
  description: "",
  sector: "",
  brief_type: "open_call" as BriefType,
  participation_mode: "open" as ParticipationMode,
  practices_required: [] as string[],
  opens_at: "",
  closes_at: "",
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function OrganisationOpportunitiesSection({
  galleryId,
  galleryVerified,
}: Props) {
  const { t } = useLocalePreferences();
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const loadBriefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/studio/opportunities/briefs?gallery_id=${encodeURIComponent(galleryId)}`
      );
      const json = (await res.json()) as { briefs?: BriefRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load opportunities.");
      setBriefs(json.briefs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  useEffect(() => {
    void loadBriefs();
  }, [loadBriefs]);

  const editingBrief = useMemo(
    () => briefs.find((b) => b.id === editingId) ?? null,
    [briefs, editingId]
  );

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(brief: BriefRow) {
    setEditingId(brief.id);
    setForm({
      title: brief.title,
      description: brief.description || "",
      sector: brief.sector,
      brief_type: brief.brief_type,
      participation_mode: brief.participation_mode,
      practices_required: Array.isArray(brief.practices_required)
        ? brief.practices_required.filter(Boolean)
        : [],
      opens_at: toDatetimeLocal(brief.opens_at),
      closes_at: toDatetimeLocal(brief.closes_at),
    });
    setModalOpen(true);
  }

  function togglePractice(slug: string) {
    setForm((prev) => {
      const set = new Set(prev.practices_required);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
      return { ...prev, practices_required: [...set] };
    });
  }

  async function saveBrief() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        gallery_id: galleryId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        sector: form.sector,
        brief_type: form.brief_type,
        participation_mode: form.participation_mode,
        practices_required: form.practices_required,
        opens_at: fromDatetimeLocal(form.opens_at),
        closes_at: fromDatetimeLocal(form.closes_at),
      };

      const res = editingId
        ? await fetch(`/api/studio/opportunities/briefs/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/studio/opportunities/briefs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed.");

      setModalOpen(false);
      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publishBrief(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/opportunities/briefs/${id}/publish`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Publish failed.");
      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  async function unpublishBrief(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/opportunities/briefs/${id}/unpublish`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Unpublish failed.");
      await loadBriefs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unpublish failed.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12";

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
            {t("studio.opportunities.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            {t("studio.opportunities.lede")}
          </p>
          {!galleryVerified ? (
            <p className="mt-3 text-sm text-amber-900/90">
              {t("studio.opportunities.verificationRequired")}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {t("studio.opportunities.create")}
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">{t("studio.opportunities.loading")}</p>
      ) : briefs.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600">{t("studio.opportunities.empty")}</p>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-900/[0.06]">
          {briefs.map((brief) => (
            <li key={brief.id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                    {briefTypeLabel(brief.brief_type)} · {brief.visibility_state}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-neutral-950">{brief.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    {participationModeLabel(brief.participation_mode)}
                  </p>
                  {brief.visibility_state === "published" ? (
                    <a
                      href={fieldOpportunityHref(brief.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-emerald-900 underline decoration-emerald-900/25 underline-offset-2"
                    >
                      {t("studio.opportunities.viewOnField")}
                    </a>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(brief)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {t("studio.opportunities.edit")}
                  </button>
                  {brief.visibility_state === "published" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void unpublishBrief(brief.id)}
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                    >
                      {t("studio.opportunities.unpublish")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || !galleryVerified}
                      onClick={() => void publishBrief(brief.id)}
                      className="rounded-xl border border-emerald-900/15 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {t("studio.opportunities.publish")}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalShell isOpen={modalOpen} onClose={() => !busy && setModalOpen(false)}>
        <h2 className="font-serif text-xl text-neutral-950">
          {editingBrief
            ? t("studio.opportunities.editTitle")
            : t("studio.opportunities.createTitle")}
        </h2>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700">
              {t("studio.opportunities.field.title")}
            </label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              {t("studio.opportunities.field.description")}
            </label>
            <textarea
              className={`${inputClass} min-h-[120px]`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.sector")}
              </label>
              <select
                className={inputClass}
                value={form.sector}
                onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              >
                <option value="">{t("studio.opportunities.field.selectSector")}</option>
                {CULTURAL_SECTOR_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.type")}
              </label>
              <select
                className={inputClass}
                value={form.brief_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brief_type: e.target.value as BriefType }))
                }
              >
                {BRIEF_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {briefTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              {t("studio.opportunities.field.participationMode")}
            </label>
            <select
              className={inputClass}
              value={form.participation_mode}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  participation_mode: e.target.value as ParticipationMode,
                }))
              }
            >
              <option value="open">{participationModeLabel("open")}</option>
            </select>
            <p className="mt-2 text-xs text-neutral-500">
              {t("studio.opportunities.field.participationHint")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">
              {t("studio.opportunities.field.practices")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRACTICE_TYPES.map((p) => {
                const active = form.practices_required.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => togglePractice(p.slug)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "border-emerald-900/20 bg-emerald-50 text-emerald-950"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.opensAt")}
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.opens_at}
                onChange={(e) => setForm((f) => ({ ...f, opens_at: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.closesAt")}
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.closes_at}
                onChange={(e) => setForm((f) => ({ ...f, closes_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={busy || !form.title.trim() || !form.sector}
              onClick={() => void saveBrief()}
              className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </ModalShell>
    </section>
  );
}
