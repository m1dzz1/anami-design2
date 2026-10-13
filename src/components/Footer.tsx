import { ArrowUp } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { sectionIds, site } from "@/content/site";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const links = [
    { id: sectionIds.home, label: t.nav.home },
    { id: sectionIds.about, label: t.nav.about },
    { id: sectionIds.services, label: t.nav.services },
    { id: sectionIds.contact, label: t.nav.contact },
  ];

  return (
    <footer className="on-light relative overflow-hidden bg-white text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[calc(var(--gutter)*0.5)] w-px bg-ink/[0.06]" />
      <div className="container-x">
        <div className="grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[auto_1fr_auto] xl:gap-12 xl:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href={`#${sectionIds.home}`} aria-label={t.a11y.homeLink} className="text-[2.1rem] sm:text-[2.4rem]">
              <Logo variant="color" />
            </a>
            <p className="text-[0.875rem] leading-[1.4] text-muted">
              <span className="block">{t.footer.tagline[0]}</span>
              <span className="block">{t.footer.tagline[1]}</span>
            </p>
          </div>

          <nav aria-label={t.a11y.footerNav} className="md:order-last md:col-span-2 xl:order-none xl:col-span-1 xl:justify-self-center">
            <ul className="flex flex-wrap gap-x-9 gap-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="link-line inline-block py-2 text-[0.875rem] text-ink/75 transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-8">
            <LanguageSwitcher lang={lang} label={t.a11y.language} />
            <span aria-hidden="true" className="h-6 w-px bg-ink/25" />
            <a
              href={`#${sectionIds.home}`}
              aria-label={t.a11y.backToTop}
              className="group grid size-16 place-items-center rounded-full border border-ink/30 transition-colors duration-500 hover:border-green hover:bg-green hover:text-white"
            >
              <ArrowUp aria-hidden="true" size={20} strokeWidth={1.5} className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-ink/10 py-6 text-[0.8125rem] text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
