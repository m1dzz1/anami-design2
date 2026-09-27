"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { sectionIds } from "@/content/site";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useRestoreLangPosition } from "./useRestoreLangPosition";

type NavKey = keyof Dictionary["nav"];
const navItems: { key: NavKey; id: string }[] = [
  { key: "home", id: sectionIds.home },
  { key: "about", id: sectionIds.about },
  { key: "services", id: sectionIds.services },
  { key: "contact", id: sectionIds.contact },
];

export default function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(sectionIds.home);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useRestoreLangPosition(lang);

  // Transparent → translucent bar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section indicator (the editorial section belongs to "Services")
  useEffect(() => {
    const ids = [...navItems.map((item) => item.id), sectionIds.editorial];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id === sectionIds.editorial ? sectionIds.services : entry.target.id;
          setActive(id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Mobile menu: lock scroll, close on Escape, keep focus inside
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const toggle = toggleRef.current;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusables = [toggle, ...menuRef.current.querySelectorAll<HTMLElement>("a, button")].filter(
        Boolean,
      ) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the overlay if the viewport grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const solid = scrolled || open;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ease-out-expo ${
        open
          ? "border-white/10 bg-ink"
          : solid
            ? "border-white/10 bg-ink/80 backdrop-blur-md"
            : "border-transparent bg-transparent"
      }`}
    >
      <div className="nav-enter container-x flex h-[var(--nav-h)] items-center justify-between gap-6">
        <a
          href={`#${sectionIds.home}`}
          aria-label={t.a11y.homeLink}
          className="relative z-10 text-[1.5rem] text-white sm:text-[1.9rem] lg:text-[2.15rem]"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </a>

        <nav aria-label={t.a11y.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-12 xl:gap-14">
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "true" : undefined}
                  className={`link-line inline-block py-2 text-[0.875rem] tracking-[0.02em] transition-colors duration-300 ${
                    active === item.id ? "font-semibold text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {t.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-7 lg:flex">
          <LanguageSwitcher lang={lang} label={t.a11y.language} />
          <span aria-hidden="true" className="h-5 w-px bg-white/60" />
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="relative z-10 -mr-2 grid size-12 place-items-center text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" size={26} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={26} strokeWidth={1.5} />}
        </button>
      </div>
    </header>

      {/* Mobile overlay — rendered outside <header> so backdrop-filter does not trap `fixed` */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 z-40 h-dvh overflow-y-auto bg-ink lg:hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_0%,rgb(54_120_91/0.35),transparent_60%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[var(--gutter)] w-px bg-white/10" />
        <div className="container-x relative flex h-full flex-col pb-10 pt-[calc(var(--nav-h)+2.5rem)]">
          <nav aria-label={t.a11y.mainNav}>
            <ol className="flex flex-col">
              {navItems.map((item, index) => (
                <li
                  key={item.key}
                  className="border-b border-white/10 motion-safe:animate-[menu-in_0.6s_var(--ease-out)_both]"
                  style={{ animationDelay: `${80 + index * 60}ms` }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? "true" : undefined}
                    className="group flex items-baseline gap-5 py-5"
                  >
                    <span className="display text-[1rem] text-mint">0{index + 1}</span>
                    <span
                      className={`display text-[clamp(2.6rem,12vw,3.6rem)] transition-colors ${
                        active === item.id ? "text-mint" : "text-white group-hover:text-mint"
                      }`}
                    >
                      {t.nav[item.key]}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-auto flex items-center justify-between gap-6 pt-10">
            <LanguageSwitcher lang={lang} label={t.a11y.language} onNavigate={() => setOpen(false)} />
            <a href="mailto:office@anami.rs" className="text-sm text-white/70 hover:text-white">
              office@anami.rs
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
