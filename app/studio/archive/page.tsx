import { permanentRedirect } from "next/navigation";

/** Legacy `/personal-archive` → canonical archive (matrix R-05). */
export default function PersonalArchiveLegacyRedirectPage() {
  permanentRedirect("/studio/archive");
}
