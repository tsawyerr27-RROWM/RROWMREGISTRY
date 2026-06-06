import { OpportunityExplorerContent } from "@/components/Field/OpportunityExplorerContent";
import { OpportunityExplorerHero } from "@/components/Field/OpportunityExplorerHero";
import { fetchFieldOpportunitiesList } from "@/lib/fetch-field-opportunities-list";
import { parseFieldOpportunityListParams } from "@/lib/field-opportunity-params";
import { redirectIfFieldOpportunityPageOutOfRange } from "@/lib/redirect-field-opportunity-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldOpportunitiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = parseFieldOpportunityListParams(sp);

  const supabase = await createSupabaseServerClient();
  const { rows, total, basePath } = await fetchFieldOpportunitiesList(supabase, params);

  redirectIfFieldOpportunityPageOutOfRange(basePath, params.page, total, {
    q: params.q,
    sector: params.sector,
    practice: params.practice,
    briefType: params.briefType,
    window: params.window,
    sort: params.sort,
  });

  const formKey = `${params.q}|${params.sector}|${params.practice}|${params.briefType}|${params.window}|${params.sort}`;

  return (
    <div className="mx-auto w-full max-w-[min(100%,88rem)] px-4 pb-20 sm:px-6 lg:px-8">
      <OpportunityExplorerHero
        searchQuery={params.q}
        total={total}
        sector={params.sector}
        practice={params.practice}
        briefType={params.briefType}
        window={params.window}
      />
      <OpportunityExplorerContent
        basePath={basePath}
        rows={rows}
        total={total}
        params={params}
        formKey={formKey}
      />
    </div>
  );
}
