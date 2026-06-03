"use client";

export type AccountSectionId =
  | "account-profile"
  | "account-visibility"
  | "account-studio"
  | "account-privacy-data";

export type AccountNavItem = {
  id: AccountSectionId;
  label: string;
};

type Props = {
  items: AccountNavItem[];
  activeId: AccountSectionId | null;
  onNavigate: (id: AccountSectionId) => void;
  layout?: "mobile" | "desktop" | "both";
};

export function AccountSectionNav({
  items,
  activeId,
  onNavigate,
  layout = "both",
}: Props) {
  const showMobile = layout === "mobile" || layout === "both";
  const showDesktop = layout === "desktop" || layout === "both";

  return (
    <>
      {showMobile ? (
        <nav
          aria-label="Account sections"
          className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
        >
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-neutral-900/20 bg-neutral-950 text-white"
                    : "border-neutral-900/10 bg-white/60 text-neutral-700 hover:border-neutral-900/15"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      ) : null}

      {showDesktop ? (
        <nav
          aria-label="Account sections"
          className="hidden lg:block lg:sticky lg:top-28 lg:self-start"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
            On this page
          </p>
          <ul className="mt-4 space-y-1">
            {items.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-[14px] transition ${
                      active
                        ? "bg-neutral-950 font-medium text-white"
                        : "text-neutral-600 hover:bg-white/60 hover:text-neutral-900"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </>
  );
}

export function buildAccountNavItems(
  role: "artist" | "collector" | "gallery"
): AccountNavItem[] {
  const items: AccountNavItem[] = [
    { id: "account-profile", label: "Profile" },
    { id: "account-visibility", label: "Public visibility" },
  ];
  if (role === "artist") {
    items.push({ id: "account-studio", label: "Studio" });
  }
  items.push({ id: "account-privacy-data", label: "Privacy & data" });
  return items;
}
