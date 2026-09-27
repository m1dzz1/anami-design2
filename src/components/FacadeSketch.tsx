/**
 * Faint glass-architecture sketch used behind light sections (reference): glass towers in
 * perspective drawn on the reference's 1774-wide canvas and scaled with the section width.
 * Lines run past the bottom of the viewBox so the facade reaches the end of the section at any
 * height; on phones the canvas is enlarged so the tower sits right behind the headline.
 *
 * - services: the main tower is built floor by floor on scroll, with a tower crane ([data-build]).
 * - contact:  an office tower with its left facade open, people at work on every floor
 *             (see OfficeCutaway.tsx).
 * Other buildings are one [data-facade-part] each and "grow" out of the ground (see Motion.tsx).
 */

import OfficeCutaway from "./OfficeCutaway";

type Variant = "services" | "contact";

const BOTTOM = 1600;
/** Storey height — every floor line runs parallel to the top edge of its own face */
const FLOOR = 118;
/** Floors the services tower is built from, bottom-up */
const BUILD_FLOORS = 9;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

type Tower = {
  /** Front corner (top) */
  cx: number;
  cy: number;
  /** Left face, far top corner */
  lx: number;
  ly: number;
  /** Right face, top edge where it leaves the canvas */
  ry: number;
};

const leftSlope = ({ cx, cy, lx, ly }: Tower) => (cy - ly) / (cx - lx);
const rightSlope = ({ cx, cy, ry }: Tower) => (ry - cy) / (1774 - cx);

/* --------------------------------------------------------------------------
   Tower faces, split into cladding (glass fills) and structure (lines) so the
   services tower can clad each floor after its frame is up.
   -------------------------------------------------------------------------- */

function LeftCladding({ tower, fill }: { tower: Tower; fill: string }) {
  const { cx, cy, lx, ly } = tower;
  return <path d={`M${lx} ${ly} L${cx} ${cy} L${cx} ${BOTTOM} L${lx} ${BOTTOM} Z`} fill={fill} strokeOpacity="0" />;
}

function LeftStructure({ tower }: { tower: Tower }) {
  const { cx, cy, lx, ly } = tower;
  const slope = leftSlope(tower);
  return (
    <g strokeOpacity="0.12">
      {range(Math.floor((cx - lx) / 28)).map((i) => {
        const x = lx + 25 + i * 28;
        return <path key={i} d={`M${x} ${ly + (x - lx) * slope} L${x} ${BOTTOM}`} />;
      })}
      {range(12).map((i) => (
        <path key={`h${i}`} d={`M${lx} ${ly + (i + 1) * FLOOR} L${cx} ${cy + (i + 1) * FLOOR}`} />
      ))}
      <path d={`M${lx} ${ly} L${cx} ${cy}`} strokeOpacity="0.2" />
      <path d={`M${lx} ${ly} L${lx} ${BOTTOM}`} strokeOpacity="0.14" />
    </g>
  );
}

function RightCladding({ tower, fill }: { tower: Tower; fill: string }) {
  const { cx, cy, ry } = tower;
  return <path d={`M${cx} ${cy} L1774 ${ry} L1774 ${BOTTOM} L${cx} ${BOTTOM} Z`} fill={fill} strokeOpacity="0" />;
}

function RightStructure({ tower }: { tower: Tower }) {
  const { cx, cy, ry } = tower;
  const slope = rightSlope(tower);
  return (
    <g strokeOpacity="0.13">
      {range(4).map((i) => {
        const x = cx + 40 + i * 36;
        return <path key={i} d={`M${x} ${cy + (x - cx) * slope} L${x} ${BOTTOM}`} strokeOpacity={i === 2 ? 0.2 : undefined} />;
      })}
      {range(12).map((i) => (
        <path key={`h${i}`} d={`M${cx} ${cy + (i + 1) * FLOOR} L1774 ${ry + (i + 1) * FLOOR}`} />
      ))}
      {/* Front corner — the strongest line of the sketch */}
      <path d={`M${cx} ${cy} L${cx} ${BOTTOM}`} strokeOpacity="0.22" />
      <path d={`M${cx} ${cy} L1774 ${ry}`} strokeOpacity="0.16" />
    </g>
  );
}

