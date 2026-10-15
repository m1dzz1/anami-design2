"use client";

import { useEffect } from "react";

/**
 * Scroll-driven motion layer.
 * - GSAP is loaded lazily after hydration; nothing runs for users who prefer reduced motion.
 * - Elements already on screen when the page loads are never hidden (no flash, no layout shift).
 * - Parallax and scrubbed effects are desktop-only to keep mid-range phones smooth.
 * The hero entrance is pure CSS (see globals.css) so it never waits on JavaScript.
 */
export default function Motion({ lang }: { lang: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isMobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };
          const rise = isDesktop ? 32 : 20;
          const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9;
          const once = (trigger: Element, start = "top 86%") => ({ trigger, start, once: true });
          // Elements already on screen at load are never hidden (no flash, no layout shift)

          // Masked line reveal: the clip box travels with the text, so each line appears to rise out of a slot.
          // Negative insets at the end leave room for descenders; clearProps drops the clip once it's done.
          const lineFrom = { yPercent: 70, clipPath: "inset(0% -5% 100% -5%)" };
          const lineTo = { yPercent: 0, clipPath: "inset(-20% -5% -20% -5%)", duration: 1.1, ease: "expo.out", stagger: 0.12, clearProps: "clipPath,transform" };

          // 1. Copy blocks rise in as one block; inside it the heading lines, accent rule and listed items follow
          gsap.utils
            .toArray<HTMLElement>("[data-reveal-text]")
            .filter(below)
            .forEach((el) => {
              const tl = gsap.timeline({ scrollTrigger: once(el) });
              tl.from(el, { y: rise, autoAlpha: 0, duration: 1, ease: "expo.out" });
              const heading = el.querySelector<HTMLElement>("h2.display");
              if (heading) {
                const lines = heading.querySelectorAll(":scope > .block");
                tl.fromTo(lines.length ? lines : heading, lineFrom, lineTo, 0.05);
              }
              const rules = el.querySelectorAll(".rule");
              if (rules.length) tl.from(rules, { scaleX: 0, transformOrigin: "0% 50%", duration: 0.9, ease: "expo.out" }, 0.35);
              const items = el.querySelectorAll("[data-stagger] > *");
              if (items.length) tl.from(items, { y: 14, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 0.4);
            });

          // Standalone accent lines draw in from the left
          gsap.utils.toArray<HTMLElement>("[data-draw]").filter(below).forEach((line) => {
            gsap.from(line, { scaleX: 0, transformOrigin: "0% 50%", duration: 1.2, ease: "expo.out", scrollTrigger: once(line) });
          });

          // 2. Groups (service cards) — short stagger; each photo settles from a slight zoom as its card lands
          gsap.utils.toArray<HTMLElement>("[data-reveal-group]").filter(below).forEach((group) => {
            const items = group.querySelectorAll("[data-reveal-item]");
            if (!items.length) return;
            const tl = gsap.timeline({ scrollTrigger: once(group, "top 84%") });
            tl.from(items, { y: rise * 1.25, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 });
            const media = group.querySelectorAll("[data-card-media] img");
            // The hover zoom is a CSS transition on the same transform, so it's paused until the entrance ends
            if (media.length) {
              tl.fromTo(
                media,
                { scale: 1.18, transition: "none" },
                { scale: 1, duration: 1.6, ease: "expo.out", stagger: 0.12, clearProps: "transform,transition" },
                0,
              );
            }
          });

          // 3. "O nama" collage — the two photographs are unmasked bottom-up one after the other, settling from a
          // slight zoom; the small one drifts on desktop
          gsap.utils.toArray<HTMLElement>('[data-reveal="composition"]').forEach((composition) => {
            const photos = gsap.utils.toArray<HTMLElement>("[data-reveal-img]", composition);
            if (below(composition)) {
              const tl = gsap.timeline({ scrollTrigger: once(composition, "top 80%") });
              tl.fromTo(
                photos,
                { clipPath: "inset(100% 0% 0% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", stagger: 0.22, clearProps: "clipPath" },
              );
              tl.from(
                photos.map((photo) => photo.querySelector("img")).filter(Boolean),
                { scale: 1.25, duration: 1.8, ease: "expo.out", stagger: 0.22, clearProps: "transform" },
                0.15,
              );
            }
            if (isDesktop) {
              gsap.utils.toArray<HTMLElement>("[data-depth]", composition).forEach((layer) => {
                const depth = Number(layer.dataset.depth) * 5;
                gsap.fromTo(
                  layer,
                  { yPercent: 0, y: depth },
                  { y: -depth, ease: "none", scrollTrigger: { trigger: composition, start: "top bottom", end: "bottom top", scrub: 0.6 } },
                );
              });
            }
          });

          // 5. Architectural sketches — the buildings grow out of the ground while the section scrolls in
          gsap.utils.toArray<SVGSVGElement>("[data-facade]").forEach((sketch) => {
            const parts = sketch.querySelectorAll("[data-facade-part]");
            if (!parts.length) return;
            gsap.fromTo(
              parts,
              { scaleY: 0, autoAlpha: 0, transformOrigin: "50% 100%" },
              {
                scaleY: 1,
                autoAlpha: 1,
                ease: "power2.out",
                stagger: 0.18,
                scrollTrigger: { trigger: sketch.closest("section"), start: "top 95%", end: "top 15%", scrub: 0.9 },
              },
            );
          });

          // 6. Services tower — rises smoothly: frame first, glass cladding just behind it, crane riding on the
          // glass roof (the visible one). Build and crane exit share one scrubbed timeline keyed to the sketch
          // (the crane sits at its top), so they can't drift apart on any screen size: the tower is finished with
          // the sketch top ~55% down the screen, the crane is gone by 40%, and the finished tower then stays in
          // view without it for the last 40% of the viewport plus the roof's own height.
          gsap.utils.toArray<SVGGElement>("[data-build]").forEach((build) => {
            const floors = Number(build.dataset.floors);
            const storey = Number(build.dataset.floor);
            const frame = build.querySelector("[data-build-frame]");
            const clad = build.querySelector("[data-build-clad]");
            const crane = build.querySelector("[data-build-crane]");
            // Inner group, so the exit fade doesn't fight the entrance over the same properties
            const craneBody = crane?.firstElementChild;
            const sketch = build.closest("svg");
            if (!frame || !clad || !crane || !craneBody || !sketch) return;
            gsap
              .timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: sketch, start: "top 95%", end: "top 40%", scrub: 0.8 },
              })
              .fromTo(frame, { y: floors * storey }, { y: 0, duration: 0.72, ease: "power1.out" }, 0)
              .fromTo(crane, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.12)
              .fromTo([clad, crane], { y: (floors + 1.5) * storey }, { y: 0, duration: 0.72, ease: "power1.out" }, 0.12)
              .fromTo(craneBody, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0.92);
          });

          if (isDesktop) {
            // 4. Hero — the photograph lags slightly behind as the hero scrolls away
            const hero = document.getElementById("home");
            const heroBg = hero?.querySelector("[data-hero-bg]");
            if (hero && heroBg) {
              gsap.to(heroBg, { yPercent: 8, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.4 } });
            }

            // 7. Large outline words slide sideways while their section passes through the viewport
            gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((word) => {
              gsap.fromTo(
                word,
                { xPercent: 6 },
                { xPercent: -6, ease: "none", scrollTrigger: { trigger: word.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.8 } },
              );
            });
          }
        },
      );

      document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
      cleanup = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lang]);

  return null;
}
