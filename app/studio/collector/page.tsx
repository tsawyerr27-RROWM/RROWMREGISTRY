import { permanentRedirect } from "next/navigation";

/** Legacy `/collector-studio` (exact) → canonical collector Studio (matrix R-02). */
export default function CollectorStudioLegacyRedirectPage() {
  permanentRedirect("/studio/collector");
}
