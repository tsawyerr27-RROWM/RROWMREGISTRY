import { permanentRedirect } from "next/navigation";

/** Legacy `/provenance/stewardship` → `/provenance/studio`. */
export default async function ProvenanceStewardshipRedirect({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  const clean = registry_id.trim();
  permanentRedirect(`/artwork/${encodeURIComponent(clean)}/provenance/studio`);
}
