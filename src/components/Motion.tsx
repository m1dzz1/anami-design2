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
          const rise = isDesktop ? 40 : 24;
          const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9;
          const once = (trigger: Element, start = "top 86%") => ({ trigger, start, once: true });

          // 1. Display headings — masked line-by-line reveal
          gsap.utils.toArray<HTMLElement>("h2").forEach((heading) => {
            const lines = heading.querySelectorAll("[data-line]");
            if (!lines.length || !below(heading)) return;
            gsap.from(lines, {
              yPercent: 115,
              rotation: 2.5,
              transformOrigin: "0% 0%",
              duration: 1.25,
              ease: "expo.out",
              stagger: 0.11,
              scrollTrigger: once(heading),
            });
          });

          // 2. Kickers — the thin rule draws itself, then the label fades in
          gsap.utils.toArray<HTMLElement>(".kicker").filter(below).forEach((kicker) => {
            gsap
              .timeline({ scrollTrigger: once(kicker, "top 90%") })
              .fromTo(kicker, { "--rule": 0 }, { "--rule": 1, duration: 1, ease: "expo.inOut" })
              .from(kicker, { autoAlpha: 0, x: -10, duration: 0.8, ease: "power3.out" }, 0.25);
          });

          // 3. Copy blocks — gentle rise
          gsap.utils
            .toArray<HTMLElement>("[data-reveal-text]:not(.kicker)")
            .filter(below)
            .forEach((el) => {
              gsap.from(el, { y: rise, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: once(el) });
            });

          // 4. Groups (service cards, contact columns) — staggered rise; card photos unveil from the bottom
          gsap.utils.toArray<HTMLElement>("[data-reveal-group]").filter(below).forEach((group) => {
            const items = group.querySelectorAll("[data-reveal-item]");
            const media = group.querySelectorAll("[data-card-media], [data-reveal-clip] > div");
            const mediaImages = group.querySelectorAll("[data-card-media] img");
            if (!items.length) return;
            const tl = gsap.timeline({ scrollTrigger: once(group, "top 84%") });
            tl.from(items, { y: rise * 1.5, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.13 });
            if (media.length) {
              tl.from(media, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: 0.13 }, 0);
            }
            if (mediaImages.length) {
              tl.from(mediaImages, { scale: 1.18, duration: 1.8, ease: "expo.out", stagger: 0.13 }, 0.2);
            }
          });

          // 5. About — layered photographs wipe in from different directions
          gsap.utils.toArray<HTMLElement>('[data-reveal="composition"]').forEach((composition) => {
            const [nature, main, interior] = gsap.utils.toArray<HTMLElement>("[data-reveal-img]", composition);
            const caption = composition.querySelector("[data-reveal-caption]");

            if (below(composition)) {
              const tl = gsap.timeline({ scrollTrigger: once(composition, "top 78%") });
              tl.from(main, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" })
                .from(nature, { clipPath: "inset(0% 0% 0% 100%)", duration: 1.3, ease: "expo.inOut" }, 0.2)
                .from(interior, { clipPath: "inset(0% 100% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, 0.4)
                .from(
                  [main, nature, interior].map((el) => el.querySelector("img")),
                  { scale: 1.2, duration: 2, ease: "expo.out", stagger: 0.2 },
                  0.1,
                );
              if (caption) tl.from(caption, { x: -30, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.9);
            }

            // Depth: the layers drift at different speeds while scrolling
            if (isDesktop) {
              gsap.utils.toArray<HTMLElement>("[data-depth]", composition).forEach((layer) => {
                gsap.fromTo(
                  layer,
                  { y: -Number(layer.dataset.depth) * 6 },
                  {
                    y: Number(layer.dataset.depth) * 6,
                    ease: "none",
                    scrollTrigger: { trigger: composition, start: "top bottom", end: "bottom top", scrub: 0.8 },
                  },
                );
              });
            }
          });

          // 6. Editorial values panel — glass slides in, rules draw, items follow
          gsap.utils.toArray<HTMLElement>("[data-values-panel]").filter(below).forEach((panel) => {
            gsap
              .timeline({ scrollTrigger: once(panel, "top 85%") })
              .from(panel, { x: isDesktop ? 60 : 0, y: isDesktop ? 0 : rise, autoAlpha: 0, duration: 1.2, ease: "expo.out" })
              .from(panel.querySelectorAll("[data-value-item]"), { x: 24, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.12 }, 0.3)
              .from(panel.querySelectorAll("[data-value-rule]"), { scaleX: 0, duration: 1.1, ease: "expo.inOut", stagger: 0.12 }, 0.4);
          });

          // 6b. Architectural sketches — the buildings grow out of the ground while the section scrolls in
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

          // 6c. Services tower — rises smoothly: frame first, glass cladding just behind it, crane riding on the
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
            // 7. Editorial photograph — subtle parallax
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
              gsap.fromTo(
                layer,
                { yPercent: -7 },
                {
                  yPercent: 7,
                  ease: "none",
                  scrollTrigger: { trigger: layer.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.6 },
                },
              );
            });

            // 8. Hero — content lifts, photograph lags behind as the hero scrolls away
            const hero = document.getElementById("home");
            const heroContent = hero?.querySelector("[data-hero-content]");
            const heroBg = hero?.querySelector("[data-hero-bg]");
            if (hero && heroContent && heroBg) {
              const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 };
              // Transform only — fading the content (opacity < 1) would switch off the glass panel's backdrop blur
              gsap.to(heroContent, { y: -90, ease: "none", scrollTrigger: scrub });
              gsap.to(heroBg, { yPercent: 16, ease: "none", scrollTrigger: scrub });
            }
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
