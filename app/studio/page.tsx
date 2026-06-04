import { permanentRedirect } from "next/navigation";

/** Legacy `/studio` → canonical Creative Studio (matrix R-01). */
export default function StudioLegacyRedirectPage() {
  permanentRedirect("/studio/creative");
}
