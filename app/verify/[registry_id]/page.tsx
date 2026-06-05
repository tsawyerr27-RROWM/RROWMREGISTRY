import { permanentRedirect } from "next/navigation";

import { fieldVerifyRecordHref } from "@/lib/field-nav";

export default async function LegacyVerifyRedirect({
  params,
}: {
  params: Promise<{ registry_id: string }>;
}) {
  const { registry_id } = await params;
  permanentRedirect(fieldVerifyRecordHref(registry_id.trim()));
}
