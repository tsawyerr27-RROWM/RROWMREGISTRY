"use client";

import {
  productRoleLabel,
  type SystemRole,
} from "@/lib/studio-terminology";
import type { MessageKey } from "@/lib/locale-messages";
import { rrowmFloatingBlock, rrowmSurface } from "@/styles/rrowm-theme";

export const accountFieldClass =
  "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3.5 text-[15px] text-neutral-900 shadow-[0_2px_8px_rgba(25,20,10,0.03)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export const accountTextareaClass = `${accountFieldClass} resize-none leading-relaxed`;

/** Vertical rhythm below AccountPresenceHero (StudioHeroSlab) */
export const accountBelowHeroClass = "mt-10 lg:mt-12";

export function AccountPanel({
  id,
  title,
  description,
  children,
  variant = "default",
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: "default" | "subtle";
}) {
  const base =
    variant === "subtle"
      ? `${rrowmFloatingBlock.compact} p-6 sm:p-7`
      : `${rrowmSurface.l1} p-7 sm:p-8`;

  return (
    <section
      id={id}
      className={`${base} ${id ? "scroll-mt-28" : ""}`}
    >
      <h2 className="font-serif text-[1.35rem] font-normal leading-snug tracking-tight text-neutral-950 md:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function AccountSubsection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {title ? (
        <div>
          <h3 className="text-[15px] font-medium text-neutral-900">{title}</h3>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function AccountFieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-[14px] font-medium text-neutral-700"
      >
        {children}
      </label>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function AccountReadOnlyValue({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <p
      className={`mt-2 rounded-xl border border-neutral-900/[0.08] px-4 py-3.5 text-[15px] ${
        muted ? "bg-neutral-50 text-neutral-600" : "bg-white text-neutral-900"
      }`}
    >
      {children}
    </p>
  );
}

export function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[15px] font-medium text-neutral-900">
          {label}
        </label>
        {hint ? (
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{hint}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-[background-color] duration-200 ease-out ${
          checked ? "bg-neutral-950" : "bg-neutral-200/90"
        } disabled:opacity-45`}
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function roleLabel(
  r: SystemRole,
  t: (key: MessageKey) => string
): string {
  return productRoleLabel(r, t);
}

export function normalizeOptionalWebsite(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
