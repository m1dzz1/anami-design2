/**
 * Office tower seen from its front corner in two-point perspective (the same angle as the
 * reference sketch), with the whole left facade open so the people working inside are visible.
 * The scene is modelled in 3D and projected through a camera, so floors, desks and people sit
 * *inside* the building rather than on its walls:
 *   X — along the open (left) facade, from the corner to the left
 *   Z — depth into the building, away from the open facade (the right face runs along Z)
 *   Y — height, measured from the viewer's eye level
 * Painter's order: rooms above eye level top → down, rooms below it bottom → up, the room at eye
 * level last; inside a room, far → near.
 */

import type { ReactNode } from "react";

type Pt = [number, number];
type V3 = [number, number, number];

/* Camera — corner at screen (CX, HORIZON), looking at it from the front-left, slightly below. */
const CX = 1610;
const HORIZON = 440;
const R = 700; // distance to the corner = focal length (1 unit = 1px at the corner)
const PHI = (48 * Math.PI) / 180;
const SIN = Math.sin(PHI);
const COS = Math.cos(PHI);

/* Building */
const WIDTH = 320; // open facade, along X
const DEPTH = 500; // right face, along Z
const ROOM = 110; // visible depth of the offices behind the open facade
const H = 105; // storey height
const ROOF = 250; // roof level above eye height
const FLOORS = 14;
const PEOPLE_FLOORS = 6;
const level = (k: number) => ROOF - k * H; // floor of storey k (k = 1 is the top storey)

function project([x, y, z]: V3): Pt {
  const zc = x * COS + z * SIN + R;
  return [CX + (R * (-x * SIN + z * COS)) / zc, HORIZON - (R * y) / zc];
}
const depthOf = ([x, , z]: V3) => x * COS + z * SIN;
const scaleAt = (v: V3) => R / (depthOf(v) + R);

const fmt = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;
const poly = (...pts: V3[]) => `M${pts.map((v) => fmt(project(v))).join(" L")} Z`;
const line = (...pts: V3[]) => `M${pts.map((v) => fmt(project(v))).join(" L")}`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Axis-aligned box: draws the faces turned towards the camera. */
function Box({ min: [x0, y0, z0], max: [x1, y1, z1], front = "#eef3ee", side = "#e2eae3", cap = "#fff", edge, className }: { min: V3; max: V3; front?: string; side?: string; cap?: string; edge?: number; className?: string }) {
  const capY = y1 < 0 ? y1 : y0 > 0 ? y0 : null; // top seen from above, bottom from below
  return (
    <g className={className} strokeOpacity={edge}>
      <path d={poly([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0])} fill={side} />
      <path d={poly([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0])} fill={front} />
      {capY !== null && <path d={poly([x0, capY, z0], [x1, capY, z0], [x1, capY, z1], [x0, capY, z1])} fill={cap} />}
    </g>
  );
}

/* --------------------------------------------------------------------------
   People — built from small boxes and seen from behind. Every colour comes
   from the site palette (ink, forest, greens, mint, mist); the detail is in
   the modelling, and each person varies only in tone and hair style.
   -------------------------------------------------------------------------- */

const SKIN = ["#f6f9f5", "#e1ebe0", "#cfdfd2"]; // mist tints
const HAIR = ["#102a24", "#1d4538", "#2b6149", "#4d615a"]; // ink, forest, green-deep, muted
const SHIRT = ["#36785b", "#a7c8ae", "#ffffff", "#1d4538", "#2b6149", "#e1ebe0"]; // green, mint, white, forest, green-deep, mist-deep
const TROUSERS = ["#102a24", "#1d4538", "#4d615a"];
const SHOES = "#0b1f1a"; // ink-deep
type HairStyle = "short" | "long" | "bun";
const HAIR_STYLES: HairStyle[] = ["short", "long", "short", "bun", "long", "short"];

/** Darken (k < 1) a #rrggbb colour — used for the side faces of boxes. */
function shade(hex: string, k = 0.84) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

type Look = { skin: string; hair: string; style: HairStyle; shirt: string; trousers: string };

