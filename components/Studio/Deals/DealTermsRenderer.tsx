"use client";

import type { DealRow } from "@/lib/deals";

type Props = {
  deal: DealRow;
};

type Row = {
  label: string;
  value: string;
};

function titleCase(value: string): string {
  const v = value.trim();
  if (!v) return "";
  return v[0].toUpperCase() + v.slice(1);
}

function humanKey(key: string): string {
  return key
    .trim()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatDate(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(amount: unknown, currency: unknown): string | null {
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  const cur = String(currency ?? "").trim().toUpperCase();
  if (!cur) return n.toLocaleString();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toLocaleString()} ${cur}`;
  }
}

function formatValue(value: unknown): string {
  if (value == null) return "Not specified";
  if (typeof value === "string") {
    const v = value.trim();
    return v || "Not specified";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : "Not specified";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    const items = value
      .map((v) => (typeof v === "string" ? v.trim() : String(v)))
      .filter(Boolean);
    return items.length ? items.join(", ") : "Not specified";
  }
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return "Not specified";
    if (keys.length === 1) return "Structured term";
    return `Structured terms (${keys.length} fields)`;
  }
  return String(value);
}

function rowsForSale(terms: Record<string, unknown>): Row[] {
  const currency = terms.currency ?? terms.price_currency ?? null;
  const price =
    formatMoney(terms.price ?? terms.amount ?? null, currency) ??
    formatMoney(terms.listing_price ?? null, currency) ??
    null;
  return [
    { label: "Price", value: price ?? "Not specified" },
    { label: "Payment terms", value: formatValue(terms.payment_terms) },
    { label: "Delivery", value: formatValue(terms.delivery) },
    { label: "Effective date", value: formatDate(terms.effective_date) ?? "Not specified" },
    { label: "Expiry", value: formatDate(terms.expiry) ?? "Not specified" },
    { label: "Notes", value: formatValue(terms.notes) },
  ];
}

function rowsForLoan(terms: Record<string, unknown>): Row[] {
  return [
    { label: "Start date", value: formatDate(terms.start_date) ?? "Not specified" },
    { label: "End date", value: formatDate(terms.end_date) ?? "Not specified" },
    { label: "Location", value: formatValue(terms.location) },
    { label: "Insurance", value: formatValue(terms.insurance) },
    { label: "Courier", value: formatValue(terms.courier) },
    { label: "Condition", value: formatValue(terms.condition) },
    { label: "Notes", value: formatValue(terms.notes) },
  ];
}

function rowsForConsignment(terms: Record<string, unknown>): Row[] {
  const currency = terms.currency ?? terms.price_currency ?? null;
  const listing = formatMoney(terms.listing_price ?? null, currency);
  const commission =
    typeof terms.commission_rate === "number"
      ? `${Math.round(terms.commission_rate * 1000) / 10}%`
      : formatValue(terms.commission_rate);
  return [
    { label: "Start date", value: formatDate(terms.start_date) ?? "Not specified" },
    { label: "End date", value: formatDate(terms.end_date) ?? "Not specified" },
    { label: "Listing price", value: listing ?? "Not specified" },
    { label: "Commission", value: commission },
    { label: "Settlement terms", value: formatValue(terms.settlement_terms) },
    { label: "Notes", value: formatValue(terms.notes) },
  ];
}

function rowsForExhibition(terms: Record<string, unknown>): Row[] {
  return [
    { label: "Venue", value: formatValue(terms.venue) },
    { label: "Start date", value: formatDate(terms.start_date) ?? "Not specified" },
    { label: "End date", value: formatDate(terms.end_date) ?? "Not specified" },
    { label: "Installation", value: formatValue(terms.installation) },
    { label: "Insurance", value: formatValue(terms.insurance) },
    { label: "Notes", value: formatValue(terms.notes) },
  ];
}

function unknownRows(
  terms: Record<string, unknown>,
  knownKeys: string[]
): Row[] {
  const known = new Set(knownKeys);
  const rows: Row[] = [];
  const keys = Object.keys(terms ?? {}).sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    if (known.has(key)) continue;
    rows.push({ label: humanKey(key), value: formatValue(terms[key]) });
  }
  return rows;
}

function section(title: string, rows: Row[]) {
  return (
    <div className="min-w-0">
      <h4 className="font-serif text-base font-normal tracking-tight text-neutral-950">
        {title}
      </h4>
      <dl className="mt-4 space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid min-w-0 grid-cols-1 gap-1 border-b border-neutral-900/[0.06] pb-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-[12px] font-medium text-neutral-600">{r.label}</dt>
            <dd className="min-w-0 break-words whitespace-normal text-[13px] leading-relaxed text-neutral-800">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function DealTermsRenderer({ deal }: Props) {
  const terms =
    deal.terms && typeof deal.terms === "object" && !Array.isArray(deal.terms)
      ? (deal.terms as Record<string, unknown>)
      : {};
  const type = String(deal.type ?? "").toLowerCase().trim();

  const typeTitle =
    type === "sale" || type === "loan" || type === "consignment" || type === "exhibition"
      ? titleCase(type)
      : "Deal";

  let primaryRows: Row[] = [];
  let knownKeys: string[] = [];

  if (type === "sale") {
    primaryRows = rowsForSale(terms);
    knownKeys = [
      "price",
      "amount",
      "listing_price",
      "currency",
      "price_currency",
      "payment_terms",
      "delivery",
      "effective_date",
      "expiry",
      "notes",
    ];
  } else if (type === "loan") {
    primaryRows = rowsForLoan(terms);
    knownKeys = [
      "start_date",
      "end_date",
      "location",
      "insurance",
      "courier",
      "condition",
      "notes",
    ];
  } else if (type === "consignment") {
    primaryRows = rowsForConsignment(terms);
    knownKeys = [
      "start_date",
      "end_date",
      "listing_price",
      "currency",
      "price_currency",
      "commission_rate",
      "settlement_terms",
      "notes",
    ];
  } else if (type === "exhibition") {
    primaryRows = rowsForExhibition(terms);
    knownKeys = ["venue", "start_date", "end_date", "installation", "insurance", "notes"];
  } else {
    const keys = Object.keys(terms ?? {});
    primaryRows = keys.map((k) => ({ label: humanKey(k), value: formatValue(terms[k]) }));
    knownKeys = keys;
  }

  const extra = unknownRows(terms, knownKeys);

  return (
    <div className="min-w-0 space-y-8">
      {section(`${typeTitle} terms`, primaryRows)}
      {extra.length > 0 ? section("Additional terms", extra) : null}
    </div>
  );
}