/* --------------------------------------------------------------------------
   Services — tower under construction
   -------------------------------------------------------------------------- */

/** Tower crane standing on the roof edge; drawn at its final (completed-building) position. */
function Crane({ x, y }: { x: number; y: number }) {
  const top = y - 165;
  const jib = top + 8;
  return (
    <g strokeOpacity="0.3">
      {/* Lattice mast */}
      <path d={`M${x - 7} ${y} L${x - 7} ${top} M${x + 7} ${y} L${x + 7} ${top}`} />
      <path d={range(6).map((i) => `M${x - 7} ${y - 15 - i * 25} L${x + 7} ${y - 40 - i * 25}`).join(" ")} strokeOpacity="0.2" />
      {/* Jib + counter-jib */}
      <path d={`M${x - 170} ${jib} L${x + 95} ${jib} M${x - 170} ${jib + 12} L${x + 95} ${jib + 12}`} />
      <path d={range(13).map((i) => `M${x - 170 + i * 20} ${jib + 12} L${x - 160 + i * 20} ${jib}`).join(" ")} strokeOpacity="0.2" />
      {/* Apex and ties */}
      <path d={`M${x} ${top - 45} L${x - 165} ${jib} M${x} ${top - 45} L${x + 90} ${jib} M${x - 7} ${top} L${x} ${top - 45} L${x + 7} ${top}`} strokeOpacity="0.22" />
      {/* Counterweight and cab */}
      <rect x={x + 62} y={jib + 12} width="30" height="16" fill="currentColor" fillOpacity="0.1" />
      <rect x={x + 8} y={jib + 12} width="16" height="14" fill="#fff" fillOpacity="0.6" />
      {/* Trolley, hoist rope and a steel beam on the hook */}
      <g className="crane-load">
        <rect x={x - 128} y={jib + 12} width="12" height="5" fill="currentColor" fillOpacity="0.25" />
        <path d={`M${x - 122} ${jib + 17} L${x - 122} ${jib + 110}`} strokeOpacity="0.25" />
        <path d={`M${x - 150} ${jib + 118} L${x - 94} ${jib + 118}`} strokeWidth="3" strokeOpacity="0.35" />
        <path d={`M${x - 122} ${jib + 110} L${x - 146} ${jib + 118} M${x - 122} ${jib + 110} L${x - 98} ${jib + 118}`} strokeOpacity="0.2" />
      </g>
    </g>
  );
}

function BuildingTower({ tower, id }: { tower: Tower; id: (name: string) => string }) {
  const { cx, cy, lx, ly, ry } = tower;
  // Clip = the tower silhouette; moving it down by whole storeys hides the unfinished floors,
  // and because floor lines run parallel to the roof edges each step reveals exactly one floor.
  const silhouette = `M${lx - 3} ${ly - 3} L${cx} ${cy - 3} L1780 ${ry - 3} L1780 ${BOTTOM + 2000} L${lx - 3} ${BOTTOM + 2000} Z`;
  const craneX = cx - 75;
  const craneY = ly + (craneX - lx) * leftSlope(tower);

  return (
    <g data-build data-floors={BUILD_FLOORS} data-floor={FLOOR}>
      <defs>
        <clipPath id={id("frame")} clipPathUnits="userSpaceOnUse">
          <path data-build-frame d={silhouette} />
        </clipPath>
        <clipPath id={id("clad")} clipPathUnits="userSpaceOnUse">
          <path data-build-clad d={silhouette} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id("clad")})`}>
        <LeftCladding tower={tower} fill={`url(#${id("glass")})`} />
        <RightCladding tower={tower} fill={`url(#${id("shade")})`} />
      </g>
      <g clipPath={`url(#${id("frame")})`}>
        <LeftStructure tower={tower} />
        <RightStructure tower={tower} />
      </g>
      {/* Hidden until the build animation runs; never shown to reduced-motion users */}
      <g data-build-crane opacity="0">
        <Crane x={craneX} y={craneY} />
      </g>
    </g>
  );
}

