export const OPPORTUNITY_APPLICATION_STATUSES = ["submitted"] as const;

export type OpportunityApplicationStatus =
  (typeof OPPORTUNITY_APPLICATION_STATUSES)[number];

export const OPPORTUNITY_APPLICATION_STATEMENT_MAX = 2000;

export type OpportunityApplicationRow = {
  id: string;
  opportunity_id: string;
  applicant_user_id: string;
  applicant_actor_id: string;
  status: OpportunityApplicationStatus;
  statement_text: string;
  created_at: string;
  updated_at: string;
};

export type FieldOpportunityApplyContext = {
  isAuthenticated: boolean;
  viewerRole: "artist" | "collector" | "gallery" | null;
  application: Pick<
    OpportunityApplicationRow,
    "id" | "status" | "created_at" | "updated_at"
  > | null;
};

export function normalizeOpportunityApplicationStatement(
  value: unknown
): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > OPPORTUNITY_APPLICATION_STATEMENT_MAX) return null;
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
  if (status === "submitted") return "Submitted";
  return status;
}

export type OrganisationOpportunityApplicationListItem = {
  id: string;
  applicant_name: string;
  applicant_role: string;
  status: OpportunityApplicationStatus;
  created_at: string;
};
