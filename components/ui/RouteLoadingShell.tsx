type Props = {
  label?: string;
};

export function RouteLoadingShell({ label = "Loading…" }: Props) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center px-6 pt-20"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900"
        aria-hidden
      />
      <p className="mt-8 text-sm text-neutral-600">{label}</p>
    </div>
  );
}
