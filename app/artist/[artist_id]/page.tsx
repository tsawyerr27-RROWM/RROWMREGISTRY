import { permanentRedirect } from "next/navigation";

import { fieldCreativeHref } from "@/lib/field-nav";

export default async function LegacyArtistRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ artist_id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { artist_id } = await params;
  const sp = await searchParams;
  const slug = artist_id.trim();
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
  const target = fieldCreativeHref(slug);
  permanentRedirect(query ? `${target}?${query}` : target);
}
