import { redirect } from "next/navigation";

/** Email links use /gallery/:slug; canonical public profile is under institutional-studio. */
export default async function GalleryPublicAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const clean = slug?.trim() ?? "";
  if (!clean) redirect("/");
  redirect(`/institutional-studio/${clean}`);
}
