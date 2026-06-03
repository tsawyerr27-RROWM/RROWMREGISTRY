import type { Region } from "@/lib/regions";

export type AppLang = Region["lang"];

export function resolveRequestLocale(
  acceptLanguage: string | null | undefined,
  langParam: string | null | undefined,
  bodyLang?: unknown
): AppLang {
  const fromBody =
    typeof bodyLang === "string" ? bodyLang.trim().toLowerCase() : "";
  if (fromBody === "de" || fromBody === "fr" || fromBody === "ja" || fromBody === "en") {
    return fromBody;
  }
  const raw = String(langParam || acceptLanguage || "")
    .toLowerCase()
    .trim();
  if (raw.startsWith("de")) return "de";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("ja")) return "ja";
  return "en";
}