/** Deterministic look per seat, so server and client render the same office. */
function lookFor(seed: number): Look {
  const pick = <T,>(list: T[], m: number) => list[(seed * m + 3) % list.length];
  return { skin: pick(SKIN, 7), hair: pick(HAIR, 5), style: pick(HAIR_STYLES, 11), shirt: pick(SHIRT, 3), trousers: pick(TROUSERS, 13) };
}

/** Solid-coloured box: shaded side face and a light outline. */
function Solid({ min, max, color }: { min: V3; max: V3; color: string }) {
  return <Box min={min} max={max} front={color} side={shade(color)} cap={shade(color, 0.94)} edge={0.22} />;
}

/** Head seen from behind: ears, then hair covering the back of the head in the person's style. */
function Head({ at, look, delay }: { at: V3; look: Look; delay?: string }) {
  const [x, y] = project(at);
  const r = 6.2 * scaleAt(at);
  return (
    <g className="worker-nod" style={delay ? { animationDelay: delay } : undefined}>
      {look.style === "long" && (
        <path
          d={`M${x - r * 0.95} ${y} L${x - r * 0.9} ${y + r * 1.85} Q${x} ${y + r * 2.15} ${x + r * 0.9} ${y + r * 1.85} L${x + r * 0.95} ${y} Z`}
          fill={look.hair}
          strokeOpacity="0.2"
        />
      )}
      <circle cx={x - r * 0.97} cy={y + r * 0.15} r={r * 0.24} fill={look.skin} strokeOpacity="0.2" />
      <circle cx={x + r * 0.97} cy={y + r * 0.15} r={r * 0.24} fill={look.skin} strokeOpacity="0.2" />
      <circle cx={x} cy={y} r={r} fill={look.skin} strokeOpacity="0.45" />
      {/* Hair over the back of the head, leaving a sliver of skin at the nape */}
      <path
        d={`M${x - r} ${y + r * 0.1} A${r} ${r} 0 1 1 ${x + r} ${y + r * 0.1} Q${x} ${y + r * (look.style === "long" ? 1.1 : 0.72)} ${x - r} ${y + r * 0.1} Z`}
        fill={look.hair}
        strokeOpacity="0.3"
      />
      {look.style === "bun" && <circle cx={x} cy={y - r * 0.95} r={r * 0.42} fill={look.hair} strokeOpacity="0.3" />}
    </g>
  );
}

/** Arm from shoulder through elbow to a hand: sleeve in the shirt colour, forearm and hand in skin. */
function Arm({ shoulder, elbow, hand, look }: { shoulder: V3; elbow: V3; hand: V3; look: Look }) {
  const [hx, hy] = project(hand);
  return (
    <g>
      <path d={line(shoulder, elbow)} stroke={shade(look.shirt, 0.9)} strokeOpacity="1" strokeWidth="3.2" />
      <path d={line(elbow, hand)} stroke={look.skin} strokeOpacity="1" strokeWidth="2.3" />
      <circle cx={hx} cy={hy} r={1.5 * scaleAt(hand)} fill={look.skin} strokeOpacity="0.25" />
    </g>
  );
}

/** Upper body shared by the seated and standing figures: torso, shoulders, collar and neck. */
function Torso({ x, base, z, height, look }: { x: number; base: number; z: number; height: number; look: Look }) {
  const top = base + height;
  return (
    <>
      <Solid min={[x - 5.2, base, z - 3.5]} max={[x + 5.2, top - 3, z + 3.5]} color={look.shirt} />
      <Solid min={[x - 7, top - 4, z - 3.5]} max={[x + 7, top, z + 3.5]} color={look.shirt} />
      <Solid min={[x - 2.6, top, z - 2]} max={[x + 2.6, top + 1.2, z + 2]} color={shade(look.shirt, 0.8)} />
      <Solid min={[x - 1.8, top + 1.2, z - 1.5]} max={[x + 1.8, top + 3.5, z + 1.5]} color={look.skin} />
    </>
  );
}

type Item = { depth: number; node: ReactNode };

