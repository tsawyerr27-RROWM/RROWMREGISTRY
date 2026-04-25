"use client";

type CertificateArtistActionsProps = {
  registryId: string;
};

/**
 * Print / save-as-PDF for the owning artist. Uses the browser print dialog;
 * choosing “Save as PDF” produces a downloadable file without extra dependencies.
 */
export function CertificateArtistActions({
  registryId,
}: CertificateArtistActionsProps) {
  const openPrintDialog = () => {
    window.print();
  };

  return (
    <div
      className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200/90 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 print:hidden"
      role="region"
      aria-label={`Print or save certificate ${registryId}`}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-neutral-900">Your certificate</p>
        <p className="text-xs leading-relaxed text-neutral-600">
          Print a copy or save as PDF from the print dialog (
          <span className="whitespace-nowrap">“Save as PDF”</span> as the
          destination).
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPrintDialog}
          className="rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          Print
        </button>
        <button
          type="button"
          onClick={openPrintDialog}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Save as PDF
        </button>
      </div>
    </div>
  );
}
