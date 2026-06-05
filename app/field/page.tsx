import { permanentRedirect } from "next/navigation";

import { FIELD_EXPLORER } from "@/lib/field-nav/paths";

export default function FieldHomePage() {
  permanentRedirect(FIELD_EXPLORER);
}
