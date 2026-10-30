import { ArrowUp } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { sectionIds, site } from "@/content/site";
import Logo from "./Logo";
import CurrentYear from "./CurrentYear";
import LanguageSwitcher from "./LanguageSwitcher";
import { blog, blogPath } from "@/content/blog";

/** `onHome` is false on the blog pages: section links then lead back to the home page, and the language switcher is
 *  left out because the blog is Serbian only. */
export default function Footer({ lang, t, onHome = true }: { lang: Locale; t: Dictionary; onHome?: boolean }) {
  const section = (id: string) => (onHome ? `#${id}` : `/${lang}#${id}`);
  const links = [
    { href: onHome ? `#${sectionIds.home}` : `/${lang}`, label: t.nav.home },
    { href: section(sectionIds.about), label: t.nav.about },
    { href: section(sectionIds.services), label: t.nav.services },
    { href: section(sectionIds.contact), label: t.nav.contact },
    // The blog is in the footer only, never in the main navigation
    ...(lang === "sr" ? [{ href: blogPath(), label: blog.label }] : []),
  ];
  const top = onHome ? `#${sectionIds.home}` : "#top";

  return (
    <footer className="relative border-t border-white/10 bg-petrol-deep text-white">
      <div className="container-x">
        <div className="grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center xl:grid-cols-[auto_1fr_auto] xl:gap-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a href={onHome ? `#${sectionIds.home}` : `/${lang}`} aria-label={t.a11y.homeLink} className="text-[2rem] text-white sm:text-[2.3rem]">
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
                <li key={link.href}>
                  <a href={link.href} className="link-line inline-flex min-h-11 items-center text-[0.875rem] text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-7">
            {onHome && <LanguageSwitcher lang={lang} label={t.a11y.language} />}
            <a
              href={top}
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
