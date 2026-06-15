"use client";

import { useMemo, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import {
  OPPORTUNITY_APPLICATION_STATEMENT_MAX,
  OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN,
  OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX,
  type OpportunityApplicationRow,
} from "@/lib/field-opportunity-applications";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
  requiresEligibilityOverride?: boolean;
  onSubmitted: (
    application: Pick<
      OpportunityApplicationRow,
      "id" | "status" | "created_at" | "updated_at"
    >
  ) => void;
};

export function OpportunityApplicationModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  requiresEligibilityOverride = false,
  onSubmitted,
}: Props) {
  const [statement, setStatement] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(() => statement.trim(), [statement]);
  const trimmedOverride = useMemo(() => overrideReason.trim(), [overrideReason]);
  const statementRemaining = OPPORTUNITY_APPLICATION_STATEMENT_MAX - statement.length;
  const overrideRemaining =
    OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX - overrideReason.length;

  const overrideValid =
    !requiresEligibilityOverride ||
    trimmedOverride.length >= OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN;

  const canSubmit = Boolean(trimmed) && overrideValid;

  async function handleSubmit() {
    setError(null);
    if (!trimmed) {
      setError("Statement of interest is required.");
      return;
    }
    if (trimmed.length > OPPORTUNITY_APPLICATION_STATEMENT_MAX) {
      setError(
        `Statement must be ${OPPORTUNITY_APPLICATION_STATEMENT_MAX} characters or fewer.`
      );
      return;
    }
    if (requiresEligibilityOverride) {
      if (!trimmedOverride) {
        setError(
          "Explain why your practice is relevant to this opportunity."
        );
        return;
      }
      if (trimmedOverride.length < OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN) {
        setError(
          `Justification must be at least ${OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN} characters.`
        );
        return;
      }
      if (trimmedOverride.length > OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX) {
        setError(
          `Justification must be ${OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX} characters or fewer.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/field/opportunities/${encodeURIComponent(opportunityId)}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            statement_text: trimmed,
            ...(requiresEligibilityOverride
              ? { eligibility_override_reason: trimmedOverride }
              : {}),
          }),
        }
      );
      const json = (await res.json()) as {
        application?: Pick<
          OpportunityApplicationRow,
          "id" | "status" | "created_at" | "updated_at"
        >;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || "Could not submit application.");
      }
      if (!json.application) {
        throw new Error("Could not submit application.");
      }
      setStatement("");
      setOverrideReason("");
      onSubmitted(json.application);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) onClose();
      }}
    >
      <h2 className="font-serif text-xl text-neutral-950">Apply to opportunity</h2>
      <p className="mt-2 text-sm text-neutral-600">{opportunityTitle}</p>

      <div className="mt-6">
        <label
          htmlFor="opportunity-application-statement"
          className="text-sm font-medium text-neutral-700"
        >
          Statement of interest
        </label>
        <textarea
          id="opportunity-application-statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          maxLength={OPPORTUNITY_APPLICATION_STATEMENT_MAX}
          rows={6}
          className="mt-2 w-full resize-y rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
          placeholder="Describe your interest and relevant practice."
        />
        <p className="mt-2 text-xs text-neutral-500">
          {statementRemaining} characters remaining
        </p>
      </div>

      {requiresEligibilityOverride ? (
        <div className="mt-6">
          <label
            htmlFor="opportunity-application-override-reason"
            className="text-sm font-medium text-neutral-700"
          >
            Explain why your practice is relevant to this opportunity
          </label>
          <textarea
            id="opportunity-application-override-reason"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            maxLength={OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX}
            rows={5}
            required
            className="mt-2 w-full resize-y rounded-xl border border-neutral-900/[0.08] bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
            placeholder="Describe how your interdisciplinary practice relates to this opportunity."
          />
          <p className="mt-2 text-xs text-neutral-500">
            {overrideRemaining} characters remaining · minimum{" "}
            {OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || !canSubmit}
          onClick={() => void handleSubmit()}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </ModalShell>
  );
}
