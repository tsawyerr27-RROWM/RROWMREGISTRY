import { FieldV2Container } from "@/components/Field/FieldV2Container";
import { RecordExplorerContent } from "@/components/Field/RecordExplorerContent";
import { RecordExplorerHero } from "@/components/Field/RecordExplorerHero";
import { fetchRecordExplorerList } from "@/lib/fetch-record-explorer-list";
import { parseRecordExplorerParams } from "@/lib/field-record-explorer-params";
import { redirectIfRecordExplorerPageOutOfRange } from "@/lib/redirect-record-explorer-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FieldExplorerRecordsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { q, sort, page, creative, organisation, practice, trust, certificate } =
    parseRecordExplorerParams(sp);

  const supabase = await createSupabaseServerClient();
  const { rows, total, basePath } = await fetchRecordExplorerList(supabase, {
    q,
    sort,
    page,
    creative,
    organisation,
    practice,
    trust,
    certificate,
  });

  redirectIfRecordExplorerPageOutOfRange(basePath, page, total, {
    q,
    sort,
    creative,
    organisation,
    practice,
    trust,
    certificate,
  });

  const formKey = `${q}|${sort}|${creative}|${organisation}|${practice}|${trust}|${certificate}`;

  return (
    <FieldV2Container className="pt-4 md:pt-6">
      <RecordExplorerHero
        searchQuery={q}
        total={total}
        creative={creative}
        organisation={organisation}
        practice={practice}
        trust={trust}
        certificate={certificate}
      />
      <RecordExplorerContent
        basePath={basePath}
        rows={rows}
        total={total}
        q={q}
        sort={sort}
        page={page}
        creative={creative}
        organisation={organisation}
        practice={practice}
        trust={trust}
        certificate={certificate}
        formKey={formKey}
      />
    </FieldV2Container>
  );
}
