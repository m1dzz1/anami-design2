"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Logo from "./Logo";

/** Fired on window when the intro starts lifting, so layout that follows the hero (Header) can re-measure. */
export const INTRO_END_EVENT = "anami:intro-end";
/** Holds when the intro last played (ms since epoch). */
export const INTRO_SEEN_KEY = "anami:intro-seen";
/** After playing, the intro rests this long before a page load may show it again. */
const INTRO_REST_MS = 5 * 60 * 1000;

/**
 * Runs before first paint (inlined by the page ahead of <Intro>): decides whether this visit gets the intro.
 * It plays when it hasn't for INTRO_REST_MS (or on any URL with ?intro); never with reduced motion or right after
 * a language switch. The timeout is a failsafe so the page can never stay covered if the app fails to hydrate.
 */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement,f=/[?&]intro\\b/.test(location.search),t=+localStorage.getItem("${INTRO_SEEN_KEY}")||0;if(!f&&(Date.now()-t<${INTRO_REST_MS}||sessionStorage.getItem("anami:lang-switch")||matchMedia("(prefers-reduced-motion: reduce)").matches))return;d.classList.add("intro-playing");setTimeout(function(){d.classList.remove("intro-playing","intro-leaving")},9000)}catch(e){}})()`;

// The build itself takes ~2.4 s; the intro holds a little longer only if the hero photograph isn't ready yet
const MIN_MS = 2600;
const MAX_WAIT_MS = 5000;
const EXIT_MS = 1000;

const GROUND = 262;
const STOREY = 22;
const FLOORS = 8;
const TOWER = { left: 150, bays: 4, bay: 30 };
const WING = { left: 70, bays: 2, bay: 35, floors: 4 };
// Columns rise from 0.35 s over 1.5 s; each slab is laid as the columns pass its height
const FRAME_START = 0.35;
const FRAME_TIME = 1.5;
// Some panes catch the light more than others (fixed pattern, so the server and client agree)
const SHEEN = [0.14, 0.26, 0.1, 0.2, 0.3, 0.12, 0.22, 0.16];

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const timing = (delay: number, duration?: number) =>
  ({ "--d": `${delay.toFixed(2)}s`, ...(duration ? { "--t": `${duration.toFixed(2)}s` } : {}) }) as CSSProperties;

function Building() {
  const towerRight = TOWER.left + TOWER.bays * TOWER.bay;
  const top = GROUND - FLOORS * STOREY;
  const wingRight = WING.left + WING.bays * WING.bay;
  const slabAt = (floor: number, floors: number) => FRAME_START + (FRAME_TIME * floor) / floors - 0.12;

  return (
    <svg viewBox="0 0 420 290" aria-hidden="true" className="intro-sketch" fill="none" stroke="currentColor" strokeLinecap="square">
      {/* Ground, drawn outwards from the middle */}
      <path className="intro-draw" pathLength={1} d={`M210 ${GROUND} H24`} style={timing(0, 0.8)} />
      <path className="intro-draw" pathLength={1} d={`M210 ${GROUND} H396`} style={timing(0, 0.8)} />

      {/* Glass, floor by floor just behind the slabs */}
      <g fill="currentColor" stroke="none">
        {range(FLOORS).map((floor) =>
          range(TOWER.bays).map((bay) => (
            <rect
              key={`t${floor}-${bay}`}
              className="intro-pane"
              x={TOWER.left + bay * TOWER.bay + 3}
              y={GROUND - (floor + 1) * STOREY + 3}
              width={TOWER.bay - 6}
              height={STOREY - 6}
              style={{ ...timing(slabAt(floor + 1, FLOORS) + 0.35 + bay * 0.05), "--o": SHEEN[(floor * 3 + bay) % SHEEN.length] } as CSSProperties}
            />
          )),
        )}
        {range(WING.floors).map((floor) =>
          range(WING.bays).map((bay) => (
            <rect
              key={`w${floor}-${bay}`}
              className="intro-pane"
              x={WING.left + bay * WING.bay + 3}
              y={GROUND - (floor + 1) * STOREY + 3}
              width={WING.bay - 6}
              height={STOREY - 6}
              style={{ ...timing(0.6 + slabAt(floor + 1, WING.floors) + 0.3 + bay * 0.06), "--o": SHEEN[(floor * 5 + bay + 3) % SHEEN.length] } as CSSProperties}
            />
          )),
        )}
      </g>

      {/* Tower frame: columns rise, slabs follow */}
      {range(TOWER.bays + 1).map((i) => (
        <path
          key={`c${i}`}
          className="intro-draw intro-rise"
          pathLength={1}
          d={`M${TOWER.left + i * TOWER.bay} ${GROUND} V${top}`}
          style={timing(FRAME_START + i * 0.04, FRAME_TIME)}
        />
      ))}
      {range(FLOORS).map((floor) => (
        <path
          key={`s${floor}`}
          className="intro-draw"
          pathLength={1}
          d={`M${TOWER.left - 4} ${GROUND - (floor + 1) * STOREY} H${towerRight + 4}`}
          strokeWidth={floor === FLOORS - 1 ? 1.6 : undefined}
          style={timing(slabAt(floor + 1, FLOORS), 0.4)}
        />
      ))}
      {/* Rooftop plant room */}
      <path className="intro-draw" pathLength={1} d={`M188 ${top} V${top - 12} H232 V${top}`} style={timing(FRAME_START + FRAME_TIME, 0.4)} />

      {/* Lower wing, a beat behind the tower */}
      {range(WING.bays + 1).map((i) => (
        <path
          key={`wc${i}`}
          className="intro-draw intro-rise"
          pathLength={1}
          d={`M${WING.left + i * WING.bay} ${GROUND} V${GROUND - WING.floors * STOREY}`}
          style={timing(0.6 + FRAME_START + i * 0.05, FRAME_TIME * 0.6)}
        />
      ))}
      {range(WING.floors).map((floor) => (
        <path
          key={`ws${floor}`}
          className="intro-draw"
          pathLength={1}
          d={`M${WING.left - 4} ${GROUND - (floor + 1) * STOREY} H${wingRight}`}
          style={timing(0.6 + FRAME_START + (FRAME_TIME * 0.6 * (floor + 1)) / WING.floors - 0.1, 0.35)}
        />
      ))}

      {/* Tower crane: mast first, then the jib swings out, then the hook drops */}
      <g strokeOpacity="0.75">
        <path className="intro-draw intro-rise" pathLength={1} d={`M296 ${GROUND} V46`} style={timing(0.1, 1.1)} />
        <path className="intro-draw intro-rise" pathLength={1} d={`M304 ${GROUND} V46`} style={timing(0.1, 1.1)} />
        <path
          className="intro-draw intro-rise"
          pathLength={1}
          strokeOpacity="0.5"
          d={`M296 ${GROUND} ${range(9).map((i) => `L304 ${GROUND - 12 - i * 24} L296 ${GROUND - 24 - i * 24}`).join(" ")}`}
          style={timing(0.15, 1.1)}
        />
        <path className="intro-draw" pathLength={1} d="M300 46 H396" style={timing(1.15, 0.5)} />
        <path className="intro-draw" pathLength={1} d="M300 54 H396" style={timing(1.2, 0.5)} />
        <path className="intro-draw" pathLength={1} d="M300 46 H254 V54 H300" style={timing(1.15, 0.45)} />
        <path className="intro-draw" pathLength={1} strokeOpacity="0.55" d="M300 26 L396 46 M300 26 L254 46 M296 46 L300 26 L304 46" style={timing(1.4, 0.45)} />
        <rect className="intro-pane" x="258" y="54" width="16" height="9" fill="currentColor" stroke="none" style={{ ...timing(1.5), "--o": 0.35 } as CSSProperties} />
        <g className="intro-hook">
          <path className="intro-draw" pathLength={1} d="M370 54 V118" style={timing(1.65, 0.6)} />
          <path className="intro-draw" pathLength={1} strokeWidth="2.4" d="M352 124 H388" style={timing(2.1, 0.3)} />
          <path className="intro-draw" pathLength={1} strokeOpacity="0.6" d="M370 118 L354 124 M370 118 L386 124" style={timing(2.05, 0.3)} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Load intro (at most once every five minutes): an architectural line sketch of an office tower being built, while
 * the hero loads underneath. The overlay is server-rendered but hidden unless INTRO_SCRIPT marked this visit before first paint, so it never
 * flashes on loads that skip it. While it plays, the hero's own entrance is paused (globals.css) and starts as
 * the overlay lifts.
 */
export default function Intro() {
  const [done, setDone] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Skipped this load: the overlay stays display: none (no layout or paint cost)
    if (!html.classList.contains("intro-playing")) return;

    const started = performance.now();
    let ready = false;
    let leaving = false;
    let frame = 0;
    let exitTimer = 0;

    const heroImage = document.querySelector<HTMLImageElement>("[data-hero-bg] img");
    const loaded = (Promise.all([
      heroImage ? heroImage.decode().catch(() => {}) : Promise.resolve(),
      document.fonts?.ready,
    ]) as Promise<unknown>);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
    Promise.race([loaded, timeout]).then(() => {
      ready = true;
    });

    const leave = () => {
      leaving = true;
      try {
        localStorage.setItem(INTRO_SEEN_KEY, String(Date.now()));
      } catch {}
      html.classList.add("intro-leaving");
      html.classList.remove("intro-playing");
      window.dispatchEvent(new Event(INTRO_END_EVENT));
      exitTimer = window.setTimeout(() => {
        html.classList.remove("intro-leaving");
        setDone(true);
      }, EXIT_MS);
    };

    // The counter follows the build, holding just short of the end until the hero is ready
    const tick = () => {
      const elapsed = performance.now() - started;
      const linear = Math.min(1, elapsed / MIN_MS);
      const eased = 1 - Math.pow(1 - linear, 2.2);
      const progress = ready ? eased : Math.min(eased, 0.94);
      if (countRef.current) countRef.current.textContent = String(Math.round(progress * 100)).padStart(3, "0");
      rootRef.current?.style.setProperty("--intro-p", progress.toFixed(3));
      if (progress >= 1 && !leaving) {
        leave();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="intro" aria-hidden="true">
      <div className="intro-inner">
        <Building />
        <div className="intro-meta">
          <Logo className="intro-logo" />
          <span ref={countRef} className="intro-count display">
            000
          </span>
        </div>
        <span className="intro-bar" />
      </div>
    </div>
  );
}
