import type { MessageKey } from "@/lib/locale-messages";
import type { BriefType, ParticipationMode } from "@/lib/opportunity-types";

export type OpportunityBriefRow = {
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
  updated_at: string;
  eligible_disciplines: string[] | null;
  eligible_locations: string[] | null;
  eligible_career_stages: string[] | null;
  eligibility_notes: string | null;
  invitation_only: boolean | null;
  application_count?: number;
};

export type OpportunityEditorForm = {
  title: string;
  description: string;
  sector: string;
  brief_type: BriefType;
  participation_mode: ParticipationMode;
  practices_required: string[];
  opens_at: string;
  closes_at: string;
  eligible_disciplines: string[];
  eligible_locations: string[];
  eligible_career_stages: string[];
  eligibility_notes: string;
  invitation_only: boolean;
};

export const EMPTY_OPPORTUNITY_FORM: OpportunityEditorForm = {
  title: "",
  description: "",
  sector: "",
  brief_type: "open_call",
  participation_mode: "open",
  practices_required: [],
  opens_at: "",
  closes_at: "",
  eligible_disciplines: [],
  eligible_locations: [],
  eligible_career_stages: [],
  eligibility_notes: "",
  invitation_only: false,
};

export const OPPORTUNITY_EDITOR_INPUT_CLASS =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12";

export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function briefToEditorForm(brief: OpportunityBriefRow): OpportunityEditorForm {
  return {
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
    eligible_disciplines: Array.isArray(brief.eligible_disciplines)
      ? brief.eligible_disciplines.filter(Boolean)
      : [],
    eligible_locations: Array.isArray(brief.eligible_locations)
      ? brief.eligible_locations.filter(Boolean)
      : [],
    eligible_career_stages: Array.isArray(brief.eligible_career_stages)
      ? brief.eligible_career_stages.filter(Boolean)
      : [],
    eligibility_notes: brief.eligibility_notes || "",
    invitation_only: brief.invitation_only ?? false,
  };
}

export function buildOpportunitySavePayload(
  form: OpportunityEditorForm,
  galleryId: string
): Record<string, unknown> {
  const hasEligibilityInput =
    form.eligible_disciplines.length > 0 ||
    form.eligible_locations.length > 0 ||
    form.eligible_career_stages.length > 0 ||
    Boolean(form.eligibility_notes.trim()) ||
    form.invitation_only;

  return {
    gallery_id: galleryId,
    title: form.title.trim(),
    description: form.description.trim() || null,
    sector: form.sector,
    brief_type: form.brief_type,
    participation_mode: form.participation_mode,
    practices_required: form.practices_required,
    opens_at: fromDatetimeLocal(form.opens_at),
    closes_at: fromDatetimeLocal(form.closes_at),
    eligible_disciplines: form.eligible_disciplines,
    eligible_locations: form.eligible_locations,
    eligible_career_stages: form.eligible_career_stages,
    eligibility_notes: form.eligibility_notes.trim() || null,
    invitation_only: hasEligibilityInput ? form.invitation_only : null,
  };
}

export function formatOpportunityDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function opportunityVisibilityMessageKey(state: string): MessageKey {
  switch (state) {
    case "published":
      return "studio.opportunities.visibility.published";
    case "withdrawn":
      return "studio.opportunities.visibility.withdrawn";
    default:
      return "studio.opportunities.visibility.draft";
  }
}

export function opportunityVisibilityLabel(state: string): string {
  switch (state) {
    case "published":
      return "Published";
    case "withdrawn":
      return "Withdrawn";
    default:
      return "Draft";
  }
}

export function opportunityVisibilityLabelLocalized(
  state: string,
  t: (key: MessageKey) => string
): string {
  const label = t(opportunityVisibilityMessageKey(state));
  if (label !== "[missing message]") return label;
  return opportunityVisibilityLabel(state);
}
