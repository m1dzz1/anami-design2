import type { Locale } from "./config";
import sr from "./dictionaries/sr";
import en from "./dictionaries/en";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { sr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
