import { permanentRedirect } from "next/navigation";

import { fieldOrganisationHref } from "@/lib/field-nav";

/** Email links use /gallery/:slug; canonical public profile is under The Field. */
export default async function GalleryPublicAliasPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const clean = slug?.trim() ?? "";
  if (!clean) permanentRedirect("/field/explorer/organisations");

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
