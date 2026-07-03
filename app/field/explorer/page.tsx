import { redirect } from "next/navigation";

import { FIELD_ROOT } from "@/lib/field-nav";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldExplorerHubPage({ searchParams }: Props) {
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
  redirect(query ? `${FIELD_ROOT}?${query}` : FIELD_ROOT);
}
