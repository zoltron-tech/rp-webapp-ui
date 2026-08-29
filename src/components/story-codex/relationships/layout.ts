/**
 * The mesh's edge geometry — pure maths, no DOM.
 *
 * Where the characters *are* is the simulation's business (`simulation.ts`);
 * this is only the arcs drawn between wherever they currently stand. It is
 * split out because a dragged character has to drag its relationships with it,
 * so this runs on every frame of a drag while the simulation runs its own.
 */

export interface MeshNode {
  id: string;
  name: string;
  image: string | null;
  x: number;
  y: number;
  /** How many relationships touch this character. */
  degree: number;
  /** Drawn radius — hubs are bigger, so the eye finds them first. */
  radius: number;
}

export interface MeshEdge {
  id: string;
  fromId: string;
  toId: string;
  /** SVG path for the arc. */
  path: string;
  /** Midpoint of the arc, for the direct label. */
  labelX: number;
  labelY: number;
  /** Label baseline rotation, degrees — arcs are rarely horizontal. */
  labelAngle: number;
  /** Where the arrowhead sits, for a directed relationship. */
  tipX: number;
  tipY: number;
  /** Arrowhead rotation, degrees. */
  tipAngle: number;
}

export interface LayoutLink {
  id: string | null;
  fromId: string;
  toId: string;
}

/** Smallest and largest a character's disc is drawn. */
export const NODE_RADIUS_MIN = 17;
export const NODE_RADIUS_MAX = 28;
/** Degree at which a character is already drawn as big as it gets. */
const HUB_DEGREE = 6;

export const nodeRadius = (degree: number) =>
  NODE_RADIUS_MIN +
  (NODE_RADIUS_MAX - NODE_RADIUS_MIN) * Math.min(1, degree / HUB_DEGREE);

/** Point on a quadratic Bézier at t. */
const quadAt = (
  t: number,
  p0: [number, number],
  c: [number, number],
  p1: [number, number],
): [number, number] => {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
  ];
};

/** The arcs, from wherever the characters currently are. */
export const buildEdges = (
  nodes: MeshNode[],
  relationships: LayoutLink[],
): MeshEdge[] => {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  /** Several relationships between the same pair fan out instead of stacking. */
  const fanned = new Map<string, number>();

  const edges: MeshEdge[] = [];
  relationships.forEach((relationship, index) => {
    const from = byId.get(relationship.fromId);
    const to = byId.get(relationship.toId);
    // A relationship whose characters have dropped out of the cast has nothing
    // to draw between.
    if (!from || !to || from.id === to.id) return;

    const pairKey = [relationship.fromId, relationship.toId].sort().join("|");
    const fan = fanned.get(pairKey) ?? 0;
    fanned.set(pairKey, fan + 1);

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const chordX = to.x - from.x;
    const chordY = to.y - from.y;
    const chord = Math.hypot(chordX, chordY) || 1;

    // The first relationship between a pair is drawn dead straight: this is a
    // node-link graph, and a straight line between two discs is what reads as
    // a connection. Only a *second* relationship between the same two people
    // needs to bow, and then it splays either side of the straight one rather
    // than stacking on it.
    const side = fan % 2 === 0 ? 1 : -1;
    const bow = fan === 0 ? 0 : (chord * 0.06 + Math.ceil(fan / 2) * 34) * side;
    const controlX = midX + (-chordY / chord) * bow;
    const controlY = midY + (chordX / chord) * bow;

    const p0: [number, number] = [from.x, from.y];
    const p1: [number, number] = [to.x, to.y];
    const control: [number, number] = [controlX, controlY];

    const label = quadAt(0.5, p0, control, p1);
    const labelBefore = quadAt(0.46, p0, control, p1);
    const labelAfter = quadAt(0.54, p0, control, p1);
    let labelAngle =
      (Math.atan2(
        labelAfter[1] - labelBefore[1],
        labelAfter[0] - labelBefore[0],
      ) *
        180) /
      Math.PI;
    // Keep type upright: a label past vertical reads better flipped than
    // upside down.
    if (labelAngle > 90) labelAngle -= 180;
    if (labelAngle < -90) labelAngle += 180;

    // Walk back from the far end until the arrowhead clears that character's
    // disc, whatever size the disc happens to be.
    let tipT = 1;
    for (let t = 1; t >= 0.5; t -= 0.02) {
      const point = quadAt(t, p0, control, p1);
      if (Math.hypot(point[0] - to.x, point[1] - to.y) >= to.radius + 11) {
        tipT = t;
        break;
      }
    }
    const tip = quadAt(tipT, p0, control, p1);
    const before = quadAt(Math.max(0, tipT - 0.04), p0, control, p1);

    edges.push({
      fromId: relationship.fromId,
      id: relationship.id ?? `edge-${index}`,
      labelAngle,
      labelX: label[0],
      labelY: label[1],
      path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
      tipAngle:
        (Math.atan2(tip[1] - before[1], tip[0] - before[0]) * 180) / Math.PI,
      tipX: tip[0],
      tipY: tip[1],
      toId: relationship.toId,
    });
  });

  return edges;
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
