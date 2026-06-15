"use client";

import { fieldOpportunityHref } from "@/lib/field-nav";
import { CULTURAL_SECTOR_OPTIONS } from "@/lib/cultural-sectors";
import {
  BRIEF_TYPES,
  briefTypeLabelLocalized,
  participationModeLabel,
  type BriefType,
  type ParticipationMode,
} from "@/lib/opportunity-types";
import {
  ELIGIBILITY_CAREER_STAGE_OPTIONS,
  ELIGIBILITY_DISCIPLINE_OPTIONS,
  ELIGIBILITY_LOCATION_OPTIONS,
} from "@/lib/opportunity-eligibility";
import { PRACTICE_TYPES } from "@/lib/practice-types";
import {
  formatOpportunityDate,
  OPPORTUNITY_EDITOR_INPUT_CLASS,
  opportunityVisibilityLabelLocalized,
  type OpportunityBriefRow,
  type OpportunityEditorForm,
} from "@/lib/opportunity-editor";
import { fillMessage } from "@/lib/locale-messages";
import { useLocalePreferences } from "@/components/providers/LocalePreferencesProvider";
import { OpportunityApplicationsPanel } from "@/components/Studio/Opportunities/OpportunityApplicationsPanel";
import type { OrganisationOpportunityApplicationListItem } from "@/lib/field-opportunity-applications";
import type { OpportunityApplicationStatus } from "@/lib/field-opportunity-applications";

type Props = {
  mode: "create" | "edit";
  focus?: "full" | "applications";
  brief: OpportunityBriefRow | null;
  form: OpportunityEditorForm;
  busy: boolean;
  galleryVerified: boolean;
  applications: OrganisationOpportunityApplicationListItem[];
  applicationsLoading: boolean;
  applicationStatusBusyId: string | null;
  onFormChange: (updater: (prev: OpportunityEditorForm) => OpportunityEditorForm) => void;
  onBack: () => void;
  onSwitchToEdit?: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onUpdateApplicationStatus: (
    applicationId: string,
    status: OpportunityApplicationStatus
  ) => void;
};

