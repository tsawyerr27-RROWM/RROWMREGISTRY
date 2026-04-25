import { StudioArtworkClient } from "@/components/Studio/StudioArtworkClient";

export default async function StudioArtworkPage({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  return <StudioArtworkClient registryId={registry_id} />;
}