/* -------------------------------------------------------------------------- */

/** Services tower (worm's-eye perspective, as in the reference) */
const servicesTower: Tower = { cx: 1615, cy: 95, lx: 1385, ly: 330, ry: 18 };

export default function FacadeSketch({ variant, className = "" }: { variant: Variant; className?: string }) {
  const id = (name: string) => `facade-${variant}-${name}`;

  return (
    <svg
      aria-hidden="true"
      data-facade
      viewBox="0 0 1774 834"
      className={`facade-sketch pointer-events-none absolute right-0 top-0 h-auto w-full overflow-visible text-ink max-md:w-[158vw] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <defs>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dde7de" stopOpacity="0.85" />
          <stop offset="1" stopColor="#dde7de" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={id("fade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={id("mask-fill")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.64" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id("mask")} maskUnits="userSpaceOnUse" x="-200" y="-400" width="2200" height={BOTTOM + 400}>
          <rect x="-200" y="-400" width="2200" height={BOTTOM + 400} fill={`url(#${id("mask-fill")})`} />
        </mask>
      </defs>

      {/* Gradient ids are prefixed per variant — the sketch appears in more than one section */}
      <g mask={`url(#${id("mask")})`}>
        {variant === "services" && (
          <>
            {/* Pale volume behind the headline */}
            <g data-facade-part strokeOpacity="0.05">
              <path d={`M620 170 L700 126 L1010 196 L1150 336 L1150 ${BOTTOM} L620 ${BOTTOM} Z`} fill={`url(#${id("fade")})`} />
              {range(10).map((i) => (
                <path key={i} d={`M700 ${126 + (i + 1) * FLOOR} L1010 ${196 + (i + 1) * FLOOR}`} />
              ))}
              <path d={`M700 126 L700 ${BOTTOM} M1010 196 L1010 ${BOTTOM}`} />
            </g>

            {/* Lower block stepping down in front of the tower */}
            <g data-facade-part strokeOpacity="0.07">
              <path d={`M1150 336 L1305 258 L1305 ${BOTTOM} L1150 ${BOTTOM} Z`} fill={`url(#${id("shade")})`} />
              <path d={`M1305 258 L1500 262 L1500 ${BOTTOM} L1305 ${BOTTOM} Z`} fill={`url(#${id("glass")})`} />
              {range(5).map((i) => (
                <path key={`v${i}`} d={`M${1180 + i * 26} ${321 - i * 13} L${1180 + i * 26} ${BOTTOM}`} />
              ))}
              {range(7).map((i) => (
                <path key={`w${i}`} d={`M${1333 + i * 28} 259 L${1333 + i * 28} ${BOTTOM}`} />
              ))}
              {range(11).map((i) => (
                <path key={`h${i}`} d={`M1150 ${336 + (i + 1) * FLOOR} L1305 ${258 + (i + 1) * FLOOR} L1500 ${262 + (i + 1) * FLOOR}`} />
              ))}
              <path d={`M1150 336 L1305 258 L1500 262 M1305 258 L1305 ${BOTTOM}`} strokeOpacity="0.1" />
            </g>

            {/* Main tower — built floor by floor on scroll */}
            <BuildingTower tower={servicesTower} id={id} />
          </>
        )}

        {variant === "contact" && (
          <g data-facade-part>
            <OfficeCutaway shade="#e3ebe4" />
          </g>
        )}
      </g>
    </svg>
  );
}
