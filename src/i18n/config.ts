export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** BCP 47 tags used for <html lang>, hreflang and Open Graph. */
export const localeMeta: Record<Locale, { htmlLang: string; ogLocale: string; label: string }> = {
  sr: { htmlLang: "sr-Latn", ogLocale: "sr_RS", label: "Srpski" },
  en: { htmlLang: "en", ogLocale: "en_US", label: "English" },
};
