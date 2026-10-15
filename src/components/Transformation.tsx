"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/types";
import { sectionIds, transformationFrames as frames } from "@/content/site";

type FrameSet = "lg" | "sm";

// First frame of each stage — the bare shell, then the fit-out (paint and flooring), then the furnished move-in
const stageStarts = [0, 26, 62];
// Share of the scroll distance before the first and after the last frame, so both ends rest for a moment
const leadIn = 0.05;
const leadOut = 0.12;
// Concurrent frame requests
const MAX_IN_FLIGHT = 6;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Load order that sketches the whole sequence first (every 16th frame), then fills in the gaps. */
function loadOrder(count: number, minStride: number) {
  const order: number[] = [];
  const seen = new Set<number>();
  for (let stride = 16; stride >= minStride; stride /= 2) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) order.splice(1, 0, count - 1);
  return order;
}

/**
 * "Od ideje do useljenja" — a pinned, scroll-scrubbed frame sequence: the office floor builds itself from a
 * bare concrete shell into a finished workspace. One scroll progress value drives the canvas, the active stage
 * and both progress indicators (via the --p custom property). React state changes only when the stage changes.
 */
export default function Transformation({ t }: { t: Dictionary }) {
  const tr = t.transformation;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const box = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!section || !box || !canvas || !ctx) return;
    // Reduced motion gets the static layout from CSS — no frames are downloaded at all
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lightweight = Boolean(connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? ""));

    const images: (HTMLImageElement | null)[] = new Array(frames.count).fill(null);
    let set: FrameSet | null = null;
    let generation = 0;
    let current = 0;
    let target = 0;
    let lastDrawn = "";
    let raf = 0;
    let started = false;
    let currentStage = 0;

    const pickSet = (): FrameSet => (box.clientWidth / Math.max(1, box.clientHeight) < 0.95 ? "sm" : "lg");

    const load = (frameSet: FrameSet) => {
      set = frameSet;
      const gen = ++generation;
      images.fill(null);
      lastDrawn = "";
      // Phones and data-saver connections take every second frame; the cross-fade covers the gaps
      const queue = loadOrder(frames.count, lightweight || frameSet === "sm" ? 2 : 1);
      let active = 0;
      const next = () => {
        while (active < MAX_IN_FLIGHT && queue.length) {
          const index = queue.shift()!;
          const img = new Image();
          img.decoding = "async";
          img.src = frames.path(frameSet, index);
          active++;
          img
            .decode()
            .then(() => {
              if (gen !== generation) return;
              images[index] = img;
              if (index === 0) setReady(true);
              lastDrawn = "";
              requestTick();
            })
            .catch(() => {})
            .finally(() => {
              active--;
              if (gen === generation) next();
            });
        }
      };
      next();
    };

    /** Closest decoded frames at or below / above `position`. */
    const neighbours = (position: number) => {
      let below = -1;
      let above = -1;
      for (let i = Math.floor(position); i >= 0; i--) if (images[i]) { below = i; break; }
      for (let i = Math.ceil(position); i < frames.count; i++) if (images[i]) { above = i; break; }
      return { below, above };
    };

    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      // Landscape frames keep the timber column and the green wall in view on narrower screens
      const focusX = set === "lg" ? 0.58 : 0.5;
      ctx.drawImage(img, (canvas.width - w) * focusX, (canvas.height - h) / 2, w, h);
    };

    const draw = () => {
      let { below, above } = neighbours(current);
      if (below < 0) below = above;
      if (above < 0) above = below;
      if (below < 0) return;
      const mix = above === below ? 0 : (current - below) / (above - below);
      const key = `${below}:${above}:${mix.toFixed(2)}:${canvas.width}`;
      if (key === lastDrawn) return;
      lastDrawn = key;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;
      cover(images[below]!);
      if (mix > 0.01) {
        ctx.globalAlpha = mix;
        cover(images[above]!);
        ctx.globalAlpha = 1;
      }
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const progress = clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
      section.style.setProperty("--p", progress.toFixed(4));
      target = clamp01((progress - leadIn) / (1 - leadIn - leadOut)) * (frames.count - 1);
      const nextStage = stageStarts.reduce((acc, start, i) => (target >= start - 0.5 ? i : acc), 0);
      if (nextStage !== currentStage) {
        currentStage = nextStage;
        setStage(nextStage);
      }
    };

    // Runs only while something changes: a scroll, a resize, a freshly decoded frame, or the ease settling
    const tick = () => {
      raf = 0;
      measure();
      const delta = target - current;
      current = Math.abs(delta) < 0.02 ? target : current + delta * 0.2;
      draw();
      if (current !== target) requestTick();
    };

    function requestTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(box.clientWidth * dpr);
      const height = Math.round(box.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastDrawn = "";
      }
      const wanted = pickSet();
      if (started && wanted !== set) load(wanted);
      requestTick();
    };

    let visible = false;
    const onScroll = () => visible && requestTick();

    // Start fetching frames one screen before the section arrives (not on first paint)
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        load(pickSet());
        preload.disconnect();
      },
      { rootMargin: "60% 0px" },
    );
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      requestTick();
    });
    const resizeObserver = new ResizeObserver(resize);

    preload.observe(section);
    onScreen.observe(section);
    resizeObserver.observe(box);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    current = target;

    return () => {
      generation++;
      preload.disconnect();
      onScreen.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const steps = tr.steps;

  return (
    <section
      ref={sectionRef}
      id={sectionIds.transformation}
      aria-labelledby="transformation-title"
      className="transformation relative z-[var(--z-raise)] bg-petrol-deep"
      data-stage={stage}
    >
      <div className="tr-pin">
        {/* Frame stage — full-bleed from tablets up, the upper part of the screen on phones */}
        <div ref={stageRef} className="tr-stage absolute inset-x-0 top-0 bg-petrol-deep">
          <div className="tr-live absolute inset-0">
            {/* Poster: the first frame, shown until the canvas has its first decoded frame */}
            <picture>
              <source media="(max-aspect-ratio: 1/1)" srcSet={frames.path("sm", 0)} />
              <img
                src={frames.path("lg", 0)}
                alt=""
                width={frames.lg.width}
                height={frames.lg.height}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-[58%_50%]"
              />
            </picture>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={tr.imageAlt}
              className={`absolute inset-0 size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
            />
          </div>
          {/* Reduced motion: the finished space as a still photograph */}
          <picture className="tr-static">
            <source media="(max-aspect-ratio: 1/1)" srcSet={frames.path("sm", frames.count - 1)} />
            <img
              src={frames.path("lg", frames.count - 1)}
              alt={tr.imageAlt}
              width={frames.lg.width}
              height={frames.lg.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[58%_50%]"
            />
          </picture>
          <div aria-hidden="true" className="tr-grade absolute inset-0" />
        </div>

        <div className="tr-content container-x relative flex h-full flex-col justify-end pb-[max(1.5rem,4svh)] md:justify-center md:pb-0 md:pt-[var(--nav-h)]">
          <div className="max-w-[min(38rem,48vw)] max-md:max-w-[31rem]">
            <p aria-hidden="true" className="tr-motion-only text-[0.75rem] font-bold uppercase tracking-[0.18em] text-teal-light">
              0{stage + 1} <span className="text-white/50">/</span> {steps[stage].title}
            </p>
            <h2 id="transformation-title" className="display mt-4 text-[clamp(2.5rem,11vw,3.6rem)] text-white md:text-[clamp(3.6rem,5.6vw,5.8rem)]">
              <span className="block">{tr.titleLine1}</span>
              <span className="block text-teal-light">{tr.titleLine2}</span>
            </h2>
            <p className="tr-static mt-5 text-[1.0625rem] leading-[1.6] text-white/88">{tr.lead}</p>

            {/* Stages — stacked in one cell and cross-faded; all three stay in the accessibility tree */}
            <ol className="tr-steps mt-4 grid md:mt-6">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  data-active={index === stage}
                  aria-current={index === stage ? "step" : undefined}
                  className="tr-step col-start-1 row-start-1"
                >
                  <span className="sr-only">
                    {tr.stepLabel} {index + 1}: {step.title}.{" "}
                  </span>
                  <span aria-hidden="true" className="tr-static mb-1 font-display text-[1.4rem] font-semibold uppercase text-teal-light">
                    0{index + 1} {step.title}
                  </span>
                  <span className="block max-w-[26rem] text-[0.9844rem] leading-[1.6] text-white/88 md:text-[1.0625rem]">
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>

            <span aria-hidden="true" className="rule mt-6 hidden text-white/60 md:block" />

            {/* Mobile progress — three segments filling with the scroll */}
            <div aria-hidden="true" className="tr-motion-only mt-5 grid grid-cols-3 gap-1.5 md:hidden">
              {steps.map((step, index) => (
                <span key={step.title} className="relative h-[3px] overflow-hidden bg-white/20">
                  <span className="tr-seg absolute inset-0 origin-left bg-teal-light" style={{ "--i": index } as CSSProperties} />
                </span>
              ))}
            </div>

            <div className="relative mt-6 min-h-[3.25rem] md:mt-8">
              <a href={`#${sectionIds.contact}`} className="tr-cta btn btn-primary relative">
                {tr.cta}
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop progress rail — right edge: a hairline track that fills with the scroll, one row per stage */}
        <ol aria-hidden="true" className="tr-motion-only tr-rail absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 md:flex">
          <span className="tr-rail-track" />
          <span className="tr-rail-fill" />
          {steps.map((step, index) => (
            <li key={step.title} data-active={index === stage} data-done={index < stage} className="tr-rail-item">
              <span className="display text-[1.5rem] font-medium leading-none">0{index + 1}</span>
              <span className="mt-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.16em]">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
