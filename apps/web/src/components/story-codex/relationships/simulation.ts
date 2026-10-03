import type { MeshNode } from "./layout";
import { nodeRadius } from "./layout";

/**
 * The mesh's live force simulation.
 *
 * A one-shot layout can only ever hand back a still picture, and a still
 * picture of a graph is the thing that ends up looking like a ring: crank the
 * repulsion hard enough to separate everyone and the cast spreads into an even
 * disc, which is the very shape the ring was replaced to escape.
 *
 * So the mesh is not laid out, it is *simulated*. Relationships are springs
 * with a rest length, characters carry a mild charge, and everything has
 * velocity and friction. Left alone it settles — tightly-tied groups pull into
 * knots, weakly-tied ones hang off them, and the outline that results is
 * lopsided because the story is. Grab a character and it keeps running: the
 * one under the pointer follows exactly, and everyone tied to them eases along
 * behind, which is what makes a drag feel like moving something real rather
 * than dropping a pin on a map.
 *
 * **Still deterministic.** No randomness anywhere: the seed is a golden-angle
 * spiral off the cast's own order, symmetry is broken with a fixed hash of the
 * index, and the settle runs a fixed schedule. The same cast opens to the same
 * shape every time.
 */

export interface SimLink {
  id: string | null;
  fromId: string;
  toId: string;
  /** 1–3. A defining relationship sits its two characters closer together. */
  strength: number;
}

export interface SimNode extends MeshNode {
  vx: number;
  vy: number;
  /** Pinned position while the character is under the pointer; null when the
   *  simulation is free to move them. */
  fx: number | null;
  fy: number | null;
}

/** Friction. Lower settles faster and overshoots less. */
const VELOCITY_DECAY = 0.6;
/** How fast the simulation cools toward its target temperature. */
const ALPHA_DECAY = 0.026;
/** Below this the shape has stopped moving to the eye, so the loop stops. */
export const ALPHA_MIN = 0.006;
/** Temperature held while a character is being dragged, so the neighbourhood
 *  keeps reacting for as long as the drag lasts. */
export const ALPHA_DRAG = 0.3;
/** Kick given when a drag ends, so the shape eases closed again. */
export const ALPHA_SETTLE = 0.22;

const LINK_STRENGTH = 0.55;
/** Pull toward the middle. Weak on purpose — strong centring is the other way
 *  a graph collapses into a disc. */
const GRAVITY = 0.045;
/** Gravity on a character tied to nobody: enough to keep them on the board,
 *  not enough to pretend they are part of the web. */
const ISOLATE_GRAVITY = 0.011;
/** Clear space between two discs. */
const COLLIDE_PAD = 14;
/** Room under a character for the name drawn below them. */
const LABEL_ROOM = 30;
const EDGE_PAD = 10;

/** Rest length multiplier by relationship strength: passing, real, defining. */
const STRENGTH_DISTANCE = [1.3, 1.0, 0.74];

/**
 * Pull toward the middle of a group a character belongs to.
 *
 * Without it, an affiliation is only a colour: its members stay wherever their
 * relationships put them and the field drawn around them sprawls across the
 * board, reaching past everyone standing in between. With it, a house gathers
 * — which is what a house *is*, and it is the layout, not the paint, that has
 * to say so. Deliberately weaker than a relationship spring: who these people
 * are to each other still decides the shape, and belonging only leans on it.
 */
const GROUP_COHESION = 0.055;

/**
 * A fixed, tiny offset per index.
 *
 * A perfectly symmetric arrangement can deadlock — opposing forces cancel and
 * nothing ever picks a side. This nudges each character off the symmetry
 * without reaching for a random number, which would redraw the mesh
 * differently on every load.
 */
const jitter = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** A group of characters that should settle near each other. */
export interface SimGroup {
  id: string;
  memberIds: string[];
}

export interface SimulationOptions {
  cast: { id: string; name: string; image: string | null }[];
  links: SimLink[];
  /** Houses, clans, affiliations — they gather rather than merely being
   *  painted. See [GROUP_COHESION]. */
  groups?: SimGroup[];
  width: number;
  height: number;
}

export interface Simulation {
  nodes: SimNode[];
  /** Current temperature; the render loop runs while this is above ALPHA_MIN. */
  alpha: number;
  /** Advance one frame. */
  tick: () => void;
  /** Warm the simulation back up. */
  reheat: (target: number, alpha?: number) => void;
  /** Hold a character at a point (a drag), or let go with `null`. */
  hold: (id: string, x: number | null, y: number | null) => void;
  /** Run the settle schedule to completion, off-screen. */
  settle: () => void;
}

