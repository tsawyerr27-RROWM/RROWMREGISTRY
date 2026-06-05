import { permanentRedirect } from "next/navigation";

import { fieldRecordHref } from "@/lib/field-nav";

export default async function LegacyRegistryRecordRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ registry_id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { registry_id } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      qs.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        qs.append(key, entry);
      }
    }
  }

  const query = qs.toString();
  const target = fieldRecordHref(registry_id.trim());
  permanentRedirect(query ? `${target}?${query}` : target);
}