/** Person at a desk, back to the viewer, working at a glowing screen. */
function workstation(x: number, f: number, key: string, delay: string, seed: number): Item {
  const z = 32;
  const look = lookFor(seed);
  return {
    depth: depthOf([x, f, z]),
    node: (
      <g key={key}>
        {/* Desk, monitor on its stand (screen faces the person and the viewer), keyboard, papers and a mug */}
        <path d={[line([x - 16, f, z + 38], [x - 16, f + 28, z + 38]), line([x + 16, f, z + 38], [x + 16, f + 28, z + 38])].join(" ")} strokeOpacity="0.3" />
        <Box min={[x - 18, f + 28, z + 12]} max={[x + 18, f + 31, z + 40]} />
        <Box min={[x - 4, f + 31, z + 32]} max={[x + 4, f + 32, z + 37]} front="#d3ddd4" side="#c7d3c9" cap="#dfe9e1" edge={0.2} />
        <path d={line([x, f + 32, z + 34], [x, f + 35, z + 34])} strokeOpacity="0.4" />
        <Box min={[x - 11, f + 35, z + 33]} max={[x + 11, f + 50, z + 35]} front="#dfe9e1" side="#d3ddd4" cap="#dfe9e1" />
        <path className="worker-screen" d={poly([x - 10, f + 36, z + 33], [x + 10, f + 36, z + 33], [x + 10, f + 49, z + 33], [x - 10, f + 49, z + 33])} fill="var(--anami-mint)" strokeOpacity="0" style={{ animationDelay: delay }} />
        <path d={poly([x - 7, f + 31, z + 17], [x + 7, f + 31, z + 17], [x + 7, f + 31, z + 23], [x - 7, f + 31, z + 23])} fill="#dfe9e1" strokeOpacity="0.3" />
        <path d={poly([x - 16, f + 31.2, z + 20], [x - 9, f + 31.2, z + 19], [x - 9, f + 31.2, z + 27], [x - 16, f + 31.2, z + 28])} fill="#fff" strokeOpacity="0.25" />
        <Box min={[x + 12, f + 31, z + 20]} max={[x + 15, f + 35, z + 23]} front="#fff" side="#e8efe9" cap={shade(look.shirt, 0.7)} edge={0.3} />
        {/* Chair base and column */}
        <path d={[line([x - 8, f, z], [x + 8, f, z]), line([x, f, z - 8], [x, f, z + 8]), line([x, f, z], [x, f + 16, z])].join(" ")} strokeOpacity="0.35" />
        <Box min={[x - 7, f + 16, z - 7]} max={[x + 7, f + 19, z + 7]} cap="#e8efe9" />
        {/* Person — shoes, shins, thighs on the seat */}
        {[x - 4.6, x + 0.6].map((x0) => (
          <g key={x0}>
            <Solid min={[x0 - 0.2, f, z + 13]} max={[x0 + 4.2, f + 2.2, z + 19]} color={SHOES} />
            <Solid min={[x0, f + 2.2, z + 13]} max={[x0 + 4, f + 18, z + 16.5]} color={look.trousers} />
            <Solid min={[x0, f + 17, z]} max={[x0 + 4, f + 22, z + 16.5]} color={look.trousers} />
          </g>
        ))}
        <Torso x={x} base={f + 21} z={z} height={21} look={look} />
        <g className="worker-type" style={{ animationDelay: delay }}>
          <Arm shoulder={[x - 6.5, f + 40, z]} elbow={[x - 7.5, f + 31, z + 8]} hand={[x - 3.5, f + 31.5, z + 19]} look={look} />
          <Arm shoulder={[x + 6.5, f + 40, z]} elbow={[x + 7.5, f + 31, z + 8]} hand={[x + 3.5, f + 31.5, z + 19]} look={look} />
        </g>
        <Head at={[x, f + 51, z]} look={look} delay={delay} />
        {/* Backrest between the person and the viewer */}
        <path d={line([x, f + 19, z - 8.5], [x, f + 21, z - 8.5])} strokeOpacity="0.35" />
        <Box min={[x - 7, f + 21, z - 10]} max={[x + 7, f + 36, z - 7]} front="#dde6de" side="#d3ddd4" cap="#e8efe9" />
      </g>
    ),
  };
}

