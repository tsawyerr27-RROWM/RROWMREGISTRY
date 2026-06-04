import { permanentRedirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy `/account/restore` → canonical restore, preserving query (matrix R-12). */
export default async function AccountRestoreLegacyRedirectPage({
  searchParams,
}: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    }
  }
  const q = qs.toString();
  permanentRedirect(
    q ? `/studio/account/restore?${q}` : "/studio/account/restore"
  );
}
