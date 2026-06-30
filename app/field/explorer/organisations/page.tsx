import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { OrganisationExplorerContent } from "@/components/Field/OrganisationExplorerContent";
import { OrganisationExplorerHero } from "@/components/Field/OrganisationExplorerHero";
import { fetchOrganisationExplorerList } from "@/lib/fetch-organisation-explorer-list";
import { parseOrganisationExplorerParams } from "@/lib/field-organisation-explorer-params";
import { redirectIfOrganisationExplorerPageOutOfRange } from "@/lib/redirect-organisation-explorer-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldExplorerOrganisationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { q, sort, page, location, verified, represented } =
    parseOrganisationExplorerParams(sp);

  const supabase = await createSupabaseServerClient();
  const { rows, total, basePath } = await fetchOrganisationExplorerList(supabase, {
    q,
    sort,
    page,
    location,
    verified,
    represented,
  });

  redirectIfOrganisationExplorerPageOutOfRange(basePath, page, total, {
    q,
    sort,
    location,
    verified,
    represented,
  });

  const formKey = `${q}|${sort}|${location}|${verified}|${represented}`;

  return (
    <FieldV2Container className="pt-4 md:pt-6">
      <OrganisationExplorerHero
        searchQuery={q}
        total={total}
        location={location}
        verified={verified}
        represented={represented}
      />
      <OrganisationExplorerContent
        basePath={basePath}
        rows={rows}
        total={total}
        q={q}
        sort={sort}
        page={page}
        location={location}
        verified={verified}
        represented={represented}
        formKey={formKey}
      />
    </FieldV2Container>
  );
}
