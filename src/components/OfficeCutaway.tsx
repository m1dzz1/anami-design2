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
function Box({ min: [x0, y0, z0], max: [x1, y1, z1], front = "#eef3ee", side = "#e2eae3", cap = "#fff", className }: { min: V3; max: V3; front?: string; side?: string; cap?: string; className?: string }) {
  const capY = y1 < 0 ? y1 : y0 > 0 ? y0 : null; // top seen from above, bottom from below
  return (
    <g className={className}>
      <path d={poly([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0])} fill={side} />
      <path d={poly([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0])} fill={front} />
      {capY !== null && <path d={poly([x0, capY, z0], [x1, capY, z0], [x1, capY, z1], [x0, capY, z1])} fill={cap} />}
    </g>
  );
}

function Head({ at, delay }: { at: V3; delay?: string }) {
  const [x, y] = project(at);
  const r = 6.5 * scaleAt(at);
  return (
    <g className="worker-nod" style={delay ? { animationDelay: delay } : undefined}>
      <circle cx={x} cy={y} r={r} fill="#fff" strokeOpacity="0.6" />
      <path d={`M${x - r} ${y - 0.5} a${r} ${r} 0 0 1 ${2 * r} 0 Z`} fill="var(--anami-ink)" fillOpacity="0.45" strokeOpacity="0" />
    </g>
  );
}

type Item = { depth: number; node: ReactNode };

/** Person at a desk, back to the viewer, working at a glowing screen. */
function workstation(x: number, f: number, key: string, delay: string): Item {
  const z = 32;
  return {
    depth: depthOf([x, f, z]),
    node: (
      <g key={key}>
        {/* Desk, monitor (screen faces the person and the viewer) and keyboard */}
        <path d={[line([x - 16, f, z + 38], [x - 16, f + 28, z + 38]), line([x + 16, f, z + 38], [x + 16, f + 28, z + 38])].join(" ")} strokeOpacity="0.3" />
        <Box min={[x - 18, f + 28, z + 12]} max={[x + 18, f + 31, z + 40]} />
        <path d={line([x, f + 31, z + 34], [x, f + 35, z + 34])} strokeOpacity="0.4" />
        <Box min={[x - 11, f + 35, z + 33]} max={[x + 11, f + 50, z + 35]} front="#dfe9e1" side="#d3ddd4" cap="#dfe9e1" />
        <path className="worker-screen" d={poly([x - 10, f + 36, z + 33], [x + 10, f + 36, z + 33], [x + 10, f + 49, z + 33], [x - 10, f + 49, z + 33])} fill="var(--anami-mint)" strokeOpacity="0" style={{ animationDelay: delay }} />
        <path d={poly([x - 7, f + 31, z + 17], [x + 7, f + 31, z + 17], [x + 7, f + 31, z + 23], [x - 7, f + 31, z + 23])} fill="#dfe9e1" strokeOpacity="0.3" />
        {/* Person */}
        <path d={[line([x - 3, f + 21, z], [x - 3, f + 21, z + 14], [x - 3, f + 1, z + 15]), line([x + 3, f + 21, z], [x + 3, f + 21, z + 14], [x + 3, f + 1, z + 15])].join(" ")} strokeWidth="2" />
        <Box min={[x - 5, f + 20, z - 4]} max={[x + 5, f + 42, z + 4]} front="#a7c8ae" side="#8fb89a" cap="#cfe0d2" />
        <path className="worker-type" style={{ animationDelay: delay }} d={[line([x - 5, f + 39, z], [x - 6, f + 30, z + 9], [x - 3, f + 31, z + 19]), line([x + 5, f + 39, z], [x + 6, f + 30, z + 9], [x + 3, f + 31, z + 19])].join(" ")} strokeWidth="1.6" />
        <Head at={[x, f + 49, z]} delay={delay} />
        {/* Chair: seat, backrest between the person and the viewer, column */}
        <path d={line([x, f, z], [x, f + 16, z])} strokeOpacity="0.35" />
        <Box min={[x - 7, f + 16, z - 7]} max={[x + 7, f + 19, z + 7]} cap="#e8efe9" />
        <Box min={[x - 7, f + 19, z - 10]} max={[x + 7, f + 35, z - 7]} front="#dde6de" side="#d3ddd4" cap="#e8efe9" />
      </g>
    ),
  };
}

/** Person standing at a photocopier, copying documents. */
function copier(x: number, f: number, key: string, delay: string): Item {
  const z = 18;
  return {
    depth: depthOf([x, f, z]),
    node: (
      <g key={key}>
        <Box min={[x - 14, f, 30]} max={[x + 14, f + 36, 58]} front="#f4f7f4" side="#e2eae3" cap="#fbfdfb" />
        {/* Lid and control strip */}
        <Box min={[x - 14, f + 36, 30]} max={[x + 14, f + 39, 58]} front="#dfe9e1" side="#d3ddd4" cap="#eef3ee" />
        <path className="worker-screen" style={{ animationDelay: delay }} d={poly([x - 12, f + 30, 30], [x - 2, f + 30, 30], [x - 2, f + 33, 30], [x - 12, f + 33, 30])} fill="var(--anami-mint)" strokeOpacity="0" />
        {/* Output tray with copies */}
        <Box min={[x + 14, f + 18, 34]} max={[x + 24, f + 21, 54]} cap="#fff" />
        {/* Person */}
        <path d={[line([x - 3, f + 30, z], [x - 3, f, z]), line([x + 3, f + 30, z], [x + 3, f, z])].join(" ")} strokeWidth="2" />
        <Box min={[x - 5, f + 30, z - 4]} max={[x + 5, f + 54, z + 4]} front="#36785b" side="#2b6149" cap="#cfe0d2" />
        <path className="worker-type" style={{ animationDelay: delay }} d={[line([x - 5, f + 51, z], [x - 7, f + 42, z + 8], [x - 4, f + 40, z + 16]), line([x + 5, f + 51, z], [x + 7, f + 42, z + 8], [x + 4, f + 40, z + 16])].join(" ")} strokeWidth="1.6" />
        <Head at={[x, f + 61, z]} delay={delay} />
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
    return kind === "desk" ? workstation(x, f, key, delay) : kind === "copier" ? copier(x, f, key, delay) : plant(x, f, key);
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