export const createSimulation = ({
  cast,
  links,
  groups = [],
  width,
  height,
}: SimulationOptions): Simulation => {
  const count = cast.length;

  const degree = new Map<string, number>();
  for (const link of links) {
    degree.set(link.fromId, (degree.get(link.fromId) ?? 0) + 1);
    degree.set(link.toId, (degree.get(link.toId) ?? 0) + 1);
  }

  // Rest length and charge are derived from the frame, so the shape settles at
  // roughly the size of the board it is drawn on and never has to be scaled
  // afterwards — a post-hoc scale would put the springs out of step with the
  // picture the moment anything was dragged.
  const area = width * height;
  const linkDistance = clamp(
    Math.sqrt(area / Math.max(3, count)) * 0.62,
    96,
    210,
  );
  const charge = -(linkDistance * 11);

  const centreX = width / 2;
  const centreY = height / 2;

  // Seed on a golden-angle spiral: it spreads the cast evenly at any size and,
  // unlike a ring, does not start every character the same distance from the
  // middle — so the springs have somewhere to pull from on the first tick.
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const seedRadius = Math.min(width, height) * 0.36;

  const nodes: SimNode[] = cast.map((member, index) => {
    const angle = index * GOLDEN_ANGLE;
    const radius = seedRadius * Math.sqrt((index + 0.5) / Math.max(1, count));
    return {
      degree: degree.get(member.id) ?? 0,
      fx: null,
      fy: null,
      id: member.id,
      image: member.image,
      name: member.name,
      radius: nodeRadius(degree.get(member.id) ?? 0),
      vx: 0,
      vy: 0,
      x: centreX + Math.cos(angle) * radius + jitter(index, 1) * 8,
      y: centreY + Math.sin(angle) * radius + jitter(index, 2) * 8,
    };
  });

  const indexById = new Map(nodes.map((node, index) => [node.id, index]));

  /** Links as index pairs, with the spring each one pulls at. */
  const springs = links
    .map((link) => {
      const from = indexById.get(link.fromId);
      const to = indexById.get(link.toId);
      if (from === undefined || to === undefined || from === to) return null;
      const step =
        STRENGTH_DISTANCE[clamp(Math.round(link.strength) - 1, 0, 2)];
      const rest = linkDistance * step + nodes[from].radius + nodes[to].radius;
      // d3's bias: a hub is heavy, so a spring moves the leaf on its end far
      // more than it moves the hub. Without it every tie drags the hub about
      // and the knots never form.
      const total = nodes[from].degree + nodes[to].degree || 2;
      return {
        biasFrom: nodes[from].degree / total,
        from,
        rest,
        to,
      };
    })
    .filter((spring): spring is NonNullable<typeof spring> => spring !== null);

  /** Groups as index lists, so the cohesion pass never looks anything up. */
  const flocks = groups
    .map((group) =>
      group.memberIds
        .map((id) => indexById.get(id))
        .filter((index): index is number => index !== undefined),
    )
    .filter((members) => members.length > 1);

  const state = { alpha: 1, alphaTarget: 0 };

  const tick = () => {
    state.alpha += (state.alphaTarget - state.alpha) * ALPHA_DECAY;
    const alpha = state.alpha;

    // Every character carries a like charge, so nobody sits on anybody.
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

    // Relationships are springs with a rest length, not rigid rods — which is
    // why a well-connected group ends up as a knot and a loose one as a limb.
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

    // Groups gather. Each member is pulled toward the middle of their own
    // group, which is what turns an affiliation into a place on the board
    // rather than a colour sprayed over one. A character in two groups is
    // pulled toward both and settles between them — which is exactly where the
    // mesh then paints the blend of their two colours.
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

    // Gravity holds the web together in the middle of the board. A character
    // with no relationships at all gets a quarter of it: they are not part of
    // the web and should not be hauled into the middle of it, so repulsion
    // carries them out to drift loose around the edge — which is exactly what
    // being in the cast but tied to nobody looks like.
    for (const node of nodes) {
      const pull = (node.degree === 0 ? ISOLATE_GRAVITY : GRAVITY) * alpha;
      node.vx += (centreX - node.x) * pull;
      node.vy += (centreY - node.y) * pull;
    }

    // Integrate.
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

    // Hard constraints last, so neither can be undone by a force this frame:
    // discs never overlap, and nobody leaves the board.
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
          // A held character does not give ground — the pointer is the
          // authority while a drag is happening.
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
      const left = node.radius + EDGE_PAD;
      const top = node.radius + EDGE_PAD;
      const right = width - node.radius - EDGE_PAD;
      const bottom = height - node.radius - LABEL_ROOM;
      const x = clamp(node.x, left, right);
      const y = clamp(node.y, top, bottom);
      // Kill the velocity that drove them into the wall, or they buzz there.
      if (x !== node.x) node.vx = 0;
      if (y !== node.y) node.vy = 0;
      node.x = x;
      node.y = y;
    }
  };

  const settle = () => {
    state.alpha = 1;
    state.alphaTarget = 0;
    // A fixed schedule rather than "until it stops", so the opening shape is
    // reproducible to the pixel.
    const steps = count > 30 ? 220 : 300;
    for (let step = 0; step < steps; step += 1) tick();
    state.alpha = 0;
  };

  return {
    get alpha() {
      return state.alpha;
    },
    hold: (id, x, y) => {
      const node = nodes[indexById.get(id) ?? -1];
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
