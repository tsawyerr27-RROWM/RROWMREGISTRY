import Link from "next/link";

import { fieldOpportunitiesHref } from "@/lib/field-nav";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function FieldProgrammeStubPage({ params }: Props) {
  await params;

  return (
    <div className="ds-page-environment min-h-[100dvh] pt-20 text-neutral-900">
      <div className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-20">
        <p className="text-sm text-neutral-500">The Field</p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-neutral-950 md:text-4xl">
          Programme details
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-600">
          This programme surface is currently being prepared.
        </p>
        <Link
          href={fieldOpportunitiesHref()}
          className="mt-8 inline-flex text-[14px] font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500"
        >
          Back to opportunities
        </Link>
      </div>
    </div>
  );
}
