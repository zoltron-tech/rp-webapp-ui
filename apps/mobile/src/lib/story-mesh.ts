import type {
  CharacterRefType,
  CodexRelationship,
  CodexTone,
  CodexToneLineStyle,
  RelationshipTone,
} from "@nw/types";

/**
 * The relationship mesh, without a screen: tones, the force layout and the
 * edge geometry. A port of web's `story-codex/relationships/{tones,
 * simulation, layout}.ts`, kept pure so the screen only draws.
 *
 * ## Keys
 *
 * A character is `${refType}:${id}` everywhere here. The muse and
 * story-character id spaces are separate, so an id on its own does not say
 * who somebody is; web's mesh keys by id alone and would draw a muse and a
 * story character with the same UUID as one node. The sheets on both
 * platforms already key by both, as does the character sheet's list.
 *
 * ## Determinism
 *
 * No randomness: the seed is a golden-angle spiral off the cast's order,
 * symmetry is broken with a fixed hash of the index, and the settle runs a
 * fixed schedule. The same cast opens to the same shape every time, on web
 * and here.
 */

// ─── Keys ───────────────────────────────────────────────────────────────────

export const nodeKey = (id: string, refType: CharacterRefType): string =>
  `${refType}:${id}`;

export const relationshipEnds = (relationship: CodexRelationship) => ({
  from: nodeKey(relationship.fromId, relationship.fromType),
  to: nodeKey(relationship.toId, relationship.toType),
});

// ─── Tones ──────────────────────────────────────────────────────────────────

/** Web's `TONE_SPECS`: the three built-ins, with the dash each is stroked in. */
export const TONE_SPECS: Record<
  RelationshipTone,
  {
    label: string;
    description: string;
    light: string;
    dark: string;
    dash?: string;
  }
> = {
  BOND: {
    dark: "#199e70",
    description: "Trust, kinship, debts honoured.",
    label: "Bond",
    light: "#1baf7a",
  },
  NEUTRAL: {
    dark: "#3987e5",
    dash: "2 5",
    description: "Acquaintance, duty, circumstance.",
    label: "Neutral",
    light: "#2a78d6",
  },
  STRAIN: {
    dark: "#d95926",
    dash: "7 5",
    description: "Rivalry, grudges, wounds still open.",
    label: "Strain",
    light: "#eb6834",
  },
};

/** Legend and picker order. */
export const TONE_ORDER: readonly RelationshipTone[] = [
  "BOND",
  "STRAIN",
  "NEUTRAL",
];

export const LINE_STYLE_DASH: Record<CodexToneLineStyle, string | undefined> = {
  DASHED: "7 5",
  DOTTED: "2 5",
  SOLID: undefined,
};

export const LINE_STYLE_LABELS: Record<CodexToneLineStyle, string> = {
  DASHED: "Dashed",
  DOTTED: "Dotted",
  SOLID: "Continuous",
};

export const LINE_STYLES: readonly CodexToneLineStyle[] = [
  "SOLID",
  "DASHED",
  "DOTTED",
];

/** Web's `CODEX_COLORS`: the swatches a tone or group may be painted in. */
export const CODEX_COLORS = [
  "#e5484d",
  "#f76b15",
  "#ffb224",
  "#46a758",
  "#12a594",
  "#0091ff",
  "#6e56cf",
  "#e93d82",
] as const;

/** The service's caps, so the sheet can say so before the server does. */
export const MAX_RELATIONSHIP_LABEL = 60;
export const MAX_TONE_LABEL = 40;
export const MAX_CODEX_TONES = 12;

export const STRENGTH_LABELS = ["Passing", "Real", "Defining"] as const;

/** Stroke weight by strength (1–3). */
export const strengthWidth = (strength: number): number =>
  [1.5, 2.5, 3.5][Math.min(2, Math.max(0, Math.round(strength) - 1))];

/**
 * A tone the mesh can draw: one colour for the current theme, one stroke, a
 * name. Built-in and custom resolve to the same shape.
 */
export interface ResolvedTone {
  /** A built-in's name, or a custom tone's id — the two cannot collide. */
  key: string;
  label: string;
  description?: string;
  color: string;
  /** `strokeDasharray`, or undefined for a continuous line. */
  dash?: string;
  /** The built-in three cannot be edited or removed. */
  isSystem: boolean;
}

