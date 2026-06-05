import { permanentRedirect } from "next/navigation";

import { fieldExplorerRecordsHref } from "@/lib/field-nav";
import { recordExplorerQueryFromLegacyRegistry } from "@/lib/field-record-explorer-params";

/** Legacy Registry list → canonical Field Record Explorer. Detail routes unchanged. */
export default async function LegacyRegistryExplorerRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = recordExplorerQueryFromLegacyRegistry(sp);
  const target = fieldExplorerRecordsHref();
  permanentRedirect(qs ? `${target}?${qs}` : target);
}
