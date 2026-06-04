import { permanentRedirect } from "next/navigation";

/** Legacy `/account` → canonical account (matrix R-04). */
export default function AccountLegacyRedirectPage() {
  permanentRedirect("/studio/account");
}
