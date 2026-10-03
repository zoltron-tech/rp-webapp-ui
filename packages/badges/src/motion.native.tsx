import {
  type MotionRhythm,
  type MotionTable,
  pingPong,
  registerMotion,
  stops,
  sweep,
} from "@nw/animations";

/**
 * How each badge crest's moving parts move, on a phone.
 *
 * The crests mark those parts with `className="nwb-…"`; the web matches the
 * names with keyframes, and `react-native-svg` has no stylesheet at all. The
 * clock, the curves and the wrapper that reads this table all live in
 * `@nw/animations` — two scenes wanted the same machinery, so it moved there
 * and this file is only the badge half of the answer.
 *
 * Periods, delays and values are web's, taken from its keyframes rather than
 * re-tuned: two clients whose badges breathe at different rates is the drift
 * the shared artwork exists to prevent.
 *
 * See `@nw/animations`'s `motion-kit.native` for what a view-box origin buys
 * and which of web's classes cannot be ported at all.
 */

/** The crest's own centre, which is what every ring turns about. */
const CENTRE = { originX: 60, originY: 60 };

/**
 * Class name to rhythm.
 *
 * Periods, delays and values are web's, taken from its keyframes rather than
 * re-tuned — two clients whose badges breathe at different rates is the drift
 * the shared artwork exists to prevent.
 */
const MOTION: MotionTable = {
  /* The tonearm tracking in across the side, and lifting back to the edge. */
  "nwb-arm": {
    build: (clock) => ({
      originX: 108,
      originY: 18,
      rotation: stops(clock, [0, 0.7, 0.86, 1], [-1.6, 4.2, -1.6, -1.6]),
    }),
    delay: 0,
    period: 12,
  },
  /* The glow behind the plate, breathing. On all twelve crests. */
  "nwb-aura": {
    build: (clock) => ({
      ...CENTRE,
      opacity: pingPong(clock, 0.55, 1),
      scale: pingPong(clock, 0.94, 1.06),
    }),
    delay: 0,
    period: 3.4,
  },

  /* The wreath's two halves, about the knot that ties them. */
  "nwb-branch-l": {
    build: (clock) => ({
      originX: 60,
      originY: 99,
      rotation: pingPong(clock, -2.4, 2.4),
    }),
    delay: 3.2,
    period: 6.4,
  },
  "nwb-branch-r": {
    build: (clock) => ({
      originX: 60,
      originY: 99,
      rotation: pingPong(clock, -2.4, 2.4),
    }),
    delay: 0,
    period: 6.4,
  },

  /* The speech bubble, breathing. */
  "nwb-bubble": {
    build: (clock) => ({ ...CENTRE, scale: pingPong(clock, 1, 1.028) }),
    delay: 0,
    period: 4.4,
  },

  /* Cloud drift, at two speeds so the sky has depth. */
  "nwb-cloud-1": {
    build: (clock) => ({ x: pingPong(clock, -12, 12) }),
    delay: 0,
    period: 9,
  },
  "nwb-cloud-2": {
    build: (clock) => ({ x: pingPong(clock, -12, 12) }),
    delay: 4,
    period: 13,
  },

  /* A record turning. */
  "nwb-disc": {
    build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, 360) }),
    delay: 0,
    period: 4.2,
  },

  /* The emblem drifting, so the crest reads as floating rather than pasted on. */
  "nwb-emblem": {
    build: (clock) => ({ y: pingPong(clock, 0, -2.2) }),
    delay: 0,
    period: 3.8,
  },

  /* A far-off bird crossing the whole sky and starting over. */
  "nwb-farbird": {
    build: (clock) => ({
      opacity: stops(clock, [0, 0.1, 0.78, 0.9, 1], [0, 1, 1, 0, 0]),
      x: stops(clock, [0, 0.9, 1], [0, 104, 104]),
      y: stops(clock, [0, 0.9, 1], [6, -14, -14]),
    }),
    delay: 0,
    period: 11,
  },

  /* The near bird crossing its sky: it climbs, banks, and falls back. */
  "nwb-glide": {
    build: (clock) => ({
      rotation: pingPong(clock, -5, 5),
      x: pingPong(clock, -9, 9),
      y: pingPong(clock, 5, -7),
    }),
    delay: 0,
    period: 5,
  },

  /* The crescent of light travelling across a pressed seal. */
  "nwb-gloss": {
    build: (clock) => ({
      opacity: pingPong(clock, 0.45, 1),
      x: pingPong(clock, -5, 6),
      y: pingPong(clock, 2, -2),
    }),
    delay: 0,
    period: 4.8,
  },

  /* Sparks circling the other way, so the two rings never look locked. */
  "nwb-orbit": {
    build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, -360) }),
    delay: 0,
    period: 11,
  },

  /* Cassette hubs, each about its own spindle. */
  "nwb-reel-l": {
    build: (clock) => ({
      originX: 45,
      originY: 71,
      rotation: sweep(clock, 0, 360),
    }),
    delay: 0,
    period: 6,
  },
  "nwb-reel-r": {
    build: (clock) => ({
      originX: 75,
      originY: 71,
      rotation: sweep(clock, 0, 360),
    }),
    delay: 0,
    period: 4.2,
  },

  /* The wax breathing, so the seal is never completely still. */
  "nwb-seal": {
    build: (clock) => ({
      ...CENTRE,
      rotation: pingPong(clock, -1.2, 1.2),
      scale: pingPong(clock, 1, 1.035),
    }),
    delay: 0,
    period: 6,
  },

  /* A light sweep across the plate. Held off-screen for the rest of the lap. */
  "nwb-sheen": {
    build: (clock) => ({
      x: stops(clock, [0, 0.55, 1], [-130, 130, 130]),
    }),
    delay: 0,
    period: 5.2,
  },

  /* Each mark answering the pulse as it arrives. */
  "nwb-tile-a": {
    build: (clock) => ({ scale: pingPong(clock, 1, 1.06) }),
    delay: 0,
    period: 2.6,
  },
  "nwb-tile-b": {
    build: (clock) => ({ scale: pingPong(clock, 1, 1.06) }),
    delay: 1.3,
    period: 2.6,
  },

  /* The ward ring turning around the crest. */
  "nwb-ward": {
    build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, 360) }),
    delay: 0,
    period: 18,
  },
};

