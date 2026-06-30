"use client";

import { CurrencyCombobox } from "@/components/ui/CurrencyCombobox";
import type { DealIntent, DealTermField } from "@/lib/deal-intents";

type Props = {
  intent?: DealIntent;
  fields?: DealTermField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  idPrefix?: string;
  embedded?: boolean;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12";

function renderField(
  field: DealTermField,
  value: string,
  onChange: (key: string, value: string) => void,
  idPrefix: string
) {
  const id = `${idPrefix}-${field.key}`;

  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={`${fieldClass} resize-y min-h-[6rem]`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={fieldClass}
      >
        <option value="">Select</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "currency_code") {
    return (
      <CurrencyCombobox
        id={id}
        value={String(value || "").toUpperCase()}
        onChange={(code) => onChange(field.key, code)}
      />
    );
  }

  const inputType =
    field.type === "date" ? "date" : field.type === "number" || field.type === "currency" ? "number" : "text";

  return (
    <input
      id={id}
      type={inputType}
      value={value}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={fieldClass}
      min={inputType === "number" ? "0" : undefined}
      step={field.type === "currency" ? "0.01" : undefined}
    />
  );
}

export function DealTermsForm({
  intent,
  fields,
  values,
  onChange,
  idPrefix = "deal-term",
  embedded = false,
}: Props) {
  const resolvedFields = fields ?? intent?.fields ?? [];
  if (resolvedFields.length === 0) return null;

  const fieldsBody = (
    <div className="space-y-5">
      {resolvedFields.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`${idPrefix}-${field.key}`}
            className="text-sm font-medium text-neutral-700"
          >
            {field.label}
            {field.required ? (
              <span className="ml-1 text-neutral-400" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          {renderField(field, values[field.key] ?? "", onChange, idPrefix)}
        </div>
      ))}
    </div>
  );

  if (embedded) return fieldsBody;

  return (
    <div className="rounded-2xl border border-neutral-900/[0.06] bg-white/75 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7">
      {fieldsBody}
    </div>
  );
}
