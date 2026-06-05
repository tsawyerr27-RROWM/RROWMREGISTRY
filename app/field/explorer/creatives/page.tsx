import { CreativeExplorerContent } from "@/components/Field/CreativeExplorerContent";
import { CreativeExplorerHero } from "@/components/Field/CreativeExplorerHero";
import { fetchCreativeExplorerList } from "@/lib/fetch-creative-explorer-list";
import { parseCreativeExplorerParams } from "@/lib/field-creative-explorer-params";
import { redirectIfCreativeExplorerPageOutOfRange } from "@/lib/redirect-creative-explorer-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldExplorerCreativesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { q, sort, page, practice, verified } = parseCreativeExplorerParams(sp);

  const supabase = await createSupabaseServerClient();
  const { rows, total, basePath } = await fetchCreativeExplorerList(supabase, {
    q,
    sort,
    page,
    practice,
    verified,
  });

  redirectIfCreativeExplorerPageOutOfRange(basePath, page, total, {
    q,
    sort,
    practice,
    verified,
  });

  const formKey = `${q}|${sort}|${practice}|${verified}`;

  return (
    <div className="mx-auto w-full max-w-[min(100%,88rem)] px-4 pb-20 sm:px-6 lg:px-8">
      <CreativeExplorerHero
        searchQuery={q}
        total={total}
        practice={practice}
        verified={verified}
      />
      <CreativeExplorerContent
        basePath={basePath}
        rows={rows}
        total={total}
        q={q}
        sort={sort}
        page={page}
        practice={practice}
        verified={verified}
        formKey={formKey}
      />
    </div>
  );
}
