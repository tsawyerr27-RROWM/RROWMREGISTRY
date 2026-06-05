import type { CreativePracticeChip } from "@/lib/practices";

function PracticeChip({
  label,
  source,
}: {
  label: string;
  source: CreativePracticeChip["source"];
}) {
  const base =
    "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium leading-tight";
  if (source === "registry") {
    return (
      <span
        className={`${base} border border-emerald-200/80 bg-emerald-50/90 text-emerald-950/85`}
        title="Inferred from verified Registry records"
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-neutral-200/80 bg-neutral-50/95 text-neutral-700`}
      title="Declared on profile"
    >
      {label}
    </span>
  );
}

type Props = {
  practices: CreativePracticeChip[];
  limit?: number;
};

export function FieldCreativePracticeChips({ practices, limit = 6 }: Props) {
  if (practices.length === 0) return null;

  const visible = practices.slice(0, limit);
  const overflow = practices.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((practice) => (
        <PracticeChip
          key={`${practice.slug}-${practice.source}`}
          label={practice.label}
          source={practice.source}
        />
      ))}
      {overflow > 0 ? (
        <span className="self-center text-[11px] text-neutral-400">+{overflow}</span>
      ) : null}
    </div>
  );
}