export const toneKeyOf = (
  relationship: Pick<CodexRelationship, "tone" | "toneId">,
): string => relationship.toneId ?? relationship.tone;

const resolveSystemTone = (
  tone: RelationshipTone,
  light: boolean,
): ResolvedTone => {
  const spec = TONE_SPECS[tone];
  return {
    color: light ? spec.light : spec.dark,
    dash: spec.dash,
    description: spec.description,
    isSystem: true,
    key: tone,
    label: spec.label,
  };
};

/** Every tone this story can draw: the built-in three, then the authors' own. */
export const buildTonePalette = (
  customTones: readonly CodexTone[],
  light: boolean,
): ResolvedTone[] => [
  ...TONE_ORDER.map((tone) => resolveSystemTone(tone, light)),
  ...[...customTones]
    .sort((a, b) => a.ordinal - b.ordinal)
    .filter((tone) => tone.id)
    .map((tone) => ({
      color: tone.color,
      dash: LINE_STYLE_DASH[tone.lineStyle],
      isSystem: false,
      key: tone.id as string,
      label: tone.label,
    })),
];

/**
 * The tone an edge is drawn in. Falls back to the built-in when the custom
 * tone has been retired out from under it.
 */
export const resolveTone = (
  relationship: Pick<CodexRelationship, "tone" | "toneId">,
  palette: readonly ResolvedTone[],
  light: boolean,
): ResolvedTone =>
  palette.find((candidate) => candidate.key === toneKeyOf(relationship)) ??
  palette.find((candidate) => candidate.key === relationship.tone) ??
  resolveSystemTone("NEUTRAL", light);

// ─── Layout: nodes and edges ────────────────────────────────────────────────

export interface MeshNode {
  key: string;
  id: string;
  refType: CharacterRefType;
  name: string;
  x: number;
  y: number;
  /** How many relationships touch this character. */
  degree: number;
  /** Drawn radius — hubs are bigger, so the eye finds them first. */
  radius: number;
}

export interface MeshEdge {
  id: string;
  from: string;
  to: string;
  path: string;
  /** The curve's own points, for hit-testing a tap against it. */
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  labelX: number;
  labelY: number;
  labelAngle: number;
  tipX: number;
  tipY: number;
  tipAngle: number;
}

export const NODE_RADIUS_MIN = 17;
export const NODE_RADIUS_MAX = 28;
const HUB_DEGREE = 6;

export const nodeRadius = (degree: number) =>
  NODE_RADIUS_MIN +
  (NODE_RADIUS_MAX - NODE_RADIUS_MIN) * Math.min(1, degree / HUB_DEGREE);

type Point = [number, number];

const quadAt = (t: number, p0: Point, c: Point, p1: Point): Point => {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
  ];
};

/** The arcs, from wherever the characters currently are. */
export const buildEdges = (
  nodes: readonly MeshNode[],
  relationships: readonly CodexRelationship[],
): MeshEdge[] => {
  const byKey = new Map(nodes.map((node) => [node.key, node]));
  const fanned = new Map<string, number>();
  const edges: MeshEdge[] = [];

  relationships.forEach((relationship, index) => {
    const ends = relationshipEnds(relationship);
    const from = byKey.get(ends.from);
    const to = byKey.get(ends.to);
    if (!from || !to || from.key === to.key) return;

    const pairKey = [ends.from, ends.to].sort().join("|");
    const fan = fanned.get(pairKey) ?? 0;
    fanned.set(pairKey, fan + 1);

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const chordX = to.x - from.x;
    const chordY = to.y - from.y;
    const chord = Math.hypot(chordX, chordY) || 1;

    // The first relationship between a pair is dead straight; a second bows
    // out, and further ones splay either side of it.
    const side = fan % 2 === 0 ? 1 : -1;
    const bow = fan === 0 ? 0 : (chord * 0.06 + Math.ceil(fan / 2) * 34) * side;
    const controlX = midX + (-chordY / chord) * bow;
    const controlY = midY + (chordX / chord) * bow;

    const p0: Point = [from.x, from.y];
    const p1: Point = [to.x, to.y];
    const control: Point = [controlX, controlY];

    const label = quadAt(0.5, p0, control, p1);
    const before = quadAt(0.46, p0, control, p1);
    const after = quadAt(0.54, p0, control, p1);
    let labelAngle =
      (Math.atan2(after[1] - before[1], after[0] - before[0]) * 180) / Math.PI;
    if (labelAngle > 90) labelAngle -= 180;
    if (labelAngle < -90) labelAngle += 180;

    // Walk back from the far end until the arrowhead clears the disc.
    let tipT = 1;
    for (let t = 1; t >= 0.5; t -= 0.02) {
      const point = quadAt(t, p0, control, p1);
      if (Math.hypot(point[0] - to.x, point[1] - to.y) >= to.radius + 11) {
        tipT = t;
        break;
      }
    }
    const tip = quadAt(tipT, p0, control, p1);
    const tipBefore = quadAt(Math.max(0, tipT - 0.04), p0, control, p1);

    edges.push({
      cx: controlX,
      cy: controlY,
      from: ends.from,
      id: relationship.id ?? `edge-${index}`,
      labelAngle,
      labelX: label[0],
      labelY: label[1],
      path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
      tipAngle:
        (Math.atan2(tip[1] - tipBefore[1], tip[0] - tipBefore[0]) * 180) /
        Math.PI,
      tipX: tip[0],
      tipY: tip[1],
      to: ends.to,
      x0: from.x,
      x1: to.x,
      y0: from.y,
      y1: to.y,
    });
  });

  return edges;
};

