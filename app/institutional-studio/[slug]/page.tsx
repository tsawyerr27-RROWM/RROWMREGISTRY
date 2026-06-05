import { permanentRedirect } from "next/navigation";

import { fieldOrganisationHref } from "@/lib/field-nav";

/** Legacy public organisation profile → canonical Field Organisation Presence. */
export default async function LegacyInstitutionalStudioRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const clean = slug.trim();
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
  const target = fieldOrganisationHref(clean);
  permanentRedirect(query ? `${target}?${query}` : target);
}
