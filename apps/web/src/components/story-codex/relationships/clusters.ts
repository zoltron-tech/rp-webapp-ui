import type { CodexGroup, StoryPerson } from "@nw/types";
import type { MeshNode } from "./layout";

/**
 * The mesh's group fields — the coloured clusters drawn around a story's
 * houses, clans and affiliations.
 *
 * A relationship is a line between two characters. A group is a *set*, so it is
 * drawn as an area rather than an edge: a soft field that wraps whoever belongs
 * to it, wherever the simulation has put them. Three Gryffindors are three
 * discs inside one red field; two Slytherins are two discs inside a green one.
 *
 * **Why a field and not a hull.** A convex hull around the members is one line
 * of code and swallows everybody standing inside it, member or not — on a live
 * force layout that is most of the board. So the field is grown from a skeleton
 * instead: a point per member, joined by the edges of their minimum spanning
 * tree. It reaches every member, it is connected, and it touches nobody else.
 *
 * **Why a traced contour and not a union of shapes.** Drawing that skeleton as
 * overlapping discs and capsules is simpler and gives the wrong edge: wherever
 * two of them meet at an angle their outlines cross, and the inside of the bend
 * is left as a hard crease. No stroke and no blur removes that — it is the
 * shape.
 *
 * So the field is a *distance function* — how far a point lies from the
 * skeleton, combined across the skeleton's bones with a smooth minimum rather
 * than a plain one. A plain minimum gives the union, creases and all; the
 * smooth one eases every junction over a band [BLEND] wide and the boundary
 * comes out continuous. That contour is traced (marching squares) and then
 * curved through its own points, leaving a single closed path.
 *
 * One path buys the rest of it. The fill is that path. The clip region that
 * intersects two fields is that path. The rim is that path *stroked* — which is
 * only honest because there are no longer any internal seams for a stroke to
 * find.
 *
 * **Overlaps.** Where two fields cross, the crossing is painted in the blend of
 * their colours — not in one stacked over the other, which would just read as
 * "the one on top". The region is exact: `clipPath` is an intersection, so
 * field A clipped by field B *is* the overlap, and clipping again by C gives
 * the three-way. They are painted in that order — singles, pairs, triples — at
 * full opacity inside one translucent layer, so each region ends up exactly one
 * colour rather than a stack of washes.
 *
 * Over the wash sits a fine hatch, angled by the group's own place in the
 * legend. Two groups crossing produce a crosshatch, so an overlap is legible as
 * a texture and not by its blended colour alone — the same reason every
 * relationship tone carries a stroke pattern.
 */

/** Clear space between a character's disc and the edge of their field. */
const FIELD_PAD = 18;

/**
 * How far back from a junction the boundary starts easing around it.
 *
 * This is the whole difference between a union and a field. At zero the two are
 * the same shape, creases included; larger values pull the curve away from the
 * bend earlier and round it harder. Past roughly the field's own reach it stops
 * looking like it wraps anybody in particular.
 */
const BLEND = 26;

/** How thick the rim around a field is drawn, in board units. */
export const FIELD_RIM = 1.6;

/**
 * How finely the contour is traced, in board units.
 *
 * A field costs this squared against its area, on every frame of a drag. Coarse
 * is affordable because the trace is not the final shape: its points are curved
 * through afterwards, which takes the grid back out of the outline.
 */
const TRACE_STEP = 11;

/** Traced points closer together than this are dropped before curving — they
 *  carry no shape, only path length. */
const TRACE_MIN_SPACING = 8;

/** Angles the hatch is drawn at, one per group, cycling. Two groups crossing
 *  land on different angles and read as a crosshatch. */
const HATCH_ANGLES = [45, 135, 0, 90];

