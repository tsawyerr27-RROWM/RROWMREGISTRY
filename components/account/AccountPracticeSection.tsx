"use client";

import {
  AccountPanel,
  AccountSubsection,
  ToggleRow,
} from "@/components/account/account-ui";
import { rrowmFloatingBlock } from "@/styles/rrowm-theme";
import { PRACTICE_TYPES, practiceLabel } from "@/lib/practice-types";
import { MAX_DECLARED_PRACTICES } from "@/lib/studio-practice-settings";

type Props = {
  declaredSlugs: string[];
  primarySlug: string | null;
  practicesVisible: boolean;
  registryEvidenceSlugs: string[];
  onDeclaredSlugsChange: (slugs: string[]) => void;
  onPrimarySlugChange: (slug: string | null) => void;
  onPracticesVisibleChange: (visible: boolean) => void;
  saving: boolean;
};

export function AccountPracticeSection({
  declaredSlugs,
  primarySlug,
  practicesVisible,
  registryEvidenceSlugs,
  onDeclaredSlugsChange,
  onPrimarySlugChange,
  onPracticesVisibleChange,
  saving,
}: Props) {
  const atMax = declaredSlugs.length >= MAX_DECLARED_PRACTICES;

  const toggleDeclared = (slug: string) => {
    if (declaredSlugs.includes(slug)) {
      const nextDeclared = declaredSlugs.filter((s) => s !== slug);
      onDeclaredSlugsChange(nextDeclared);
      if (primarySlug === slug) {
        onPrimarySlugChange(nextDeclared.length === 1 ? nextDeclared[0] : null);
      }
      return;
    }
    if (atMax) return;
    const nextDeclared = [...declaredSlugs, slug];
    onDeclaredSlugsChange(nextDeclared);
    if (nextDeclared.length === 1) {
      onPrimarySlugChange(slug);
    }
  };

  return (
    <AccountPanel
      id="account-practice"
      title="Practice"
      description="Declare how you work on The Field. Registry-evidence practices are inferred from verified records and remain read-only."
    >
      <div className={`${rrowmFloatingBlock.compact} flex flex-col gap-10 px-4 py-6 md:px-6`}>
        <AccountSubsection
          title="Declared practices"
          description={`Select up to ${MAX_DECLARED_PRACTICES} practices from the canonical taxonomy. Saved explicitly in Studio, never inferred automatically.`}
        >
          <div className="flex flex-wrap gap-2">
            {PRACTICE_TYPES.map((practice) => {
              const selected = declaredSlugs.includes(practice.slug);
              const disabled = saving || (!selected && atMax);
              return (
                <button
                  key={practice.slug}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleDeclared(practice.slug)}
                className={`rounded-xl border px-4 py-3 text-sm transition ${
                  selected
                    ? "border-neutral-900/20 bg-neutral-950 text-white shadow-[0_4px_14px_rgba(25,20,10,0.08)]"
                    : "border-neutral-900/[0.08] bg-white text-neutral-700 hover:border-neutral-900/15 hover:shadow-[0_2px_8px_rgba(25,20,10,0.04)]"
                  } ${disabled && !selected ? "cursor-not-allowed opacity-50" : ""}`}
                  aria-pressed={selected}
                >
                  {practice.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500">
            {declaredSlugs.length} of {MAX_DECLARED_PRACTICES} declared
          </p>
        </AccountSubsection>

        {declaredSlugs.length > 1 ? (
          <AccountSubsection
            title="Primary practice"
            description="Shown first on your public Creative profile and explorer cards."
          >
            <fieldset className="space-y-2">
              <legend className="sr-only">Primary declared practice</legend>
              {declaredSlugs.map((slug) => (
                <label
                  key={slug}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-800 shadow-[0_2px_8px_rgba(25,20,10,0.03)]"
                >
                  <input
                    type="radio"
                    name="primary-practice"
                    checked={primarySlug === slug}
                    disabled={saving}
                    onChange={() => onPrimarySlugChange(slug)}
                    className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900/20"
                  />
                  {practiceLabel(slug)}
                </label>
              ))}
            </fieldset>
          </AccountSubsection>
        ) : null}

        <AccountSubsection
          title="Field visibility"
          description="Control whether practice chips appear on your public Creative profile and explorer cards."
        >
          <ToggleRow
            id="toggle-practices-visible"
            label="Show practices on public profile"
            hint="When off, declared and registry-evidence practices are hidden on The Field. Your selections are preserved in Studio."
            checked={practicesVisible}
            onChange={onPracticesVisibleChange}
            disabled={saving}
          />
        </AccountSubsection>

        {registryEvidenceSlugs.length > 0 ? (
          <AccountSubsection
            title="From verified Registry records"
            description="Read-only. Inferred from verified work mediums. Declared practices describe how you work; registry evidence reflects what is on file."
          >
            <div className="flex flex-wrap gap-1.5">
              {registryEvidenceSlugs.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 text-[11px] font-medium text-emerald-950/85"
                >
                  {practiceLabel(slug)}
                </span>
              ))}
            </div>
          </AccountSubsection>
        ) : null}
      </div>
    </AccountPanel>
  );
}
