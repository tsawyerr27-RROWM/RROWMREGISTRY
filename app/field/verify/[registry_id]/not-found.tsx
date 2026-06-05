import Link from "next/link";

import { fieldVerifyHref } from "@/lib/field-nav";

export default function FieldVerifyRecordNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-6 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
        Field verification
      </p>
      <h1 className="mt-4 font-serif text-3xl font-normal tracking-tight text-neutral-950">
        Registry record not found
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        No Registry record matches that Registry ID. Check the ID and try again, or
        browse records in the Registry.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium">
        <Link
          href={fieldVerifyHref()}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-white transition hover:bg-neutral-800"
        >
          Back to verify hub
        </Link>
        <Link
          href="/registry"
          className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
        >
          Browse Registry
        </Link>
      </div>
    </div>
  );
}
