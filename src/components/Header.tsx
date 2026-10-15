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

// Hero photograph (anami-hero-lobby.webp) and the outline of the ceiling beam in it, in image pixels [y, x], top to bottom:
// the slanted top edge, the vertical front corner, then the underside running off to the right
const HERO_IMAGE = { width: 2400, height: 1800, frameTop: 0.242 };
const BEAM_OUTLINE: [number, number][] = [
  [260, 1128],
  [460, 947],
  [554, 948],
  [612, 1314],
];
// Points along the cut (evenly spaced over the bar height); open and closed shapes share the count so clip-path can animate
const EDGE_SAMPLES = 24;

function beamXAt(y: number) {
  const [first, second] = BEAM_OUTLINE;
  if (y <= first[0]) return first[1] + ((second[1] - first[1]) / (second[0] - first[0])) * (y - first[0]);
  for (let i = 1; i < BEAM_OUTLINE.length; i++) {
    const [y0, x0] = BEAM_OUTLINE[i - 1];
    const [y1, x1] = BEAM_OUTLINE[i];
    if (y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return BEAM_OUTLINE[BEAM_OUTLINE.length - 1][1];
}
// Width of the fade on the links side and the narrowest gap worth opening, in px
const FADE_WIDTH = 112;
const MIN_GAP = 64;

export default function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [split, setSplit] = useState(false);
  const [active, setActive] = useState<string>(sectionIds.home);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useRestoreLangPosition(lang);

  // Reference: at the top the bar is split so the hero ceiling shows through the middle; it closes once the ceiling has scrolled past.
  // The logo panel ends exactly on the beam's edge in the photograph, so the edge is mapped from image to viewport coordinates.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    // Same query as the <source> in Hero — portrait screens get the mobile crop, where the beam is elsewhere
    const portraitCrop = window.matchMedia("(max-aspect-ratio: 1/1)");
    let frame = 0;
    // The hero parallax (Motion.tsx, scrub 0.4) keeps moving the photograph after the last scroll event,
    // so keep re-measuring every frame until it has come to rest
    let settleUntil = 0;

    const update = () => {
      frame = 0;
      if (performance.now() < settleUntil) frame = requestAnimationFrame(update);
      setScrolled(window.scrollY > 24);
      const header = headerRef.current;
      const img = document.querySelector<HTMLImageElement>("[data-hero-bg] img");
      if (!header || !img || !desktop.matches || portraitCrop.matches || window.scrollY > window.innerHeight * 0.22) {
        setSplit(false);
        return;
      }

      // object-fit: cover geometry of the hero photograph (layout box, unaffected by the settle transform)
      const box = img.closest("[data-hero-bg]")!.getBoundingClientRect();
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      const scale = Math.max(w / HERO_IMAGE.width, h / HERO_IMAGE.height);
      // Mirrors `.hero-bg` in globals.css: 62% across, the 2K framing row at the top edge (or as low as the image allows)
      const originX = box.left + (w - HERO_IMAGE.width * scale) * 0.62;
      const originY = box.top - Math.min(HERO_IMAGE.frameTop * HERO_IMAGE.height * scale, HERO_IMAGE.height * scale - h);
      const edgeAt = (viewportY: number) => {
        const imageY = (viewportY - originY) / scale;
        return originX + beamXAt(imageY) * scale;
      };

      const barHeight = header.offsetHeight;
      const edge = Array.from({ length: EDGE_SAMPLES + 1 }, (_, i) => {
        const y = (barHeight * i) / EDGE_SAMPLES;
        return { y, x: edgeAt(y) };
      });

      // Edge 2 fades in just before the links; on screens where the beam lands next to them there is no room for a gap
      const linksLeft = header.querySelector("ul")!.getBoundingClientRect().left;
      const fadeEnd = linksLeft - 24;
      if (fadeEnd - FADE_WIDTH - Math.max(...edge.map((p) => p.x)) < MIN_GAP) {
        setSplit(false);
        return;
      }

      const polygon = (xOf: (p: { x: number }) => string) =>
        `polygon(0 0, ${edge.map((p) => `${xOf(p)} ${p.y.toFixed(1)}px`).join(", ")}, 0 100%)`;
      header.style.setProperty("--clip-open", polygon((p) => `${p.x.toFixed(1)}px`));
      header.style.setProperty("--clip-closed", polygon(() => "100%"));
      header.style.setProperty("--fade-end", `${fadeEnd.toFixed(1)}px`);
      setSplit(true);
    };
    const schedule = () => {
      settleUntil = performance.now() + 800;
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, []);

  // Active section indicator (the development sequence and the editorial section belong to "Services")
  useEffect(() => {
    const ids = [...navItems.map((item) => item.id), sectionIds.transformation];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id === sectionIds.transformation ? sectionIds.services : entry.target.id;
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

  return (
    <>
      <header ref={headerRef} data-scrolled={scrolled || open} data-split={split && !open} className="site-header on-light fixed inset-x-0 top-0 z-[var(--z-header)]">
        <div className="nav-row container-x flex items-center justify-between gap-6">
          <a
            href={`#${sectionIds.home}`}
            aria-label={t.a11y.homeLink}
            className="nav-logo relative"
            onClick={() => setOpen(false)}
          >
            <Logo variant="color" />
          </a>

          <div className="hidden items-center lg:flex">
            <nav aria-label={t.a11y.mainNav}>
              <ul className="flex items-center gap-7 xl:gap-9">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active === item.id ? "true" : undefined}
                      className="nav-link link-line inline-flex min-h-11 items-center text-[0.9375rem]"
                    >
                      {t.nav[item.key]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Reference: SR | EN right after the links, split by a hairline */}
            <LanguageSwitcher lang={lang} label={t.a11y.language} className="ml-10 xl:ml-12" />
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 grid size-12 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={26} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={26} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay — outside <header> so the header's backdrop-filter does not trap `fixed` */}
      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="fixed inset-0 z-[var(--z-menu)] h-dvh overflow-y-auto bg-petrol lg:hidden"
      >
        <div className="container-x relative flex min-h-full flex-col pb-10 pt-[calc(var(--nav-h)+2rem)]">
          <nav aria-label={t.a11y.mainNav}>
            <ol className="flex flex-col">
              {navItems.map((item, index) => (
                <li
                  key={item.key}
                  className="border-b border-white/15 motion-safe:animate-[menu-in_0.5s_var(--ease-out)_both]"
                  style={{ animationDelay: `${60 + index * 50}ms` }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? "true" : undefined}
                    className="group flex items-baseline gap-5 py-4"
                  >
                    <span className="display text-[1rem] font-medium text-teal-light">0{index + 1}</span>
                    <span
                      className={`display text-[clamp(2.4rem,11vw,3.2rem)] transition-colors ${
                        active === item.id ? "text-teal-light" : "text-white group-hover:text-teal-light"
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
            <a href="mailto:office@anami.rs" className="inline-flex min-h-11 items-center text-sm text-white/80 hover:text-white">
              office@anami.rs
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
