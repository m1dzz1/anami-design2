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
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,var(--anami-ink)_0%,var(--anami-ink-deep)_100%)] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[calc(var(--gutter)*0.5)] w-px bg-white/[0.05]" />
      <div className="container-x">
        <div className="grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[auto_1fr_auto] xl:gap-12 xl:py-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href={`#${sectionIds.home}`} aria-label={t.a11y.homeLink} className="text-[2.1rem] sm:text-[2.4rem]">
              <Logo />
            </a>
            <p className="text-[0.875rem] leading-[1.4] text-white/75">
              <span className="block">{t.footer.tagline[0]}</span>
              <span className="block">{t.footer.tagline[1]}</span>
            </p>
          </div>

          <nav aria-label={t.a11y.footerNav} className="md:order-last md:col-span-2 xl:order-none xl:col-span-1 xl:justify-self-center">
            <ul className="flex flex-wrap gap-x-9 gap-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="link-line inline-block py-2 text-[0.875rem] text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-8">
            <LanguageSwitcher lang={lang} label={t.a11y.language} />
            <span aria-hidden="true" className="h-6 w-px bg-white/40" />
            <a
              href={`#${sectionIds.home}`}
              aria-label={t.a11y.backToTop}
              className="group grid size-16 place-items-center rounded-full border border-white/50 transition-colors duration-500 hover:border-mint hover:bg-mint hover:text-ink"
            >
              <ArrowUp aria-hidden="true" size={20} strokeWidth={1.5} className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 py-6 text-[0.8125rem] text-white/60 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
