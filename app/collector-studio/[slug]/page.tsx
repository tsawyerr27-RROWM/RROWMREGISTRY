import { permanentRedirect } from "next/navigation";

import { fieldCollectorHref } from "@/lib/field-nav";

/** Legacy public collector profile → canonical Field Collector Presence. */
export default async function LegacyCollectorStudioProfileRedirect({
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
  const target = fieldCollectorHref(clean);
  permanentRedirect(query ? `${target}?${query}` : target);
}
