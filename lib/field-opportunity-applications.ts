import type {
  EligibilityMatchIndicator,
  PracticeApplyGateResult,
} from "@/lib/opportunity-eligibility";

export const OPPORTUNITY_APPLICATION_STATUSES = [
  "submitted",
  "shortlisted",
  "selected",
  "rejected",
] as const;

export type OpportunityApplicationStatus =
  (typeof OPPORTUNITY_APPLICATION_STATUSES)[number];

export const OPPORTUNITY_APPLICATION_STATEMENT_MAX = 2000;
export const OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN = 50;
export const OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX = 2000;

export type OpportunityApplicationRow = {
  id: string;
  opportunity_id: string;
  applicant_user_id: string;
  applicant_actor_id: string;
  status: OpportunityApplicationStatus;
  statement_text: string;
  eligibility_override_requested: boolean;
  eligibility_override_reason: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type FieldOpportunityApplyContext = {
  isAuthenticated: boolean;
  viewerRole: "artist" | "collector" | "gallery" | null;
  application: Pick<
    OpportunityApplicationRow,
    "id" | "status" | "created_at" | "updated_at"
  > | null;
  eligibilityIndicators: EligibilityMatchIndicator[];
  /** PR1C.5 discipline soft gate — set for signed-in creatives only. */
  practiceApplyGate: PracticeApplyGateResult | null;
};

export function normalizeOpportunityApplicationStatement(
  value: unknown
): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > OPPORTUNITY_APPLICATION_STATEMENT_MAX) return null;
  return trimmed;
}

export function normalizeEligibilityOverrideReason(value: unknown): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length < OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MIN) return null;
  if (trimmed.length > OPPORTUNITY_ELIGIBILITY_OVERRIDE_REASON_MAX) return null;
  return trimmed;
}

export function isOpportunityApplicationStatus(
  value: string
): value is OpportunityApplicationStatus {
  return (OPPORTUNITY_APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function opportunityApplicationStatusLabel(
  status: OpportunityApplicationStatus
): string {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "shortlisted":
      return "Shortlisted";
    case "selected":
      return "Selected";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export type OrganisationOpportunityApplicationListItem = {
  id: string;
  applicant_name: string;
  applicant_role: string;
  status: OpportunityApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  eligibility_override_requested: boolean;
  eligibility_override_reason: string | null;
};