/** Sound coming off the record: each arc swells outward and thins away. */
for (const [index, name] of [
  "nwb-wave-1",
  "nwb-wave-2",
  "nwb-wave-3",
].entries()) {
  MOTION[name] = {
    build: (clock) => ({
      ...CENTRE,
      opacity: stops(clock, [0, 0.25, 1], [0, 0.8, 0]),
      scale: sweep(clock, 0.86, 1.3),
    }),
    delay: index * 0.8,
    period: 2.4,
  };
}

/** Staggered twinkle, so a constellation never blinks in unison. */
const twinkle = (period: number, delay: number): MotionRhythm => ({
  build: (clock) => ({ opacity: pingPong(clock, 0.25, 1) }),
  delay,
  period,
});

for (const index of [1, 2, 3, 4]) {
  MOTION[`nwb-star-${index}`] = twinkle(3.1, (index - 1) * 0.7);
}
for (const index of [1, 2, 3]) {
  MOTION[`nwb-spark-${index}`] = twinkle(2.4, (index - 1) * 0.8);
}

/** The chatter dots, bouncing the way a typing indicator does. */
for (const index of [1, 2, 3]) {
  MOTION[`nwb-chatter-${index}`] = {
    build: (clock) => ({
      y: stops(clock, [0, 0.3, 0.6, 1], [0, -5, 0, 0]),
    }),
    delay: (index - 1) * 0.18,
    period: 1.4,
  };
}

/** Teaches the shared table about every class the crests use. */
export const registerBadgeMotion = (): void => registerMotion(MOTION);