/** Person standing at a photocopier, holding the fresh copies. */
function copier(x: number, f: number, key: string, delay: string, seed: number): Item {
  const z = 18;
  const look = lookFor(seed);
  return {
    depth: depthOf([x, f, z]),
    node: (
      <g key={key}>
        <Box min={[x - 14, f, 30]} max={[x + 14, f + 36, 58]} front="#f4f7f4" side="#e2eae3" cap="#fbfdfb" />
        {/* Paper drawers, lid and control strip */}
        <path d={[line([x - 14, f + 8, 30], [x + 14, f + 8, 30]), line([x - 14, f + 18, 30], [x + 14, f + 18, 30])].join(" ")} strokeOpacity="0.25" />
        <Box min={[x - 14, f + 36, 30]} max={[x + 14, f + 39, 58]} front="#dfe9e1" side="#d3ddd4" cap="#eef3ee" />
        <path className="worker-screen" style={{ animationDelay: delay }} d={poly([x - 12, f + 30, 30], [x - 2, f + 30, 30], [x - 2, f + 33, 30], [x - 12, f + 33, 30])} fill="var(--anami-mint)" strokeOpacity="0" />
        {/* Output tray with copies */}
        <Box min={[x + 14, f + 18, 34]} max={[x + 24, f + 21, 54]} cap="#fff" />
        {/* Person — shoes, legs, body */}
        {[x - 4.6, x + 0.6].map((x0) => (
          <g key={x0}>
            <Solid min={[x0 - 0.2, f, z - 1]} max={[x0 + 4.2, f + 2.2, z + 5]} color={SHOES} />
            <Solid min={[x0, f + 2.2, z - 2]} max={[x0 + 4, f + 31, z + 2]} color={look.trousers} />
          </g>
        ))}
        <Torso x={x} base={f + 30} z={z} height={23} look={look} />
        <g className="worker-type" style={{ animationDelay: delay }}>
          <Arm shoulder={[x - 6.5, f + 51, z]} elbow={[x - 8, f + 42, z + 6]} hand={[x - 4.5, f + 40, z + 12]} look={look} />
          <Arm shoulder={[x + 6.5, f + 51, z]} elbow={[x + 8, f + 42, z + 6]} hand={[x + 4.5, f + 40, z + 12]} look={look} />
          <path d={poly([x - 6, f + 40.5, z + 11], [x + 6, f + 40.5, z + 11], [x + 6, f + 40.5, z + 19], [x - 6, f + 40.5, z + 19])} fill="#fff" strokeOpacity="0.35" />
        </g>
        <Head at={[x, f + 62, z]} look={look} delay={delay} />
      </g>
    ),
  };
}

function plant(x: number, f: number, key: string): Item {
  const [px, py] = project([x, f + 16, 20]);
  const s = scaleAt([x, f, 20]);
  return {
    depth: depthOf([x, f, 20]),
    node: (
      <g key={key}>
        <Box min={[x - 5, f, 15]} max={[x + 5, f + 16, 25]} front="#fff" side="#eef3ee" cap="#dfe9e1" />
        <path
          d={`M${px} ${py} c${-12 * s} ${-10 * s} ${-12 * s} ${-22 * s} ${-4 * s} ${-30 * s} M${px} ${py} c${10 * s} ${-12 * s} ${12 * s} ${-20 * s} ${7 * s} ${-32 * s} M${px} ${py} l${s} ${-28 * s}`}
          stroke="var(--anami-green)"
          strokeOpacity="0.55"
        />
      </g>
    ),
  };
}

/** What stands where along each storey — mostly people at work, one photocopier per floor. */
const layouts: ("desk" | "copier" | "plant")[][] = [
  ["desk", "desk", "copier", "desk", "plant"],
  ["desk", "copier", "desk", "desk", "desk"],
  ["plant", "desk", "desk", "copier", "desk"],
  ["desk", "desk", "desk", "desk", "copier"],
  ["copier", "desk", "desk", "plant", "desk"],
  ["desk", "desk", "copier", "desk", "desk"],
];
const slots = [34, 96, 158, 220, 282];