export function OpportunityEditorWorkspace({
  mode,
  focus = "full",
  brief,
  form,
  busy,
  galleryVerified,
  applications,
  applicationsLoading,
  applicationStatusBusyId,
  onFormChange,
  onBack,
  onSwitchToEdit,
  onSave,
  onPublish,
  onUnpublish,
  onUpdateApplicationStatus,
}: Props) {
  const { t } = useLocalePreferences();
  const inputClass = OPPORTUNITY_EDITOR_INPUT_CLASS;
  const reviewOnly = focus === "applications";

  const displayTitle =
    form.title.trim() ||
    (mode === "create"
      ? t("studio.opportunities.createTitle")
      : t("studio.opportunities.editTitle"));

  const statusLabel = brief
    ? opportunityVisibilityLabelLocalized(brief.visibility_state, t)
    : opportunityVisibilityLabelLocalized("draft", t);

  const updatedLabel = brief ? formatOpportunityDate(brief.updated_at) : null;

  function togglePractice(slug: string) {
    onFormChange((prev) => {
      const set = new Set(prev.practices_required);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
      return { ...prev, practices_required: [...set] };
    });
  }

  function toggleEligibilityArray(
    field: "eligible_disciplines" | "eligible_locations" | "eligible_career_stages",
    slug: string
  ) {
    onFormChange((prev) => {
      const set = new Set(prev[field]);
      if (set.has(slug)) set.delete(slug);
      else set.add(slug);
      return { ...prev, [field]: [...set] };
    });
  }

  const canSave = Boolean(form.title.trim() && form.sector);
  const isPublished = brief?.visibility_state === "published";

  return (
    <div className="min-h-0">
      <header className="sticky top-[calc(5rem+env(safe-area-inset-top,0px))] z-20 -mx-1 mb-8 border-b border-neutral-900/[0.08] bg-[rgba(250,250,249,0.92)] px-1 pb-4 backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              disabled={busy}
              className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950 disabled:opacity-50"
            >
              ← {t("studio.opportunities.backToList")}
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl text-neutral-950 md:text-3xl">{displayTitle}</h2>
              {!reviewOnly ? (
                <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                  {statusLabel}
                </span>
              ) : (
                <span className="rounded-full border border-emerald-900/15 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-950">
                  {t("studio.opportunities.applicationsHeading")}
                </span>
              )}
            </div>
            {updatedLabel ? (
              <p className="mt-2 text-sm text-neutral-500">
                {fillMessage(t("studio.opportunities.lastUpdated"), { date: updatedLabel })}
              </p>
            ) : null}
            {isPublished && brief ? (
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

          <div className="flex flex-wrap items-center justify-end gap-2">
            {reviewOnly && onSwitchToEdit ? (
              <button
                type="button"
                disabled={busy}
                onClick={onSwitchToEdit}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                {t("studio.opportunities.editDetails")}
              </button>
            ) : null}
            {!reviewOnly && mode === "edit" && brief ? (
              isPublished ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onUnpublish}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
                >
                  {t("studio.opportunities.unpublish")}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || !galleryVerified}
                  onClick={onPublish}
                  className="rounded-xl border border-emerald-900/15 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  {t("studio.opportunities.publish")}
                </button>
              )
            ) : null}
            {!reviewOnly ? (
            <button
              type="button"
              disabled={busy || !canSave}
              onClick={onSave}
              className="rounded-xl border border-neutral-900/[0.08] bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? t("common.saving") : t("studio.opportunities.saveDraft")}
            </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className={`mx-auto pb-16 ${reviewOnly ? "max-w-5xl" : "max-w-3xl space-y-8"}`}>
        {reviewOnly && brief ? (
          <>
            <p className="mb-6 text-sm leading-relaxed text-neutral-600">
              {t("studio.opportunities.applicationsHint")}
            </p>
            <OpportunityApplicationsPanel
              applications={applications}
              loading={applicationsLoading}
              busy={busy}
              applicationStatusBusyId={applicationStatusBusyId}
              onUpdateStatus={onUpdateApplicationStatus}
            />
          </>
        ) : (
          <>
        <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/80 p-6 md:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500">
            {t("studio.opportunities.section.basics")}
          </h3>
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.title")}
              </label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.field.description")}
              </label>
              <textarea
                className={`${inputClass} min-h-[160px]`}
                value={form.description}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/80 p-6 md:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500">
            {t("studio.opportunities.section.settings")}
          </h3>
          <div className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  {t("studio.opportunities.field.sector")}
                </label>
                <select
                  className={inputClass}
                  value={form.sector}
                  onChange={(e) =>
                    onFormChange((f) => ({ ...f, sector: e.target.value }))
                  }
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
                    onFormChange((f) => ({
                      ...f,
                      brief_type: e.target.value as BriefType,
                    }))
                  }
                >
                  {BRIEF_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {briefTypeLabelLocalized(type, t)}
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
                  onFormChange((f) => ({
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
                  onChange={(e) =>
                    onFormChange((f) => ({ ...f, opens_at: e.target.value }))
                  }
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
                  onChange={(e) =>
                    onFormChange((f) => ({ ...f, closes_at: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-900/[0.06] bg-white/80 p-6 md:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500">
            {t("studio.opportunities.eligibility.heading")}
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            {t("studio.opportunities.eligibility.hint")}
          </p>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.eligibility.disciplines")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ELIGIBILITY_DISCIPLINE_OPTIONS.map((option) => {
                  const active = form.eligible_disciplines.includes(option.slug);
                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() =>
                        toggleEligibilityArray("eligible_disciplines", option.slug)
                      }
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        active
                          ? "border-emerald-900/20 bg-emerald-50 text-emerald-950"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.eligibility.locations")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ELIGIBILITY_LOCATION_OPTIONS.map((option) => {
                  const active = form.eligible_locations.includes(option.slug);
                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() =>
                        toggleEligibilityArray("eligible_locations", option.slug)
                      }
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        active
                          ? "border-emerald-900/20 bg-emerald-50 text-emerald-950"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.eligibility.careerStages")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ELIGIBILITY_CAREER_STAGE_OPTIONS.map((option) => {
                  const active = form.eligible_career_stages.includes(option.slug);
                  return (
                    <button
                      key={option.slug}
                      type="button"
                      onClick={() =>
                        toggleEligibilityArray("eligible_career_stages", option.slug)
                      }
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        active
                          ? "border-emerald-900/20 bg-emerald-50 text-emerald-950"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                {t("studio.opportunities.eligibility.notes")}
              </label>
              <textarea
                className={`${inputClass} min-h-[96px]`}
                value={form.eligibility_notes}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, eligibility_notes: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.invitation_only}
                onChange={(e) =>
                  onFormChange((f) => ({ ...f, invitation_only: e.target.checked }))
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              {t("studio.opportunities.eligibility.invitationOnly")}
            </label>
          </div>
        </section>

        {mode === "edit" && brief ? (
          <OpportunityApplicationsPanel
            applications={applications}
            loading={applicationsLoading}
            busy={busy}
            applicationStatusBusyId={applicationStatusBusyId}
            onUpdateStatus={onUpdateApplicationStatus}
          />
        ) : null}
          </>
        )}
      </div>
    </div>
  );
}
