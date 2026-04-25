"use client";

type Props = {
  registryId: string;
  verificationHash: string | null | undefined;
  timelineHash: string | null | undefined;
};

export function RegistryTechnicalDetails({
  registryId,
  verificationHash,
  timelineHash,
}: Props) {
  return (
    <details className="group liquid-glass-tile rounded-2xl p-8 md:p-9">
      <summary className="cursor-pointer list-none text-sm font-medium text-neutral-700 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          Technical details
          <span className="text-neutral-300 transition group-open:rotate-180">▼</span>
        </span>
      </summary>
      <dl className="mt-8 space-y-5 pt-2 text-sm">
        <div>
          <dt className="text-neutral-500">Registry ID</dt>
          <dd className="break-all font-mono text-xs text-neutral-900">{registryId}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Verification hash</dt>
          <dd className="break-all font-mono text-xs text-neutral-600">
            {verificationHash || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Timeline hash</dt>
          <dd className="break-all font-mono text-xs text-neutral-600">
            {timelineHash || "—"}
          </dd>
        </div>
      </dl>
    </details>
  );
}