/** A bone of the field's skeleton. a === b is a lone point (one member). */
interface Bone {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

interface Point {
  x: number;
  y: number;
}

export interface ClusterField {
  /** The group's id — also what its clip path is keyed on. */
  key: string;
  name: string;
  color: string;
  /** The field's outline: one closed, curved path. */
  path: string;
  /** The field's extent, for the rect that carries its hatch. */
  box: { x: number; y: number; width: number; height: number };
  /** Degrees the hatch is drawn at, so crossing fields crosshatch. */
  hatchAngle: number;
  /** Where the group's name is drawn: above the topmost member. */
  labelX: number;
  labelY: number;
  /** Members actually on the board — a group can outlive one of its characters. */
  memberIds: string[];
  /** The skeleton and how far the field reaches from it, kept for the overlap
   *  test: comparing two skeletons is far cheaper than intersecting two traced
   *  outlines, and the answer is the same one. */
  bones: Bone[];
  reach: number;
}

/** One painted region: a field on its own, or the overlap of several. */
export interface ClusterRegion {
  key: string;
  /** The field whose outline is drawn. */
  field: ClusterField;
  /** Fields the outline is clipped by, in order — empty for a lone field. */
  clippedBy: ClusterField[];
  /** The blend of every field involved. */
  color: string;
  /** Which groups meet here, for the region's own description. */
  names: string[];
}

// ── Colour ─────────────────────────────────────────────────────────────────

const parseHex = (hex: string): [number, number, number] | null => {
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
};

/**
 * The colour an overlap is painted in: the plain average of the fields that
 * meet there.
 *
 * An average, not a stack. Stacking two translucent washes gives whichever was
 * painted last a say in the result, so "in Gryffindor and Slytherin" would look
 * different depending on which group the author happened to make first. An
 * average is the same colour whichever way round it is read, which is the only
 * behaviour that matches what the region means.
 */
export const mixColors = (colors: string[]): string => {
  const parsed = colors
    .map(parseHex)
    .filter((rgb): rgb is [number, number, number] => rgb !== null);
  if (parsed.length === 0) return colors[0] ?? "#888888";

  const total = parsed.reduce(
    (sum, rgb) => [sum[0] + rgb[0], sum[1] + rgb[1], sum[2] + rgb[2]],
    [0, 0, 0],
  );
  const average = total.map((channel) => Math.round(channel / parsed.length));
  return `#${average
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
};

// ── The distance field ─────────────────────────────────────────────────────

/**
 * Distance from a point to a bone. The inner loop of everything here — it runs
 * once per bone per grid sample, on every frame of a drag, so it is written
 * with an explicit square root rather than `Math.hypot`, which carries
 * overflow handling this does not need and cannot afford.
 */
const pointBoneDistance = (px: number, py: number, bone: Bone): number => {
  const dx = bone.bx - bone.ax;
  const dy = bone.by - bone.ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    const ox = px - bone.ax;
    const oy = py - bone.ay;
    return Math.sqrt(ox * ox + oy * oy);
  }
  const t = Math.min(
    1,
    Math.max(0, ((px - bone.ax) * dx + (py - bone.ay) * dy) / lengthSquared),
  );
  const ox = px - (bone.ax + t * dx);
  const oy = py - (bone.ay + t * dy);
  return Math.sqrt(ox * ox + oy * oy);
};

/**
 * A minimum that rounds off where its two arguments cross.
 *
 * `Math.min` of two distances is their union, and a union of two rounded shapes
 * meeting at an angle has a crease on the inside of the bend. This blends the
 * two over a band [BLEND] wide instead, which is exactly the fillet that crease
 * was missing.
 */
const smoothMin = (a: number, b: number, k: number): number => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

/** How far outside the field a point lies: negative inside, zero on the edge. */
const fieldDistance = (
  px: number,
  py: number,
  bones: Bone[],
  reach: number,
): number => {
  let distance = pointBoneDistance(px, py, bones[0]);
  for (let i = 1; i < bones.length; i += 1) {
    distance = smoothMin(distance, pointBoneDistance(px, py, bones[i]), BLEND);
  }
  return distance - reach;
};

// ── Tracing the contour ────────────────────────────────────────────────────

/**
 * Marching squares over the field, returning closed loops of points.
 *
 * The grid is walked once, each cell contributing the piece of boundary passing
 * through it, and the pieces are stitched end to end into loops. Both saddle
 * cases are settled by sampling the cell's middle, which is what stops two
 * lobes that merely pass close from being joined into one.
 *
 * **Crossings are owned by the edge, not by the cell.** Every interior edge is
 * shared by two cells, and each cell would interpolate it from its own two
 * corners in its own direction — arithmetic that is equal on paper and not
 * always equal in floating point. Two cells then disagree about where their
 * shared point is by a few bits, the stitch fails to join them, and one
 * boundary comes back as two open runs. So each edge is crossed once, up front,
 * and both its cells refer to that one crossing by index. The stitch compares
 * integers and cannot drift.
 */
const traceField = (
  bones: Bone[],
  reach: number,
  box: { x: number; y: number; width: number; height: number },
): Point[][] => {
  const columns = Math.ceil(box.width / TRACE_STEP) + 1;
  const rows = Math.ceil(box.height / TRACE_STEP) + 1;
  if (columns < 2 || rows < 2) return [];

  const cornerX = (column: number) => box.x + column * TRACE_STEP;
  const cornerY = (row: number) => box.y + row * TRACE_STEP;

  // Sampled once per grid point rather than once per cell corner: every
  // interior point is a corner of four cells.
  const values = new Float64Array(columns * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      values[row * columns + column] = fieldDistance(
        cornerX(column),
        cornerY(row),
        bones,
        reach,
      );
    }
  }

  // Every edge that the boundary crosses, computed once and addressed by index.
  // Horizontal edges come first, then vertical; -1 means "not crossed".
  const acrossCount = (columns - 1) * rows;
  const downCount = columns * (rows - 1);
  const points: (Point | null)[] = new Array(acrossCount + downCount).fill(
    null,
  );

  /** The edge running right from grid point (column, row). */
  const acrossId = (column: number, row: number) =>
    row * (columns - 1) + column;
  /** The edge running down from grid point (column, row). */
  const downId = (column: number, row: number) =>
    acrossCount + row * columns + column;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const a = values[row * columns + column];
      const b = values[row * columns + column + 1];
      if (a < 0 === b < 0) continue;
      const t = a / (a - b);
      points[acrossId(column, row)] = {
        x: cornerX(column) + TRACE_STEP * t,
        y: cornerY(row),
      };
    }
  }
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = values[row * columns + column];
      const b = values[(row + 1) * columns + column];
      if (a < 0 === b < 0) continue;
      const t = a / (a - b);
      points[downId(column, row)] = {
        x: cornerX(column),
        y: cornerY(row) + TRACE_STEP * t,
      };
    }
  }

  /** Which crossing each crossing runs on to. -1 is "nothing leaves here". */
  const next = new Int32Array(points.length).fill(-1);

  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const a = values[row * columns + column];
      const b = values[row * columns + column + 1];
      const c = values[(row + 1) * columns + column + 1];
      const d = values[(row + 1) * columns + column];

      const index =
        (a < 0 ? 8 : 0) | (b < 0 ? 4 : 0) | (c < 0 ? 2 : 0) | (d < 0 ? 1 : 0);
      if (index === 0 || index === 15) continue;

      const top = acrossId(column, row);
      const bottom = acrossId(column, row + 1);
      const left = downId(column, row);
      const right = downId(column + 1, row);

      const link = (from: number, to: number) => {
        // A crossing leaves in one direction only. Anything else would be a
        // grid the field crosses twice on one edge, which cannot happen.
        if (next[from] === -1) next[from] = to;
      };

      /** The middle, for the two cases where the corners alone cannot say
       *  whether the cell holds one lobe or two. */
      const middle = () =>
        fieldDistance(
          cornerX(column) + TRACE_STEP / 2,
          cornerY(row) + TRACE_STEP / 2,
          bones,
          reach,
        );

      switch (index) {
        case 1:
          link(bottom, left);
          break;
        case 2:
          link(right, bottom);
          break;
        case 3:
          link(right, left);
          break;
        case 4:
          link(top, right);
          break;
        case 5:
          if (middle() < 0) {
            link(top, left);
            link(bottom, right);
          } else {
            link(top, right);
            link(bottom, left);
          }
          break;
        case 6:
          link(top, bottom);
          break;
        case 7:
          link(top, left);
          break;
        case 8:
          link(left, top);
          break;
        case 9:
          link(bottom, top);
          break;
        case 10:
          if (middle() < 0) {
            link(left, bottom);
            link(right, top);
          } else {
            link(left, top);
            link(right, bottom);
          }
          break;
        case 11:
          link(right, top);
          break;
        case 12:
          link(left, right);
          break;
        case 13:
          link(bottom, right);
          break;
        case 14:
          link(left, bottom);
          break;
        default:
          break;
      }
    }
  }

  // Stitch: follow each crossing on to the next until the walk comes back on
  // itself.
  const loops: Point[][] = [];
  const walked = new Uint8Array(points.length);

  for (let id = 0; id < next.length; id += 1) {
    if (next[id] === -1 || walked[id]) continue;

    const loop: Point[] = [];
    let current = id;
    while (current !== -1 && !walked[current]) {
      walked[current] = 1;
      const point = points[current];
      if (point) loop.push(point);
      current = next[current];
    }

    // Three points is the least that encloses anything. Anything shorter is a
    // stray corner where the field grazed the edge of the grid.
    if (loop.length >= 3) loops.push(loop);
  }

  return loops;
};

/** Drops traced points that sit almost on top of each other. */
const thin = (loop: Point[]): Point[] => {
  const kept: Point[] = [loop[0]];
  for (const point of loop) {
    const last = kept[kept.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) >= TRACE_MIN_SPACING) {
      kept.push(point);
    }
  }
  // The last point may have crept back up against the first, which would put a
  // kink in the closing curve.
  const last = kept[kept.length - 1];
  if (
    kept.length > 3 &&
    Math.hypot(last.x - kept[0].x, last.y - kept[0].y) < TRACE_MIN_SPACING
  ) {
    kept.pop();
  }
  return kept;
};

/**
 * A closed path curving through the traced points.
 *
 * Catmull-Rom, written out as cubic Béziers: the curve passes through every
 * point rather than being pulled off them, which matters because those points
 * *are* the boundary. It also takes the last of the grid back out of the
 * outline — what the trace leaves as a run of short straight steps returns as
 * one continuous curve.
 */
const curvedPath = (loop: Point[]): string => {
  const count = loop.length;
  if (count < 3) return "";

  const at = (index: number) => loop[((index % count) + count) % count];
  const parts = [`M ${at(0).x.toFixed(1)} ${at(0).y.toFixed(1)}`];

  for (let i = 0; i < count; i += 1) {
    const previous = at(i - 1);
    const current = at(i);
    const following = at(i + 1);
    const after = at(i + 2);

    const c1x = current.x + (following.x - previous.x) / 6;
    const c1y = current.y + (following.y - previous.y) / 6;
    const c2x = following.x - (after.x - current.x) / 6;
    const c2y = following.y - (after.y - current.y) / 6;

    parts.push(
      `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${following.x.toFixed(1)} ${following.y.toFixed(1)}`,
    );
  }

  parts.push("Z");
  return parts.join(" ");
};

// ── The skeleton ───────────────────────────────────────────────────────────

/**
 * The members' minimum spanning tree, by Euclidean distance (Prim's).
 *
 * The tree, rather than every pair: joining all pairs would fill the middle of
 * a large group with a solid slab and swallow whoever is standing in it. The
 * tree is the least ink that still reaches everybody.
 */
const spanningEdges = (members: MeshNode[]): [MeshNode, MeshNode][] => {
  if (members.length < 2) return [];
  const reached = [members[0]];
  const remaining = members.slice(1);
  const edges: [MeshNode, MeshNode][] = [];

  while (remaining.length > 0) {
    let bestFrom = 0;
    let bestTo = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    reached.forEach((from, fromIndex) => {
      remaining.forEach((to, toIndex) => {
        const distance = Math.hypot(to.x - from.x, to.y - from.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestFrom = fromIndex;
          bestTo = toIndex;
        }
      });
    });
    const [joined] = remaining.splice(bestTo, 1);
    edges.push([reached[bestFrom], joined]);
    reached.push(joined);
  }

  return edges;
};

/** Distance between two bones. Zero when they cross. */
const boneDistance = (a: Bone, b: Bone): number => {
  const d1x = a.bx - a.ax;
  const d1y = a.by - a.ay;
  const d2x = b.bx - b.ax;
  const d2y = b.by - b.ay;
  const denominator = d1x * d2y - d1y * d2x;

  // Not parallel: if the crossing lands inside both bones the distance is 0.
  if (Math.abs(denominator) > 1e-9) {
    const t = ((b.ax - a.ax) * d2y - (b.ay - a.ay) * d2x) / denominator;
    const u = ((b.ax - a.ax) * d1y - (b.ay - a.ay) * d1x) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0;
  }

  // Otherwise the closest approach is at an endpoint of one of the two.
  return Math.min(
    pointBoneDistance(a.ax, a.ay, b),
    pointBoneDistance(a.bx, a.by, b),
    pointBoneDistance(b.ax, b.ay, a),
    pointBoneDistance(b.bx, b.by, a),
  );
};

/**
 * Whether two fields cross anywhere.
 *
 * Measured between the skeletons rather than the outlines: two traced curves
 * would have to be intersected, while two skeletons are a handful of segment
 * distances. The blend is allowed for because it pushes each boundary out past
 * its own reach wherever bones meet.
 */
const fieldsOverlap = (a: ClusterField, b: ClusterField): boolean => {
  const limit = a.reach + b.reach + BLEND * 0.5;
  return a.bones.some((boneA) =>
    b.bones.some((boneB) => boneDistance(boneA, boneB) < limit),
  );
};

// ── Building the fields ────────────────────────────────────────────────────

/** Group membership keyed the way the mesh keys its nodes: by character id. */
export const groupsByMember = (
  groups: CodexGroup[],
): Map<string, CodexGroup[]> => {
  const map = new Map<string, CodexGroup[]>();
  for (const group of groups) {
    for (const member of group.members) {
      const list = map.get(member.id);
      if (list) list.push(group);
      else map.set(member.id, [group]);
    }
  }
  return map;
};

export const buildClusterFields = (
  nodes: MeshNode[],
  groups: CodexGroup[],
): ClusterField[] => {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return groups.flatMap((group) => {
    if (!group.id) return [];
    const members = group.members
      .map((member) => byId.get(member.id))
      .filter((node): node is MeshNode => node !== undefined);
    if (members.length === 0) return [];

    // One reach for the whole field, taken from its largest member. Measuring
    // from each member's own disc would step the boundary in and out at every
    // one of them; a single reach makes it one offset of the skeleton.
    const reach =
      members.reduce((widest, node) => Math.max(widest, node.radius), 0) +
      FIELD_PAD;

    const bones: Bone[] = members.map((node) => ({
      ax: node.x,
      ay: node.y,
      bx: node.x,
      by: node.y,
    }));
    for (const [from, to] of spanningEdges(members)) {
      bones.push({ ax: from.x, ay: from.y, bx: to.x, by: to.y });
    }

    // The grid has to close around the field, so it is padded past the reach by
    // the blend (which pushes the boundary out at junctions) and a couple of
    // cells, so the outermost samples are safely outside.
    const margin = reach + BLEND + TRACE_STEP * 2;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const bone of bones) {
      minX = Math.min(minX, bone.ax, bone.bx);
      minY = Math.min(minY, bone.ay, bone.by);
      maxX = Math.max(maxX, bone.ax, bone.bx);
      maxY = Math.max(maxY, bone.ay, bone.by);
    }
    const box = {
      height: maxY - minY + margin * 2,
      width: maxX - minX + margin * 2,
      x: minX - margin,
      y: minY - margin,
    };

    const path = traceField(bones, reach, box)
      .map((loop) => curvedPath(thin(loop)))
      .filter(Boolean)
      .join(" ");
    if (!path) return [];

    const top = members.reduce((best, node) =>
      node.y - node.radius < best.y - best.radius ? node : best,
    );

    return [
      {
        bones,
        box,
        color: group.color,
        hatchAngle: HATCH_ANGLES[group.ordinal % HATCH_ANGLES.length],
        key: group.id,
        labelX: members.reduce((sum, node) => sum + node.x, 0) / members.length,
        labelY: top.y - reach - 10,
        memberIds: members.map((node) => node.id),
        name: group.name,
        path,
        reach,
      },
    ];
  });
};

/**
 * Every region to paint, in paint order: each field, then each crossing pair,
 * then each three-way.
 *
 * Later regions are painted over earlier ones and cover them exactly, so a
 * point on the board ends up carrying one colour — the blend of precisely the
 * groups it belongs to. Stopping at three is a legibility limit, not a
 * technical one: a four-way blend is a grey, and a grey says nothing.
 */
export const buildClusterRegions = (
  fields: ClusterField[],
): ClusterRegion[] => {
  const regions: ClusterRegion[] = fields.map((field) => ({
    clippedBy: [],
    color: field.color,
    field,
    key: field.key,
    names: [field.name],
  }));

  /** Which pairs actually cross, so the three-way pass only considers those. */
  const crossing: [number, number][] = [];

  for (let i = 0; i < fields.length; i += 1) {
    for (let j = i + 1; j < fields.length; j += 1) {
      if (!fieldsOverlap(fields[i], fields[j])) continue;
      crossing.push([i, j]);
      regions.push({
        clippedBy: [fields[j]],
        color: mixColors([fields[i].color, fields[j].color]),
        field: fields[i],
        key: `${fields[i].key}+${fields[j].key}`,
        names: [fields[i].name, fields[j].name],
      });
    }
  }

  const crosses = new Set(crossing.map(([i, j]) => `${i}:${j}`));
  for (const [i, j] of crossing) {
    for (let k = j + 1; k < fields.length; k += 1) {
      // A three-way region only exists where all three pairs already cross.
      if (!crosses.has(`${i}:${k}`) || !crosses.has(`${j}:${k}`)) continue;
      regions.push({
        clippedBy: [fields[j], fields[k]],
        color: mixColors([fields[i].color, fields[j].color, fields[k].color]),
        field: fields[i],
        key: `${fields[i].key}+${fields[j].key}+${fields[k].key}`,
        names: [fields[i].name, fields[j].name, fields[k].name],
      });
    }
  }

  return regions;
};

/** The groups a character is in, for the panels that list them by name. */
export const groupsOf = (
  person: Pick<StoryPerson, "id">,
  groups: CodexGroup[],
): CodexGroup[] =>
  groups.filter((group) =>
    group.members.some((member) => member.id === person.id),
  );
