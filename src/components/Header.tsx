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
// Outer edge of the round arch in the same photograph: a circle (centre x, centre y, radius in image pixels),
// fitted to the edge where the arch meets the pale wall
const ARCH = { cx: 1311.6, cy: 846.4, r: 550.9 };
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
function archXAt(y: number) {
  const dy = Math.min(Math.abs(y - ARCH.cy), ARCH.r);
  return ARCH.cx + Math.sqrt(ARCH.r * ARCH.r - dy * dy);
}
// Narrowest gap between the two cuts worth opening, and the room kept between the arch and the first link, in px
const MIN_GAP = 64;
const LINKS_CLEARANCE = 20;
// Room kept to the right of the language switcher, and the tightest gap the links may close up to, in px
const LINKS_EDGE = 20;
const MIN_LINK_GAP = 14;
// The split bar is only shown at the very top: the first bit of scrolling brings back the plain bar
const SPLIT_MAX_SCROLL = 8;

export default function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [split, setSplit] = useState(false);
  const [active, setActive] = useState<string>(sectionIds.home);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useRestoreLangPosition(lang);

  // Reference: at the top the bar is split so the hero ceiling shows through the middle; it closes as soon as the page scrolls.
  // The logo panel ends exactly on the beam's edge in the photograph and the links panel starts on the arch's edge,
  // so both edges are mapped from image to viewport coordinates.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    // Same query as the <source> in Hero — portrait screens get the mobile crop, where the beam is elsewhere
    const portraitCrop = window.matchMedia("(max-aspect-ratio: 1/1)");
    let frame = 0;
    // The hero parallax (Motion.tsx, scrub 0.4) keeps moving the photograph after the last scroll event and the
    // CSS settle animation scales it for 1.8s after load, so keep re-measuring every frame until it has come to rest
    let settleUntil = 0;
    let wasSplit = false;
    let animateTimer = 0;


    // Last values written, so unchanged clip paths don't restyle the (backdrop-filtered) bar every frame
    const written: Record<string, string> = {};
    const write = (header: HTMLElement, name: string, value: string) => {
      if (written[name] === value) return;
      written[name] = value;
      header.style.setProperty(name, value);
    };

    const close = (header: HTMLElement | null) => {
      setSplit(false);
      wasSplit = false;
      if (!header) return;
      write(header, "--links-shift", "0px");
      write(header, "--links-squeeze", "0px");
    };

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      const header = headerRef.current;
      const img = document.querySelector<HTMLImageElement>("[data-hero-bg] img");
      if (!header || !img || !desktop.matches || portraitCrop.matches || window.scrollY > SPLIT_MAX_SCROLL) {
        close(header);
        return;
      }
      // Only near the top is there anything to follow
      if (performance.now() < settleUntil) frame = requestAnimationFrame(update);

      // object-fit: cover geometry of the hero photograph as painted — the rect includes the settle scale and the
      // parallax shift, which are uniform transforms, so the cover maths holds on the transformed box
      const box = img.getBoundingClientRect();
      const w = box.width;
      const h = box.height;
      const scale = Math.max(w / HERO_IMAGE.width, h / HERO_IMAGE.height);
      // Mirrors `.hero-bg` in globals.css: 62% across, the 2K framing row at the top edge (or as low as the image allows)
      const originX = box.left + (w - HERO_IMAGE.width * scale) * 0.62;
      const originY = box.top - Math.min(HERO_IMAGE.frameTop * HERO_IMAGE.height * scale, HERO_IMAGE.height * scale - h);
      const barHeight = header.offsetHeight;
      const trace = (xAt: (imageY: number) => number) =>
        Array.from({ length: EDGE_SAMPLES + 1 }, (_, i) => {
          const y = (barHeight * i) / EDGE_SAMPLES;
          return { y, x: originX + xAt((y - originY) / scale) * scale };
        });
      const beam = trace(beamXAt);
      const arch = trace(archXAt);

      // On screens where the beam and the arch land (almost) on top of each other there is no room for a gap
      if (Math.min(...arch.map((p) => p.x)) - Math.max(...beam.map((p) => p.x)) < MIN_GAP) {
        close(header);
        return;
      }

      // The links have to sit on the links panel, so they slide right until they clear the arch. On laptop widths
      // there isn't quite enough room beside it, so the gaps between the links tighten as well; if even that is not
      // enough the bar stays closed instead
      const links = header.querySelector<HTMLElement>("[data-nav-links]")!;
      const list = links.querySelector("ul")!;
      const items = [...list.children] as HTMLElement[];
      const switcher = links.lastElementChild as HTMLElement;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const switcherGap = parseFloat(getComputedStyle(switcher).marginLeft) || 0;
      const gaps = items.length; // between the links, plus the one before the language switcher
      const natural =
        items.reduce((sum, item) => sum + item.offsetWidth, 0) + gap * (items.length - 1) + switcherGap + switcher.offsetWidth;
      // Untransformed right edge (the group is right-aligned, so squeezing it never moves this edge)
      const linksBox = list.getBoundingClientRect();
      const baseRight = links.getBoundingClientRect().right - new DOMMatrix(getComputedStyle(links).transform).m41;
      // The arch leans right going down, so the bottom of the link boxes is where it comes closest
      const start = originX + archXAt((linksBox.bottom - originY) / scale) * scale + LINKS_CLEARANCE;
      const limit = document.documentElement.clientWidth - LINKS_EDGE;
      const squeeze = Math.max(0, Math.ceil((natural - (limit - start)) / gaps));
      if (squeeze > Math.min(gap, switcherGap) - MIN_LINK_GAP) {
        close(header);
        return;
      }
      const shift = squeeze
        ? Math.floor(limit - baseRight)
        : Math.max(0, Math.ceil(start - (baseRight - natural)));
      write(header, "--links-shift", `${shift}px`);
      write(header, "--links-squeeze", `${squeeze}px`);

      const points = (edge: { x: number; y: number }[], xOf: (p: { x: number }) => string) =>
        edge.map((p) => `${xOf(p)} ${p.y.toFixed(1)}px`).join(", ");
      write(header, "--clip-open", `polygon(0 0, ${points(beam, (p) => `${p.x.toFixed(1)}px`)}, 0 100%)`);
      write(header, "--clip-closed", `polygon(0 0, ${points(beam, () => "100%")}, 0 100%)`);
      write(header, "--clip-links", `polygon(100% 0, ${points(arch, (p) => `${p.x.toFixed(1)}px`)}, 100% 100%)`);
      // The clip only eases while the bar opens; afterwards it follows the photograph frame by frame,
      // otherwise the transition trails behind the moving image and leaves a sliver between edge and beam
      if (!wasSplit) {
        wasSplit = true;
        header.dataset.splitAnimating = "true";
        window.clearTimeout(animateTimer);
        animateTimer = window.setTimeout(() => delete header.dataset.splitAnimating, 750);
      }
      setSplit(true);
    };
    const schedule = (duration = 800) => {
      settleUntil = Math.max(settleUntil, performance.now() + duration);
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onEvent = () => schedule();

    schedule(2000);
    window.addEventListener("scroll", onEvent, { passive: true });
    window.addEventListener("resize", onEvent);
    window.addEventListener("load", onEvent);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(animateTimer);
      window.removeEventListener("scroll", onEvent);
      window.removeEventListener("resize", onEvent);
      window.removeEventListener("load", onEvent);
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

          <div data-nav-links className="nav-links hidden items-center lg:flex">
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
