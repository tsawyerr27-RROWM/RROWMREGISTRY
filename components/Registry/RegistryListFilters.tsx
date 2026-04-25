import type { ArtworkStatusFilter, RegistrySort } from "@/lib/registry-list-params";

type Props = {
  /** Form action, e.g. `/registry` */
  action: string;
  q: string;
  sort: RegistrySort;
  /** Re-mount form when URL changes so defaultValue updates */
  formKey: string;
  /** Prefix for input ids when multiple filter bars exist on one site */
  idPrefix?: string;
  /** Artist page: filter by verification */
  showStatusFilter?: boolean;
  status?: ArtworkStatusFilter;
  /** `glass` = default frosted tile. `explorer` = public registry index shell. */
  variant?: "glass" | "explorer";
};

export function RegistryListFilters({
  action,
  q,
  sort,
  formKey,
  idPrefix = "registry",
  showStatusFilter = false,
  status = "all",
  variant = "glass",
}: Props) {
  const qId = `${idPrefix}-q`;
  const sortId = `${idPrefix}-sort`;
  const statusId = `${idPrefix}-status`;

  const shell =
    variant === "explorer"
      ? "rounded-[1.25rem] border border-neutral-900/[0.07] bg-white/55 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-[8px]"
      : "liquid-glass-tile";

  const inputClass =
    variant === "explorer"
      ? "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
      : "liquid-glass-inset mt-2 w-full border-0 px-5 py-3.5 text-neutral-900 placeholder:text-neutral-400 shadow-none focus:outline-none focus:ring-1 focus:ring-neutral-900/15";

  const selectClass =
    variant === "explorer"
      ? "mt-2 w-full rounded-xl border border-neutral-900/[0.08] bg-white/85 px-4 py-3.5 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/12"
      : "liquid-glass-inset mt-2 w-full border-0 px-4 py-3.5 text-sm text-neutral-900 shadow-none focus:outline-none focus:ring-1 focus:ring-neutral-900/15";

  return (
    <form
      key={formKey}
      method="get"
      action={action}
      className={`${shell} flex flex-col gap-5 p-6 md:flex-row md:flex-wrap md:items-end md:gap-5 md:p-7`}
    >
      <div className="min-w-0 flex-1">
        <label
          htmlFor={qId}
          className="text-sm font-medium text-neutral-700"
        >
          Search
        </label>
        <input
          id={qId}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Title or registry ID"
          autoComplete="off"
          className={inputClass}
        />
      </div>
      {showStatusFilter ? (
        <div className="w-full md:w-48">
          <label
            htmlFor={statusId}
            className="text-sm font-medium text-neutral-700"
          >
            Status
          </label>
          <select
            id={statusId}
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            <option value="all">All works</option>
            <option value="verified">Verified only</option>
            <option value="pending">Pending only</option>
          </select>
        </div>
      ) : null}
      <div className="w-full md:w-56">
        <label
          htmlFor={sortId}
          className="text-sm font-medium text-neutral-700"
        >
          Sort
        </label>
        <select
          id={sortId}
          name="sort"
          defaultValue={sort}
          className={selectClass}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
        </select>
      </div>
      <input type="hidden" name="page" value="1" />
      <div className="flex gap-3 md:pb-0.5">
        <button
          type="submit"
          className="rounded-xl bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
