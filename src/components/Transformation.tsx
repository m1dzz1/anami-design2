"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/types";
import { sectionIds, transformationFrames as frames } from "@/content/site";

type FrameSet = "lg" | "sm";

// The first frame of each stage — the bare shell holds for a while, then paint, flooring and furniture arrive
const stageStarts = [0, 26, 44, 62];
// Share of the scroll distance spent before the first and after the last frame, so both ends linger
const leadIn = 0.04;
const leadOut = 0.1;

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
 * "Od ideje do useljenja" — a pinned, scroll-scrubbed image sequence: the office floor builds itself
 * from a bare concrete shell into a finished workspace while the four stages of the process play alongside.
 * Frames are drawn to a canvas and cross-faded, so the 81 source frames read as continuous motion.
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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lightweight = Boolean(connection?.saveData || /2g|3g/.test(connection?.effectiveType ?? ""));

    const images: (HTMLImageElement | null)[] = new Array(frames.count).fill(null);
    let set: FrameSet | null = null;
    let generation = 0;
    let current = 0;
    let target = 0;
    let lastDrawn = -1;
    let raf = 0;
    let visible = false;
    let started = false;
    let currentStage = 0;

    const pickSet = (): FrameSet => (box.clientWidth / Math.max(1, box.clientHeight) < 0.95 ? "sm" : "lg");

    const load = (frameSet: FrameSet) => {
      set = frameSet;
      const gen = ++generation;
      images.fill(null);
      lastDrawn = -1;
      const queue = loadOrder(frames.count, lightweight ? 2 : 1);
      let active = 0;
      const next = () => {
        while (active < 6 && queue.length) {
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
              lastDrawn = -1;
              requestDraw();
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

    /** Nearest decoded frame to `index`, searching outwards. */
    const nearest = (index: number) => {
      for (let d = 0; d < frames.count; d++) {
        const before = images[index - d];
        if (before) return before;
        const after = images[index + d];
        if (after) return after;
      }
      return null;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(box.clientWidth * dpr);
      const height = Math.round(box.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastDrawn = -1;
      }
      const wanted = pickSet();
      if (started && wanted !== set) load(wanted);
      requestDraw();
    };

    const cover = (img: HTMLImageElement) => {
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      // Landscape frames keep the timber column and the green wall in view on narrower screens
      const focusX = set === "lg" ? 0.56 : 0.5;
      ctx.drawImage(img, (canvas.width - w) * focusX, (canvas.height - h) / 2, w, h);
    };

    const draw = () => {
      const base = Math.floor(current);
      const mix = current - base;
      const key = Math.round(current * 100);
      if (key === lastDrawn) return;
      const a = nearest(base);
      if (!a) return;
      lastDrawn = key;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;
      cover(a);
      const b = mix > 0.01 && base + 1 < frames.count ? images[base + 1] : null;
      if (b) {
        ctx.globalAlpha = mix;
        cover(b);
        ctx.globalAlpha = 1;
      }
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = clamp01(-rect.top / Math.max(1, distance));
      section.style.setProperty("--p", progress.toFixed(4));
      const sequence = clamp01((progress - leadIn) / (1 - leadIn - leadOut));
      target = sequence * (frames.count - 1);
      section.style.setProperty("--intro", clamp01(progress / 0.06).toFixed(3));
      const nextStage = stageStarts.reduce((acc, start, i) => (target >= start - 0.5 ? i : acc), 0);
      if (nextStage !== currentStage) {
        currentStage = nextStage;
        setStage(nextStage);
      }
    };

    const tick = () => {
      raf = 0;
      measure();
      // While scrolling, follow the target and cross-fade neighbouring frames for smooth motion; once the scroll
      // rests, settle on the nearest whole frame so a still image is never two frames blended into each other
      const moving = Math.abs(target - current) > 0.35;
      const goal = moving ? target : Math.round(target);
      const delta = goal - current;
      current = reduceMotion || Math.abs(delta) < 0.01 ? goal : current + delta * (moving ? 0.16 : 0.22);
      draw();
      if (visible || Math.abs(goal - current) > 0.01) raf = requestAnimationFrame(tick);
    };

    function requestDraw() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // Start fetching frames well before the section scrolls into view
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        load(pickSet());
        preload.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    // Only animate while the section is on screen
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    });
    const resizeObserver = new ResizeObserver(resize);

    preload.observe(section);
    onScreen.observe(section);
    resizeObserver.observe(box);
    measure();
    current = target;

    return () => {
      generation++;
      preload.disconnect();
      onScreen.disconnect();
      resizeObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const total = String(tr.steps.length).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id={sectionIds.transformation}
      aria-labelledby="transformation-title"
      className="transformation relative bg-ink"
      data-stage={stage}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Image stage — full-bleed from tablets up, the upper part of the screen on phones */}
        <div ref={stageRef} className="tr-stage absolute inset-x-0 top-0">
          <picture>
            <source media="(max-aspect-ratio: 1/1)" srcSet={frames.path("sm", 0)} />
            <img
              src={frames.path("lg", 0)}
              alt=""
              width={frames.lg.width}
              height={frames.lg.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[56%_50%]"
            />
          </picture>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={tr.imageAlt}
            className={`absolute inset-0 size-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          />
          {/* Grades: deep on the text side, soft at the top for the navigation, fading into the ink below */}
          <div aria-hidden="true" className="tr-grade absolute inset-0" />
        </div>

        <div className="container-x relative flex h-full flex-col justify-end pb-8 sm:pb-10 md:justify-center md:pb-0 md:pt-[var(--nav-h)]">
          <div className="max-w-[36rem]">
            <p data-reveal-text className="kicker text-mint">
              {tr.kicker}
            </p>
            <h2 id="transformation-title" className="display mt-5 text-[clamp(2.6rem,12vw,4.2rem)] text-white md:text-[clamp(3.6rem,6.2vw,6.6rem)]">
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-line className="block">{tr.titleLine1}</span>
              </span>
              <span className="block overflow-hidden pb-[0.04em]">
                <span data-line className="block text-mint">{tr.titleLine2}</span>
              </span>
            </h2>
            <p className="tr-lead mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.55] text-white/88 max-md:sr-only">{tr.lead}</p>

            {/* Mobile progress — four segments, the active one fills with the scroll */}
            <div aria-hidden="true" className="mt-6 grid grid-cols-4 gap-1.5 md:hidden">
              {tr.steps.map((step, index) => (
                <span key={step.title} className="relative h-[2px] overflow-hidden bg-white/20">
                  <span className="tr-seg absolute inset-0 origin-left bg-mint" style={{ "--i": index } as React.CSSProperties} />
                </span>
              ))}
            </div>

            {/* Stages — stacked in one cell and cross-faded; all stay in the accessibility tree */}
            <ol className="mt-5 grid md:mt-10">
              {tr.steps.map((step, index) => (
                <li
                  key={step.title}
                  data-active={index === stage}
                  className="tr-step col-start-1 row-start-1 flex items-start gap-5 md:gap-7"
                >
                  <span aria-hidden="true" className="display text-[2.6rem] font-medium leading-[0.85] text-mint md:text-[3.6rem]">
                    0{index + 1}
                  </span>
                  <span className="border-l border-white/30 pl-5 md:pl-7">
                    <span className="sr-only">
                      {tr.stepLabel} {index + 1}:{" "}
                    </span>
                    <span className="block font-display text-[1.5rem] font-semibold uppercase leading-none tracking-[0.02em] text-white md:text-[1.9rem]">
                      {step.title}
                    </span>
                    <span className="mt-2 block max-w-[24rem] text-[0.9375rem] leading-[1.55] text-white/80 md:mt-3 md:text-[1rem]">
                      {step.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <a href={`#${sectionIds.contact}`} className="tr-cta btn btn-glass mt-8">
              {tr.cta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
            </a>
          </div>
        </div>

        {/* Desktop progress rail — right edge */}
        <div aria-hidden="true" className="absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 md:block">
          <div className="relative flex flex-col gap-10 pr-6 lg:gap-12">
            <span className="absolute right-0 top-1 bottom-1 w-px bg-white/20" />
            <span className="tr-rail absolute right-0 top-1 bottom-1 w-px origin-top bg-mint" />
            {tr.steps.map((step, index) => (
              <span
                key={step.title}
                data-active={index === stage}
                data-done={index < stage}
                className="tr-tick relative flex items-center justify-end gap-4 text-right text-[0.6875rem] font-bold uppercase tracking-[0.2em]"
              >
                <span className="tr-tick-label">{step.title}</span>
                <span className="tr-tick-num display text-[1.1rem] font-medium tracking-normal">0{index + 1}</span>
                <span className="tr-tick-dot absolute -right-6 size-[7px] translate-x-1/2 rounded-full" />
              </span>
            ))}
          </div>
        </div>

        {/* Stage counter + scroll hint — bottom edge, desktop */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden md:block">
          <div className="container-x flex items-end justify-between pb-8">
            <p className="flex items-baseline gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-white/70">
              {tr.stepLabel}
              <span className="display text-[1.6rem] font-medium tracking-normal text-white">0{stage + 1}</span>
              <span className="text-white/50">/ {total}</span>
            </p>
            <p className="tr-hint flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-white/75">
              {tr.scrollHint}
              <span className="relative block h-10 w-px overflow-hidden bg-white/25">
                <span className="tr-hint-line absolute inset-x-0 top-0 h-1/2 bg-mint" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