/**
 * How far a board point is from an edge's curve — for deciding whether a
 * tap landed on it. Sampled, which is exact enough for a finger.
 */
export const edgeDistance = (edge: MeshEdge, x: number, y: number): number => {
  const p0: Point = [edge.x0, edge.y0];
  const c: Point = [edge.cx, edge.cy];
  const p1: Point = [edge.x1, edge.y1];
  let best = Number.POSITIVE_INFINITY;
  for (let step = 0; step <= 24; step += 1) {
    const point = quadAt(step / 24, p0, c, p1);
    const d = Math.hypot(point[0] - x, point[1] - y);
    if (d < best) best = d;
  }
  return best;
};

/** An arc of a circle, for the tone collar drawn around a character. */
export const collarArc = (
  cx: number,
  cy: number,
  radius: number,
  from: number,
  to: number,
): string => {
  const startX = cx + Math.cos(from) * radius;
  const startY = cy + Math.sin(from) * radius;
  const endX = cx + Math.cos(to) * radius;
  const endY = cy + Math.sin(to) * radius;
  const large = to - from > Math.PI ? 1 : 0;
  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${large} 1 ${endX} ${endY}`;
};

// ─── Group fields ───────────────────────────────────────────────────────────

/**
 * A closed, rounded outline around a group's members.
 *
 * Web traces a distance field with marching squares; that is a lot of maths
 * for a phone to redo on every drag frame. A padded convex hull, smoothed
 * with a Catmull-Rom curve, gives the same "these people are together"
 * read at a fraction of the cost. Members not on the board are skipped; a
 * group with fewer than two on it draws nothing.
 */
export const groupField = (
  members: readonly MeshNode[],
  pad: number,
): string | null => {
  if (members.length < 2) return null;
  // Eight points around each member's disc, so the hull hugs the discs
  // rather than their centres.
  const points: Point[] = [];
  for (const member of members) {
    const reach = member.radius + pad;
    for (let step = 0; step < 8; step += 1) {
      const angle = (step / 8) * Math.PI * 2;
      points.push([
        member.x + Math.cos(angle) * reach,
        member.y + Math.sin(angle) * reach,
      ]);
    }
  }
  const hull = convexHull(points);
  if (hull.length < 3) return null;
  return catmullRomClosed(hull);
};

const cross = (o: Point, a: Point, b: Point) =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Andrew's monotone chain. */
const convexHull = (input: Point[]): Point[] => {
  const points = [...input].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (points.length < 3) return points;
  const lower: Point[] = [];
  for (const point of points) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Point[] = [];
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const point = points[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
};

const catmullRomClosed = (points: Point[]): string => {
  const n = points.length;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1: Point = [
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
    ];
    const c2: Point = [
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
    ];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return `${d} Z`;
};

// ─── The simulation ─────────────────────────────────────────────────────────

export interface SimNode extends MeshNode {
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

const VELOCITY_DECAY = 0.6;
const ALPHA_DECAY = 0.026;
export const ALPHA_MIN = 0.006;
export const ALPHA_DRAG = 0.3;
export const ALPHA_SETTLE = 0.22;
const LINK_STRENGTH = 0.55;
const GRAVITY = 0.045;
const ISOLATE_GRAVITY = 0.011;
const COLLIDE_PAD = 14;
const LABEL_ROOM = 30;
const EDGE_PAD = 10;
const STRENGTH_DISTANCE = [1.3, 1.0, 0.74];
const GROUP_COHESION = 0.055;

const jitter = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export interface SimPerson {
  id: string;
  refType: CharacterRefType;
  name: string;
}

export interface SimGroup {
  id: string;
  memberKeys: string[];
}

export interface Simulation {
  nodes: SimNode[];
  readonly alpha: number;
  tick: () => void;
  reheat: (target: number, alpha?: number) => void;
  hold: (key: string, x: number | null, y: number | null) => void;
  settle: () => void;
}

export const createSimulation = ({
  cast,
  relationships,
  groups = [],
  width,
  height,
}: {
  cast: readonly SimPerson[];
  relationships: readonly CodexRelationship[];
  groups?: readonly SimGroup[];
  width: number;
  height: number;
}): Simulation => {
  const count = cast.length;

  const degree = new Map<string, number>();
  for (const relationship of relationships) {
    const ends = relationshipEnds(relationship);
    degree.set(ends.from, (degree.get(ends.from) ?? 0) + 1);
    degree.set(ends.to, (degree.get(ends.to) ?? 0) + 1);
  }

  const area = width * height;
  const linkDistance = clamp(
    Math.sqrt(area / Math.max(3, count)) * 0.62,
    96,
    210,
  );
  const charge = -(linkDistance * 11);
  const centreX = width / 2;
  const centreY = height / 2;

  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const seedRadius = Math.min(width, height) * 0.36;

  const nodes: SimNode[] = cast.map((person, index) => {
    const key = nodeKey(person.id, person.refType);
    const angle = index * GOLDEN_ANGLE;
    const radius = seedRadius * Math.sqrt((index + 0.5) / Math.max(1, count));
    return {
      degree: degree.get(key) ?? 0,
      fx: null,
      fy: null,
      id: person.id,
      key,
      name: person.name,
      radius: nodeRadius(degree.get(key) ?? 0),
      refType: person.refType,
      vx: 0,
      vy: 0,
      x: centreX + Math.cos(angle) * radius + jitter(index, 1) * 8,
      y: centreY + Math.sin(angle) * radius + jitter(index, 2) * 8,
    };
  });

  const indexByKey = new Map(nodes.map((node, index) => [node.key, index]));

  const springs = relationships
    .map((relationship) => {
      const ends = relationshipEnds(relationship);
      const from = indexByKey.get(ends.from);
      const to = indexByKey.get(ends.to);
      if (from === undefined || to === undefined || from === to) return null;
      const step =
        STRENGTH_DISTANCE[clamp(Math.round(relationship.strength) - 1, 0, 2)];
      const rest = linkDistance * step + nodes[from].radius + nodes[to].radius;
      const total = nodes[from].degree + nodes[to].degree || 2;
      return { biasFrom: nodes[from].degree / total, from, rest, to };
    })
    .filter((spring): spring is NonNullable<typeof spring> => spring !== null);

  const flocks = groups
    .map((group) =>
      group.memberKeys
        .map((key) => indexByKey.get(key))
        .filter((index): index is number => index !== undefined),
    )
    .filter((members) => members.length > 1);

  const state = { alpha: 1, alphaTarget: 0 };

  const tick = () => {
    state.alpha += (state.alphaTarget - state.alpha) * ALPHA_DECAY;
    const alpha = state.alpha;

    for (let i = 0; i < count; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        let deltaX = nodes[j].x - nodes[i].x;
        let deltaY = nodes[j].y - nodes[i].y;
        let squared = deltaX * deltaX + deltaY * deltaY;
        if (squared < 0.01) {
          deltaX = jitter(i * count + j, 3);
          deltaY = jitter(i * count + j, 4);
          squared = deltaX * deltaX + deltaY * deltaY || 1;
        }
        const push = (charge * alpha) / squared;
        nodes[i].vx += deltaX * push;
        nodes[i].vy += deltaY * push;
        nodes[j].vx -= deltaX * push;
        nodes[j].vy -= deltaY * push;
      }
    }

    for (const spring of springs) {
      const from = nodes[spring.from];
      const to = nodes[spring.to];
      const deltaX = to.x - from.x;
      const deltaY = to.y - from.y;
      const distance = Math.hypot(deltaX, deltaY) || 0.01;
      const pull =
        ((distance - spring.rest) / distance) * alpha * LINK_STRENGTH;
      const shiftX = deltaX * pull;
      const shiftY = deltaY * pull;
      to.vx -= shiftX * spring.biasFrom;
      to.vy -= shiftY * spring.biasFrom;
      from.vx += shiftX * (1 - spring.biasFrom);
      from.vy += shiftY * (1 - spring.biasFrom);
    }

    for (const flock of flocks) {
      let sumX = 0;
      let sumY = 0;
      for (const index of flock) {
        sumX += nodes[index].x;
        sumY += nodes[index].y;
      }
      const flockX = sumX / flock.length;
      const flockY = sumY / flock.length;
      const pull = GROUP_COHESION * alpha;
      for (const index of flock) {
        nodes[index].vx += (flockX - nodes[index].x) * pull;
        nodes[index].vy += (flockY - nodes[index].y) * pull;
      }
    }

    for (const node of nodes) {
      const pull = (node.degree === 0 ? ISOLATE_GRAVITY : GRAVITY) * alpha;
      node.vx += (centreX - node.x) * pull;
      node.vy += (centreY - node.y) * pull;
    }

    for (const node of nodes) {
      if (node.fx !== null && node.fy !== null) {
        node.x = node.fx;
        node.y = node.fy;
        node.vx = 0;
        node.vy = 0;
        continue;
      }
      node.vx *= VELOCITY_DECAY;
      node.vy *= VELOCITY_DECAY;
      node.x += node.vx;
      node.y += node.vy;
    }

    for (let pass = 0; pass < 2; pass += 1) {
      for (let i = 0; i < count; i += 1) {
        for (let j = i + 1; j < count; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const minimum = a.radius + b.radius + COLLIDE_PAD;
          let deltaX = b.x - a.x;
          let deltaY = b.y - a.y;
          let distance = Math.hypot(deltaX, deltaY);
          if (distance >= minimum) continue;
          if (distance < 0.01) {
            deltaX = jitter(i * count + j, 5);
            deltaY = jitter(i * count + j, 6);
            distance = Math.hypot(deltaX, deltaY) || 1;
          }
          const aFixed = a.fx !== null;
          const bFixed = b.fx !== null;
          if (aFixed && bFixed) continue;
          const overlap = minimum - distance;
          const unitX = (deltaX / distance) * overlap;
          const unitY = (deltaY / distance) * overlap;
          const aShare = aFixed ? 0 : bFixed ? 1 : 0.5;
          const bShare = 1 - aShare;
          a.x -= unitX * aShare;
          a.y -= unitY * aShare;
          b.x += unitX * bShare;
          b.y += unitY * bShare;
        }
      }
    }

    for (const node of nodes) {
      const x = clamp(
        node.x,
        node.radius + EDGE_PAD,
        width - node.radius - EDGE_PAD,
      );
      const y = clamp(
        node.y,
        node.radius + EDGE_PAD,
        height - node.radius - LABEL_ROOM,
      );
      if (x !== node.x) node.vx = 0;
      if (y !== node.y) node.vy = 0;
      node.x = x;
      node.y = y;
    }
  };

  const settle = () => {
    state.alpha = 1;
    state.alphaTarget = 0;
    const steps = count > 30 ? 220 : 300;
    for (let step = 0; step < steps; step += 1) tick();
    state.alpha = 0;
  };

  return {
    get alpha() {
      return state.alpha;
    },
    hold: (key, x, y) => {
      const node = nodes[indexByKey.get(key) ?? -1];
      if (!node) return;
      node.fx = x;
      node.fy = y;
    },
    nodes,
    reheat: (target, alpha) => {
      state.alphaTarget = target;
      if (alpha !== undefined) state.alpha = Math.max(state.alpha, alpha);
    },
    settle,
    tick,
  };
};
