import type { Region } from "./regions";

export type Lang = "en" | "de" | "fr" | "ja";

export type MessageKey =
  | "common.perMonth"
  | "footer.navigate"
  | "footer.access"
  | "footer.legal"
  | "footer.social"
  | "footer.registry"
  | "footer.about"
  | "footer.contact"
  | "footer.signIn"
  | "footer.register"
  | "footer.account"
  | "footer.privacy"
  | "footer.terms"
  | "footer.disclaimer"
  | "footer.instagram"
  | "footer.twitter"
  | "footer.tagline"
  | "footer.copyright"
  | "footer.regionLabel";

const EN: Record<MessageKey, string> = {
  "common.perMonth": "per month",
  "footer.navigate": "Navigate",
  "footer.access": "Access",
  "footer.legal": "Legal",
  "footer.social": "Social",
  "footer.registry": "Registry",
  "footer.about": "About",
  "footer.contact": "Contact",
  "footer.signIn": "Sign in",
  "footer.register": "Register",
  "footer.account": "Account",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.disclaimer": "Disclaimer",
  "footer.instagram": "Instagram",
  "footer.twitter": "X (Twitter)",
  "footer.tagline": "Registry · documentation · institutional record",
  "footer.copyright": "All rights reserved.",
  "footer.regionLabel": "Region & language",
};

const DE: Record<MessageKey, string> = {
  ...EN,
  "common.perMonth": "pro Monat",
  "footer.navigate": "Navigation",
  "footer.access": "Zugang",
  "footer.legal": "Rechtliches",
  "footer.social": "Social Media",
  "footer.registry": "Register",
  "footer.about": "Über uns",
  "footer.contact": "Kontakt",
  "footer.signIn": "Anmelden",
  "footer.register": "Registrieren",
  "footer.account": "Konto",
  "footer.privacy": "Datenschutz",
  "footer.terms": "AGB",
  "footer.disclaimer": "Haftungsausschluss",
  "footer.tagline": "Register · Dokumentation · institutioneller Eintrag",
  "footer.copyright": "Alle Rechte vorbehalten.",
  "footer.regionLabel": "Region & Sprache",
};

const FR: Record<MessageKey, string> = {
  ...EN,
  "footer.navigate": "Navigation",
  "footer.access": "Accès",
  "footer.legal": "Mentions légales",
  "footer.social": "Réseaux",
  "footer.registry": "Registre",
  "footer.about": "À propos",
  "footer.contact": "Contact",
  "footer.signIn": "Connexion",
  "footer.register": "Inscription",
  "footer.account": "Compte",
  "footer.privacy": "Confidentialité",
  "footer.terms": "Conditions",
  "footer.disclaimer": "Avertissement",
  "footer.tagline": "Registre · documentation · cadre institutionnel",
  "footer.copyright": "Tous droits réservés.",
  "footer.regionLabel": "Région et langue",
};

const JA: Record<MessageKey, string> = {
  ...EN,
  "common.perMonth": "月額",
  "footer.navigate": "ナビゲーション",
  "footer.access": "アクセス",
  "footer.legal": "法的情報",
  "footer.social": "ソーシャル",
  "footer.registry": "レジストリ",
  "footer.about": "概要",
  "footer.contact": "お問い合わせ",
  "footer.signIn": "サインイン",
  "footer.register": "登録",
  "footer.account": "アカウント",
  "footer.privacy": "プライバシー",
  "footer.terms": "利用規約",
  "footer.disclaimer": "免責事項",
  "footer.tagline": "レジストリ · 文書 · 制度的記録",
  "footer.copyright": "無断転載を禁じます。",
  "footer.regionLabel": "地域と言語",
};

const BY_LANG: Record<Lang, Record<MessageKey, string>> = {
  en: EN,
  de: DE,
  fr: FR,
  ja: JA,
};

export function translate(key: MessageKey, lang: Region["lang"]): string {
  const table = BY_LANG[lang] ?? EN;
  return table[key] ?? EN[key];
}
