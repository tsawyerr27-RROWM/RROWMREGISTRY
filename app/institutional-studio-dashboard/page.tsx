import { permanentRedirect } from "next/navigation";

/** Legacy organisation dashboard → canonical Studio (matrix R-03). */
export default function InstitutionalStudioDashboardLegacyRedirectPage() {
  permanentRedirect("/studio/organisation");
}