function Storey({ k }: { k: number }) {
  const f = level(k);
  const c = level(k - 1);
  const items = slots.map((x, i) => {
    const kind = layouts[(k - 1) % layouts.length][i];
    const key = `${k}-${i}`;
    const delay = `${-((k * 7 + i * 3) % 10) * 0.37}s`;
    const seed = k * 5 + i;
    return kind === "desk" ? workstation(x, f, key, delay, seed) : kind === "copier" ? copier(x, f, key, delay, seed) : plant(x, f, key);
  });
  items.sort((a, b) => b.depth - a.depth);

  return (
    <g>
      {/* Room shell: back wall, far end wall, and the ceiling (from below) or floor (from above) */}
      <g strokeOpacity="0.12">
        <path d={poly([0, f, ROOM], [WIDTH, f, ROOM], [WIDTH, c, ROOM], [0, c, ROOM])} fill="#f1f6f0" />
        <path d={poly([WIDTH, f, 0], [WIDTH, f, ROOM], [WIDTH, c, ROOM], [WIDTH, c, 0])} fill="#e6eee6" />
        {c > 0 && <path d={poly([0, c, 0], [WIDTH, c, 0], [WIDTH, c, ROOM], [0, c, ROOM])} fill="#e9f0e9" />}
        {f < 0 && <path d={poly([0, f, 0], [WIDTH, f, 0], [WIDTH, f, ROOM], [0, f, ROOM])} fill="#fafcf9" />}
        {/* Ceiling light strips */}
        {c > 0 &&
          [80, 240].map((x) => (
            <path key={x} className="worker-lamp" d={poly([x - 30, c - 1, 40], [x + 30, c - 1, 40], [x + 30, c - 1, 48], [x - 30, c - 1, 48])} fill="var(--anami-mint)" strokeOpacity="0" />
          ))}
      </g>
      {items.map((item) => item.node)}
    </g>
  );
}

export default function OfficeCutaway({ shade }: { shade: string }) {
  const ground = level(FLOORS);
  const storeys = range(PEOPLE_FLOORS).map((i) => i + 1);
  const above = storeys.filter((k) => level(k) > 0); // whole storey above eye level
  const below = storeys.filter((k) => level(k - 1) < 0).reverse(); // whole storey below it
  const atEye = storeys.filter((k) => level(k) <= 0 && level(k - 1) >= 0);

  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* Storeys without people further down (mostly behind the map) — plain structure */}
      <path d={poly([0, ground, 0], [WIDTH, ground, 0], [WIDTH, level(PEOPLE_FLOORS), 0], [0, level(PEOPLE_FLOORS), 0])} fill="#eef3ee" strokeOpacity="0" />

      <g className="facade-people" strokeOpacity="0.5">
        {[...above, ...below, ...atEye].map((k) => (
          <Storey key={k} k={k} />
        ))}
      </g>

      {/* Open facade: slab edges, columns, roof edge */}
      <g strokeOpacity="0.3">
        {range(FLOORS + 1).map((k) => (
          <Box key={k} min={[0, level(k) - 5, 0]} max={[WIDTH, level(k) + (k === 0 ? 8 : 0), 3]} front="#dbe5dc" side="#cfdbd1" cap="#eef3ee" />
        ))}
        {[0, 160, WIDTH].map((x) => (
          <path key={x} d={line([x, ground, 0], [x, ROOF, 0])} strokeWidth="2" strokeOpacity="0.28" />
        ))}
      </g>

      {/* Right face — a solid (non-transparent) wall */}
      <g strokeOpacity="0.14">
        <path d={poly([0, ground, 0], [0, ground, DEPTH], [0, ROOF + 8, DEPTH], [0, ROOF + 8, 0])} fill={shade} />
        {range(12).map((i) => (
          <path key={`m${i}`} d={line([0, ground, 30 + i * 55], [0, ROOF + 8, 30 + i * 55])} strokeOpacity={i % 3 === 2 ? 0.2 : undefined} />
        ))}
        {range(FLOORS + 1).map((k) => (
          <path key={`f${k}`} d={line([0, level(k), 0], [0, level(k), DEPTH])} />
        ))}
        <path d={line([0, ROOF + 8, 0], [0, ROOF + 8, DEPTH])} strokeOpacity="0.2" />
        <path d={line([0, ground, 0], [0, ROOF + 8, 0])} strokeOpacity="0.3" />
      </g>
    </g>
  );
}
