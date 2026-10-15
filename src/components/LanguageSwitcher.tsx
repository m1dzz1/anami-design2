"use client";

import { Fragment, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { sectionIds } from "@/content/site";

export const LANG_SWITCH_KEY = "anami:lang-switch";

/** Where the reader is: the section under the reading line and how far into it (0–1). */
export type LangSwitchState = { id: string; ratio: number; at: number };

function readPosition(): LangSwitchState {
  const probe = Math.min(window.innerHeight * 0.3, 280);
  let id: string = sectionIds.home;
  for (const candidate of Object.values(sectionIds)) {
    const el = document.getElementById(candidate);
    if (el && el.getBoundingClientRect().top <= probe) id = candidate;
  }
  const rect = document.getElementById(id)!.getBoundingClientRect();
  return { id, ratio: rect.height ? -rect.top / rect.height : 0, at: Date.now() };
}

export default function LanguageSwitcher({
  lang,
  label,
  className = "",
  onNavigate,
}: {
  lang: Locale;
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, target: Locale) => {
    if (target === lang) {
      event.preventDefault();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();

    const position = readPosition();
    try {
      sessionStorage.setItem(LANG_SWITCH_KEY, JSON.stringify(position));
    } catch {}
    onNavigate?.();
    const hash = position.id === sectionIds.home ? "" : `#${position.id}`;
    // scroll: false — useRestoreLangPosition puts the reader back at the exact spot once the new language renders
    router.push(`/${target}${hash}`, { scroll: false });
  };

  return (
    <nav aria-label={label} className={`lang-switch flex items-center ${className}`}>
      {locales.map((locale, index) => (
        <Fragment key={locale}>
          {index > 0 && <span aria-hidden="true" className="mx-3 h-4 w-px bg-current opacity-35" />}
          <a
            href={`/${locale}`}
            hrefLang={localeMeta[locale].htmlLang}
            lang={localeMeta[locale].htmlLang}
            aria-current={locale === lang ? "true" : undefined}
            onClick={(event) => handleClick(event, locale)}
            className="lang-link inline-flex min-h-11 items-center justify-center text-[0.875rem] uppercase"
          >
            {locale}
            <span className="sr-only"> – {localeMeta[locale].label}</span>
          </a>
        </Fragment>
      ))}
    </nav>
  );
}
