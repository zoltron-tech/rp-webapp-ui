/**
 * The mesh's geometry — pure maths, no DOM.
 *
 * Characters sit evenly on a ring and every relationship is a Bézier arc bowed
 * toward the centre. A ring is deterministic (the same cast always draws the
 * same shape, so an author can learn it), it never tangles the way a force
 * simulation can, and the bow keeps two characters' several relationships from
 * lying on top of each other.
 */

export interface MeshNode {
  id: string;
  name: string;
  image: string | null;
  x: number;
  y: number;
  /** Angle on the ring, radians — labels use it to decide which side to sit. */
  angle: number;
  /** How many relationships touch this character. */
  degree: number;
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
  /** Where the arrowhead sits, for a directed relationship. */
  tipX: number;
  tipY: number;
  /** Arrowhead rotation, degrees. */
  tipAngle: number;
}

export interface MeshLayout {
  size: number;
  radius: number;
  centre: number;
  nodes: MeshNode[];
  edges: MeshEdge[];
}

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

interface Options {
  /** Cast characters, in a stable order — the ring follows it. */
  cast: { id: string; name: string; image: string | null }[];
  relationships: {
    id: string | null;
    fromMuseId: string;
    toMuseId: string;
  }[];
  /** Viewport edge, in SVG units. */
  size: number;
  /** Room reserved outside the ring for avatars and labels. */
  inset: number;
}

export const buildMeshLayout = ({
  cast,
  relationships,
  size,
  inset,
}: Options): MeshLayout => {
  const centre = size / 2;
  const radius = Math.max(0, centre - inset);

  const degree = new Map<string, number>();
  for (const relationship of relationships) {
    degree.set(
      relationship.fromMuseId,
      (degree.get(relationship.fromMuseId) ?? 0) + 1,
    );
    degree.set(
      relationship.toMuseId,
      (degree.get(relationship.toMuseId) ?? 0) + 1,
    );
  }

  const nodes: MeshNode[] = cast.map((member, index) => {
    // Start at the top and go clockwise, so the ring reads like a clock.
    const angle =
      -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(1, cast.length);
    return {
      angle,
      degree: degree.get(member.id) ?? 0,
      id: member.id,
      image: member.image,
      name: member.name,
      x: centre + Math.cos(angle) * radius,
      y: centre + Math.sin(angle) * radius,
    };
  });

  const byId = new Map(nodes.map((node) => [node.id, node]));

  /** Several relationships between the same pair fan out instead of stacking. */
  const seen = new Map<string, number>();

  const edges: MeshEdge[] = [];
  relationships.forEach((relationship, index) => {
    const from = byId.get(relationship.fromMuseId);
    const to = byId.get(relationship.toMuseId);
    // A relationship whose characters have dropped out of the cast has nothing
    // to draw between.
    if (!from || !to) return;

    const pairKey = [relationship.fromMuseId, relationship.toMuseId]
      .slice()
      .sort()
      .join("|");
    const fan = seen.get(pairKey) ?? 0;
    seen.set(pairKey, fan + 1);

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const chord = Math.hypot(to.x - from.x, to.y - from.y);

    // Bow toward the centre. For a pair sitting opposite each other the
    // midpoint *is* the centre, so fall back to the chord's own perpendicular
    // — otherwise the arc would collapse to a straight line through the middle
    // along with every other diameter.
    let dirX = centre - midX;
    let dirY = centre - midY;
    const toCentre = Math.hypot(dirX, dirY);
    if (toCentre < 1) {
      dirX = -(to.y - from.y);
      dirY = to.x - from.x;
    }
    const length = Math.hypot(dirX, dirY) || 1;
    const bow = chord * 0.18 + fan * 18;
    const controlX = midX + (dirX / length) * bow;
    const controlY = midY + (dirY / length) * bow;

    const label = quadAt(
      0.5,
      [from.x, from.y],
      [controlX, controlY],
      [to.x, to.y],
    );
    // The arrowhead sits just short of the far end, clear of the avatar.
    const tip = quadAt(
      0.86,
      [from.x, from.y],
      [controlX, controlY],
      [to.x, to.y],
    );
    const before = quadAt(
      0.82,
      [from.x, from.y],
      [controlX, controlY],
      [to.x, to.y],
    );

    edges.push({
      fromId: relationship.fromMuseId,
      id: relationship.id ?? `edge-${index}`,
      labelX: label[0],
      labelY: label[1],
      path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
      tipAngle:
        (Math.atan2(tip[1] - before[1], tip[0] - before[0]) * 180) / Math.PI,
      tipX: tip[0],
      tipY: tip[1],
      toId: relationship.toMuseId,
    });
  });

  return { centre, edges, nodes, radius, size };
};
