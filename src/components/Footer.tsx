import { ArrowUp } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { sectionIds, site } from "@/content/site";
import Logo from "./Logo";
import CurrentYear from "./CurrentYear";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const links = [
    { id: sectionIds.home, label: t.nav.home },
    { id: sectionIds.about, label: t.nav.about },
    { id: sectionIds.services, label: t.nav.services },
    { id: sectionIds.contact, label: t.nav.contact },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-petrol-deep text-white">
      <div className="container-x">
        <div className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[auto_1fr_auto] xl:gap-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href={`#${sectionIds.home}`} aria-label={t.a11y.homeLink} className="text-[2rem] text-white sm:text-[2.3rem]">
              <Logo variant="mono" />
            </a>
            <p className="text-[0.875rem] leading-[1.45] text-white/70">
              <span className="block">{t.footer.tagline[0]}</span>
              {" "}
              <span className="block">{t.footer.tagline[1]}</span>
            </p>
          </div>

          <nav aria-label={t.a11y.footerNav} className="md:order-last md:col-span-2 xl:order-none xl:col-span-1 xl:justify-self-center">
            <ul className="flex flex-wrap gap-x-8 gap-y-1">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="link-line inline-flex min-h-11 items-center text-[0.875rem] text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-7">
            <LanguageSwitcher lang={lang} label={t.a11y.language} />
            <a
              href={`#${sectionIds.home}`}
              aria-label={t.a11y.backToTop}
              className="group grid size-12 place-items-center rounded-full border border-white/35 transition-colors duration-500 hover:border-teal-light hover:bg-teal"
            >
              <ArrowUp aria-hidden="true" size={18} strokeWidth={1.5} className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-[0.8125rem] text-white/65">
          <p>
            © <CurrentYear buildYear={new Date().getFullYear()} /> {site.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
