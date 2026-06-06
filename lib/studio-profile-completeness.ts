export type CompletenessWeight = "required" | "recommended" | "optional" | "informational";

export type ProfileCompletenessItem = {
  id: string;
  label: string;
  done: boolean;
  weight: CompletenessWeight;
};

export type ProfileCompletenessSnapshot = {
  items: ProfileCompletenessItem[];
  completedCount: number;
  totalCount: number;
  /** Studio-only stewardship meter — never shown on Field. */
  percent: number;
};

function snapshotFromItems(items: ProfileCompletenessItem[]): ProfileCompletenessSnapshot {
  const scorable = items.filter((item) => item.weight !== "informational");
  const completedCount = scorable.filter((item) => item.done).length;
  const totalCount = scorable.length;
  const percent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return { items, completedCount, totalCount, percent };
}

export function buildCreativeProfileCompleteness(args: {
  profilePublic: boolean;
  bio: string;
  declaredPracticeCount: number;
  hasWebsiteOrInstagram: boolean;
  verifiedWorkCount: number;
  hasRepresentationSignal: boolean;
}): ProfileCompletenessSnapshot {
  const bioPresent = args.bio.trim().length >= 24;

  return snapshotFromItems([
    {
      id: "profile",
      label: "Public profile enabled",
      done: args.profilePublic,
      weight: "required",
    },
    {
      id: "bio",
      label: "Biography on file",
      done: bioPresent,
      weight: "recommended",
    },
    {
      id: "practice",
      label: "At least one declared practice",
      done: args.declaredPracticeCount > 0,
      weight: "recommended",
    },
    {
      id: "links",
      label: "Website or social link",
      done: args.hasWebsiteOrInstagram,
      weight: "optional",
    },
    {
      id: "verified_work",
      label: "Verified work on public footprint",
      done: args.verifiedWorkCount > 0,
      weight: "recommended",
    },
    {
      id: "representation",
      label: "Representation or participation visible",
      done: args.hasRepresentationSignal,
      weight: "informational",
    },
  ]);
}

export function buildOrganisationProfileCompleteness(args: {
  profilePublic: boolean;
  description: string;
  location: string;
  locationVisible: boolean;
  rosterPublicCount: number;
  organisationVerified: boolean;
}): ProfileCompletenessSnapshot {
  const locationRequired = args.locationVisible;

  return snapshotFromItems([
    {
      id: "profile",
      label: "Public profile enabled",
      done: args.profilePublic,
      weight: "required",
    },
    {
      id: "description",
      label: "Public description on file",
      done: Boolean(args.description.trim()),
      weight: "recommended",
    },
    {
      id: "location",
      label: "Location on file",
      done: !locationRequired || Boolean(args.location.trim()),
      weight: locationRequired ? "recommended" : "optional",
    },
    {
      id: "roster",
      label: "Represented Creative on public roster",
      done: args.rosterPublicCount > 0,
      weight: "recommended",
    },
    {
      id: "verified",
      label: "Organisation verification on file",
      done: args.organisationVerified,
      weight: "informational",
    },
  ]);
}
