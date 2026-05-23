export type RepresentationAmendmentStatus =
  | "pending"
  | "withdrawn"
  | "accepted"
  | "declined";

export type RepresentationAmendmentRequesterRole = "artist" | "institution";

export type RepresentationAmendmentListItem = {
  id: string;
  artwork_id: string;
  gallery_id: string;
  requester_role: RepresentationAmendmentRequesterRole;
  notes: string;
  proposed_changes: Record<string, string>;
  status: RepresentationAmendmentStatus;
  created_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  artwork?: {
    title: string | null;
    registry_id: string | null;
    image_url: string | null;
    artist_id?: string | null;
  } | null;
  gallery?: { name: string | null } | null;
};

/** Build proposed_changes JSON from optional catalogue fields (omit empties). */
const PROPOSED_CHANGE_LABELS: Record<string, string> = {
  title: "Title",
  year: "Year",
  medium: "Medium",
  dimensions: "Dimensions",
  description: "Description",
};

export function proposedChangeFieldLabel(key: string): string {
  return PROPOSED_CHANGE_LABELS[key] ?? key.replace(/_/g, " ");
}

export function buildProposedChangesPayload(fields: {
  title?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
}): Record<string, string> {
  const out: Record<string, string> = {};
  const t = fields.title?.trim();
  const y = fields.year?.trim();
  const m = fields.medium?.trim();
  const d = fields.dimensions?.trim();
  const desc = fields.description?.trim();
  if (t) out.title = t;
  if (y) out.year = y;
  if (m) out.medium = m;
  if (d) out.dimensions = d;
  if (desc) out.description = desc;
  return out;
}

export function mapAmendmentRequestRow(
  raw: unknown
): RepresentationAmendmentListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (row.id == null || row.artwork_id == null || row.gallery_id == null)
    return null;

  const artRaw = row.artworks;
  const galRaw = row.galleries;
  const artObj = (Array.isArray(artRaw) ? artRaw[0] : artRaw) as
    | Record<string, unknown>
    | undefined
    | null;
  const galObj = (Array.isArray(galRaw) ? galRaw[0] : galRaw) as
    | Record<string, unknown>
    | undefined
    | null;

  const proposed: Record<string, string> = {};
  const pc = row.proposed_changes;
  if (pc && typeof pc === "object" && !Array.isArray(pc)) {
    for (const [k, v] of Object.entries(pc as Record<string, unknown>)) {
      if (v != null) proposed[k] = String(v);
    }
  }

  const role = String(row.requester_role || "").toLowerCase();
  const st = String(row.status || "").toLowerCase();

  return {
    id: String(row.id),
    artwork_id: String(row.artwork_id),
    gallery_id: String(row.gallery_id),
    requester_role: role === "institution" ? "institution" : "artist",
    notes: String(row.notes ?? ""),
    proposed_changes: proposed,
    status:
      st === "accepted" ||
      st === "declined" ||
      st === "withdrawn" ||
      st === "pending"
        ? (st as RepresentationAmendmentStatus)
        : "pending",
    created_at: row.created_at != null ? String(row.created_at) : null,
    resolved_at: row.resolved_at != null ? String(row.resolved_at) : null,
    resolution_notes:
      row.resolution_notes != null ? String(row.resolution_notes) : null,
    artwork: artObj
      ? {
          title: artObj.title != null ? String(artObj.title) : null,
          registry_id:
            artObj.registry_id != null ? String(artObj.registry_id) : null,
          image_url: artObj.image_url != null ? String(artObj.image_url) : null,
          artist_id: artObj.artist_id != null ? String(artObj.artist_id) : null,
        }
      : null,
    gallery: galObj
      ? { name: galObj.name != null ? String(galObj.name) : null }
      : null,
  };
}
