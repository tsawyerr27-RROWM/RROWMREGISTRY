import type { DealType } from "@/lib/deal-status";

export type DealIntentId =
  | "commission_work"
  | "acquisition_interest"
  | "exhibition_invitation"
  | "representation_offer"
  | "licensing_request"
  | "collaboration_proposal";

export type DealTermFieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "currency"
  | "select";

export type DealTermField = {
  key: string;
  label: string;
  type: DealTermFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type DealIntent = {
  id: DealIntentId;
  label: string;
  summary: string;
  dealType: DealType;
  fields: DealTermField[];
};

function titleFromSubject(terms: Record<string, string>): string | null {
  const subject = String(terms.subject ?? terms.project_title ?? "").trim();
  return subject || null;
}

export const DEAL_INTENTS: DealIntent[] = [
  {
    id: "commission_work",
    label: "Commission work",
    summary: "Propose a new work or bespoke project with defined scope and terms.",
    dealType: "commission",
    fields: [
      {
        key: "subject",
        label: "Subject",
        type: "text",
        placeholder: "Untitled commission",
        required: true,
      },
      {
        key: "scope",
        label: "Scope",
        type: "textarea",
        placeholder: "Medium, dimensions, edition, or deliverables",
      },
      {
        key: "fee",
        label: "Fee",
        type: "currency",
        placeholder: "0",
      },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: [
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
          { value: "GBP", label: "GBP" },
          { value: "CHF", label: "CHF" },
          { value: "JPY", label: "JPY" },
        ],
      },
      {
        key: "deadline",
        label: "Target completion",
        type: "date",
      },
      {
        key: "delivery",
        label: "Delivery",
        type: "text",
        placeholder: "Studio pickup, courier, or installation",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
        placeholder: "Additional terms or context",
      },
    ],
  },
  {
    id: "acquisition_interest",
    label: "Acquisition interest",
    summary: "Start an acquisition deal with proposed commercial terms.",
    dealType: "acquisition",
    fields: [
      {
        key: "subject",
        label: "Work or lot",
        type: "text",
        placeholder: "Title, registry id, or catalogue reference",
        required: true,
      },
      {
        key: "offer_amount",
        label: "Offer amount",
        type: "currency",
        placeholder: "0",
      },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: [
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
          { value: "GBP", label: "GBP" },
          { value: "CHF", label: "CHF" },
          { value: "JPY", label: "JPY" },
        ],
      },
      {
        key: "payment_terms",
        label: "Payment terms",
        type: "text",
        placeholder: "Deposit, settlement window, or invoicing",
      },
      {
        key: "condition",
        label: "Condition notes",
        type: "textarea",
        placeholder: "Inspection, framing, or conservation requirements",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  {
    id: "exhibition_invitation",
    label: "Exhibition invitation",
    summary: "Invite participation in a forthcoming exhibition or presentation.",
    dealType: "exhibition",
    fields: [
      {
        key: "subject",
        label: "Exhibition title",
        type: "text",
        placeholder: "Working title or programme name",
        required: true,
      },
      {
        key: "venue",
        label: "Venue",
        type: "text",
        placeholder: "Gallery, institution, or fair",
      },
      {
        key: "start_date",
        label: "Opening",
        type: "date",
      },
      {
        key: "end_date",
        label: "Closing",
        type: "date",
      },
      {
        key: "installation",
        label: "Installation",
        type: "text",
        placeholder: "Dates, technical requirements, or layout",
      },
      {
        key: "insurance",
        label: "Insurance",
        type: "text",
        placeholder: "Coverage, valuation, or lender requirements",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  {
    id: "representation_offer",
    label: "Representation offer",
    summary: "Offer gallery or agency representation with commercial structure.",
    dealType: "representation",
    fields: [
      {
        key: "subject",
        label: "Representation scope",
        type: "text",
        placeholder: "Primary market, estate, or programme",
        required: true,
      },
      {
        key: "territory",
        label: "Territory",
        type: "text",
        placeholder: "Regions or markets covered",
      },
      {
        key: "duration",
        label: "Duration",
        type: "text",
        placeholder: "Term length or renewal structure",
      },
      {
        key: "commission_rate",
        label: "Commission",
        type: "text",
        placeholder: "Percentage or fee schedule",
      },
      {
        key: "exclusivity",
        label: "Exclusivity",
        type: "select",
        options: [
          { value: "exclusive", label: "Exclusive" },
          { value: "non_exclusive", label: "Non-exclusive" },
          { value: "project_based", label: "Project-based" },
        ],
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  {
    id: "licensing_request",
    label: "Licensing request",
    summary: "Request permission to reproduce or license a work for defined use.",
    dealType: "licensing",
    fields: [
      {
        key: "subject",
        label: "Licensed work",
        type: "text",
        placeholder: "Title or reference",
        required: true,
      },
      {
        key: "usage_scope",
        label: "Usage scope",
        type: "textarea",
        placeholder: "Editorial, commercial, digital, or print use",
      },
      {
        key: "territory",
        label: "Territory",
        type: "text",
        placeholder: "Geographic or platform limits",
      },
      {
        key: "duration",
        label: "Duration",
        type: "text",
        placeholder: "Term or campaign window",
      },
      {
        key: "fee",
        label: "License fee",
        type: "currency",
        placeholder: "0",
      },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: [
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
          { value: "GBP", label: "GBP" },
          { value: "CHF", label: "CHF" },
          { value: "JPY", label: "JPY" },
        ],
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  {
    id: "collaboration_proposal",
    label: "Collaboration proposal",
    summary: "Propose a joint project, edition, or shared production.",
    dealType: "collaboration",
    fields: [
      {
        key: "project_title",
        label: "Project title",
        type: "text",
        placeholder: "Working title",
        required: true,
      },
      {
        key: "scope",
        label: "Scope",
        type: "textarea",
        placeholder: "Roles, deliverables, and shared outcomes",
      },
      {
        key: "timeline",
        label: "Timeline",
        type: "text",
        placeholder: "Milestones or production window",
      },
      {
        key: "revenue_split",
        label: "Revenue split",
        type: "text",
        placeholder: "Split, royalty, or cost sharing",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
];

export function getDealIntent(id: DealIntentId | null | undefined): DealIntent | null {
  if (!id) return null;
  return DEAL_INTENTS.find((intent) => intent.id === id) ?? null;
}

export function buildDealTitle(
  intent: DealIntent,
  terms: Record<string, string>
): string {
  const fromTerms = titleFromSubject(terms);
  if (fromTerms) return fromTerms;
  return intent.label;
}

export function buildDealTermsPayload(
  intent: DealIntent,
  values: Record<string, string>
): Record<string, unknown> {
  const terms: Record<string, unknown> = { intent_id: intent.id };

  for (const field of intent.fields) {
    const raw = String(values[field.key] ?? "").trim();
    if (!raw) continue;

    if (field.type === "number" || field.type === "currency") {
      const n = Number(raw);
      terms[field.key] = Number.isFinite(n) ? n : raw;
      continue;
    }

    terms[field.key] = raw;
  }

  return terms;
}

export function validateDealTerms(
  intent: DealIntent,
  values: Record<string, string>
): string | null {
  for (const field of intent.fields) {
    if (!field.required) continue;
    const raw = String(values[field.key] ?? "").trim();
    if (!raw) return `${field.label} is required.`;
  }
  return null;
}

export function formatTermValue(
  field: DealTermField,
  value: unknown
): string {
  if (value == null) return "Not specified";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : "Not specified";
  }
  const raw = String(value).trim();
  if (!raw) return "Not specified";
  if (field.type === "select") {
    const match = field.options?.find((o) => o.value === raw);
    return match?.label ?? raw;
  }
  if (field.type === "date") {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
  }
  return raw;
}

function humanTermKey(key: string): string {
  return key
    .trim()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function termsToFormValues(terms: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(terms ?? {})) {
    if (key === "intent_id") continue;
    if (value == null) continue;
    if (typeof value === "number") {
      out[key] = Number.isFinite(value) ? String(value) : "";
      continue;
    }
    if (typeof value === "boolean") {
      out[key] = value ? "yes" : "no";
      continue;
    }
    const raw = String(value).trim();
    if (raw) out[key] = raw;
  }
  return out;
}

export function resolveTermFieldsForDeal(args: {
  type: string;
  terms: Record<string, unknown>;
}): DealTermField[] {
  const intentId = String(args.terms.intent_id ?? "").trim() as DealIntentId;
  const intent = getDealIntent(intentId);
  if (intent && intent.dealType === String(args.type ?? "").trim()) {
    return intent.fields;
  }

  const keys = Object.keys(args.terms ?? {})
    .filter((key) => key !== "intent_id")
    .sort((a, b) => a.localeCompare(b));

  return keys.map((key) => ({
    key,
    label: humanTermKey(key),
    type: "text" as const,
  }));
}

export function buildUpdatedTerms(
  existingTerms: Record<string, unknown>,
  fields: DealTermField[],
  values: Record<string, string>
): Record<string, unknown> {
  const terms: Record<string, unknown> = { ...existingTerms };

  for (const field of fields) {
    const raw = String(values[field.key] ?? "").trim();
    if (!raw) {
      delete terms[field.key];
      continue;
    }
    if (field.type === "number" || field.type === "currency") {
      const n = Number(raw);
      terms[field.key] = Number.isFinite(n) ? n : raw;
      continue;
    }
    terms[field.key] = raw;
  }

  return terms;
}
