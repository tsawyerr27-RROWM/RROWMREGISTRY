import type {
  OpportunityApplicationStatus,
  OrganisationOpportunityApplicationListItem,
} from "@/lib/field-opportunity-applications";

export type OpportunityApplicationReviewTab = "all" | OpportunityApplicationStatus;

export type OpportunityApplicationReviewMetrics = {
  total: number;
  submitted: number;
  shortlisted: number;
  selected: number;
  rejected: number;
  eligibilityOverrideRequests: number;
};

export type OpportunityApplicationReviewFilters = {
  tab: OpportunityApplicationReviewTab;
  overrideOnly: boolean;
};

export const OPPORTUNITY_APPLICATION_REVIEW_TABS: readonly OpportunityApplicationReviewTab[] =
  ["all", "submitted", "shortlisted", "selected", "rejected"];

export function computeOpportunityApplicationReviewMetrics(
  applications: readonly OrganisationOpportunityApplicationListItem[]
): OpportunityApplicationReviewMetrics {
  const metrics: OpportunityApplicationReviewMetrics = {
    total: applications.length,
    submitted: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
    eligibilityOverrideRequests: 0,
  };

  for (const application of applications) {
    switch (application.status) {
      case "submitted":
        metrics.submitted += 1;
        break;
      case "shortlisted":
        metrics.shortlisted += 1;
        break;
      case "selected":
        metrics.selected += 1;
        break;
      case "rejected":
        metrics.rejected += 1;
        break;
      default:
        break;
    }

    if (application.eligibility_override_requested) {
      metrics.eligibilityOverrideRequests += 1;
    }
  }

  return metrics;
}

export function opportunityApplicationReviewTabCount(
  metrics: OpportunityApplicationReviewMetrics,
  tab: OpportunityApplicationReviewTab
): number {
  switch (tab) {
    case "all":
      return metrics.total;
    case "submitted":
      return metrics.submitted;
    case "shortlisted":
      return metrics.shortlisted;
    case "selected":
      return metrics.selected;
    case "rejected":
      return metrics.rejected;
    default:
      return 0;
  }
}

export function filterOpportunityApplicationsForReview(
  applications: readonly OrganisationOpportunityApplicationListItem[],
  filters: OpportunityApplicationReviewFilters
): OrganisationOpportunityApplicationListItem[] {
  return applications.filter((application) => {
    if (filters.overrideOnly && !application.eligibility_override_requested) {
      return false;
    }
    if (filters.tab === "all") {
      return true;
    }
    return application.status === filters.tab;
  });
}
