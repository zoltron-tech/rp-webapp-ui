import {
  type MotionClock,
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

/*
 * The newer crests. Each rhythm is web's keyframes for the same class, read
 * off as fractions of the lap; `at` takes them as written. What cannot be
 * ported is left still on the phone: a dash pattern marching along a path
 * (the chart's route, the hourglass grains, the lap of a thread) has no `G`
 * prop to drive, and a skew is not one of the props a group builds its matrix
 * from.
 *
 * Where a lap does not start on the pose the crest is drawn in — the arrow
 * starts out of sight, the hourglass half run — the rhythm carries a `rest`,
 * so a crest held still shows the drawing rather than the lap's first frame.
 * `DRAWN` is "the drawing as it is"; `HIDDEN` is a part that only exists
 * while it moves, which web hides with its stylesheet.
 */

/** Fractions and values side by side, so a rhythm reads like its keyframes. */
const at = (clock: MotionClock, points: [number, number][]) =>
  stops(
    clock,
    points.map(([t]) => t),
    points.map(([, v]) => v),
  );

const DRAWN = {};
const HIDDEN = { opacity: 0 };

/* Worldbuilder: pins dropping onto the chart, the needle settling, swells. */
for (const [index, start] of [0.04, 0.2, 0.36].entries()) {
  MOTION[`nwb-pin-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [start, 0],
        [start + 0.06, 1],
        [0.84, 1],
        [0.92, 0],
        [1, 0],
      ]),
      y: at(clock, [
        [0, -8],
        [start, -8],
        [start + 0.06, 0.6],
        [start + 0.09, 0],
        [0.84, 0],
        [0.92, -3],
        [1, -3],
      ]),
    }),
    delay: 0,
    period: 6,
    rest: DRAWN,
  };
}
MOTION["nwb-needle"] = {
  build: (clock) => ({
    originX: 88,
    originY: 84,
    rotation: at(clock, [
      [0, 0],
      [0.14, -22],
      [0.3, 14],
      [0.44, -7],
      [0.56, 3],
      [0.66, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 5,
};
for (const [index, delay] of [0, 2].entries()) {
  MOTION[`nwb-tide-${index + 1}`] = {
    build: (clock) => ({
      opacity: pingPong(clock, 0.55, 1),
      x: pingPong(clock, -1.5, 1.5),
    }),
    delay,
    period: 4,
  };
}

/* Chronicler: the last volume shelved, the ribbon marker swinging. */
MOTION["nwb-arrival"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.08, 0],
      [0.2, 1],
      [0.86, 1],
      [0.94, 0],
      [1, 0],
    ]),
    originX: 88.5,
    originY: 88,
    rotation: at(clock, [
      [0, 6],
      [0.26, 6],
      [0.34, -1.5],
      [0.39, 0.6],
      [0.43, 0],
      [0.86, 0],
      [0.94, 6],
      [1, 6],
    ]),
    y: at(clock, [
      [0, -18],
      [0.08, -18],
      [0.2, 0],
      [0.23, -1],
      [0.26, 0],
      [0.86, 0],
      [0.94, -18],
      [1, -18],
    ]),
  }),
  delay: 0,
  period: 7,
  rest: DRAWN,
};
MOTION["nwb-marker"] = {
  build: (clock) => ({
    originX: 46.5,
    originY: 86,
    rotation: pingPong(clock, -7, 7),
  }),
  delay: 0,
  period: 3.6,
};

/* Timekeeper: the run of sand and the flip, the dial and the rune circle. */
MOTION["nwb-flip"] = {
  build: (clock) => ({
    ...CENTRE,
    rotation: at(clock, [
      [0, 0],
      [0.82, 0],
      [0.96, 180],
      [1, 180],
    ]),
  }),
  delay: 0,
  period: 8,
};
MOTION["nwb-sand-top"] = {
  build: (clock) => ({
    y: at(clock, [
      [0, -15],
      [0.8, 16],
      [1, 16],
    ]),
  }),
  delay: 0,
  period: 8,
  rest: DRAWN,
};
MOTION["nwb-sand-bottom"] = {
  build: (clock) => ({
    y: at(clock, [
      [0, 23],
      [0.8, -16],
      [1, -16],
    ]),
  }),
  delay: 0,
  period: 8,
  rest: DRAWN,
};
MOTION["nwb-stream"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.04, 1],
      [0.78, 1],
      [0.8, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 8,
  rest: DRAWN,
};
MOTION["nwb-dial"] = {
  build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, 360) }),
  delay: 0,
  period: 60,
};
MOTION["nwb-sigil"] = {
  build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, -360) }),
  delay: 0,
  period: 36,
};
/* Sparks rising and gone. Positional only: each crest puts them somewhere
   different, and a scale needs a fixed origin. */
for (const [index, delay] of [0, 0.45, 0.95, 1.5].entries()) {
  MOTION[`nwb-mote-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.3, 1],
        [1, 0],
      ]),
      y: sweep(clock, 5, -11),
    }),
    delay,
    period: 2.2,
    rest: HIDDEN,
  };
}

/* Matchmaker: the arrow flying in, the hearts thumping, the burst. */
MOTION["nwb-arrow"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.08, 1],
      [0.84, 1],
      [0.94, 0],
      [1, 0],
    ]),
    x: at(clock, [
      [0, -40],
      [0.18, 1.5],
      [0.2, 0],
      [1, 0],
    ]),
    y: at(clock, [
      [0, 0],
      [0.2, 0],
      [0.23, -0.9],
      [0.26, 0.7],
      [0.29, -0.35],
      [0.32, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 5,
  rest: DRAWN,
};
for (const [name, start] of [
  ["nwb-heart-front", 0.18],
  ["nwb-heart-back", 0.21],
] as const) {
  MOTION[name] = {
    build: (clock) => ({
      originX: 0,
      originY: 0,
      scale: at(clock, [
        [0, 1],
        [start, 1],
        [start + 0.04, 1.14],
        [start + 0.1, 0.96],
        [start + 0.16, 1.05],
        [start + 0.24, 1],
        [1, 1],
      ]),
    }),
    delay: 0,
    period: 5,
  };
}
MOTION["nwb-burst"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.19, 0],
      [0.23, 1],
      [0.42, 0],
      [1, 0],
    ]),
    originX: 74,
    originY: 52,
    scale: at(clock, [
      [0, 0.5],
      [0.19, 0.5],
      [0.23, 0.9],
      [0.42, 1.35],
      [1, 1.35],
    ]),
  }),
  delay: 0,
  period: 5,
  rest: HIDDEN,
};

/* Shapeshifter: the three forms crossfading, the shimmer, the opal. */
MOTION["nwb-form-1"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 1],
      [0.3, 1],
      [0.36, 0],
      [0.94, 0],
      [1, 1],
    ]),
  }),
  delay: 0,
  period: 9,
};
MOTION["nwb-form-2"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.3, 0],
      [0.36, 1],
      [0.63, 1],
      [0.69, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 9,
  rest: HIDDEN,
};
MOTION["nwb-form-3"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0],
      [0.63, 0],
      [0.69, 1],
      [0.94, 1],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 9,
  rest: HIDDEN,
};
MOTION["nwb-shimmer"] = {
  build: (clock) => ({
    x: at(clock, [
      [0, 0],
      [0.86, 0],
      [1, 120],
    ]),
  }),
  delay: 0,
  period: 3,
};
MOTION["nwb-opal"] = {
  build: (clock) => ({
    originX: 60,
    originY: 47,
    rotation: sweep(clock, 0, 360),
  }),
  delay: 0,
  period: 14,
};

/*
 * Veteran Quill: the case lid and the quill. Both are drawn open, so the laps
 * run to the closed pose and back. The quill's web transform is a five-step
 * list; composed, it is one similarity — translate (15.6, 38.6), turn 62
 * degrees, scale 0.694 — which is exactly what a group's x, y, rotation and
 * scale about the origin express.
 */
const CASE_STOPS = [0, 0.24, 0.42, 0.78, 0.92, 1];
const caseLap = (clock: MotionClock, shut: number, open: number) =>
  stops(clock, CASE_STOPS, [shut, shut, open, open, shut, shut]);
MOTION["nwb-lid"] = {
  build: (clock) => ({
    originX: 60,
    originY: 58,
    scaleY: at(clock, [
      [0, -0.8],
      [0.12, -0.8],
      [0.28, 1],
      [0.84, 1],
      [0.98, -0.8],
      [1, -0.8],
    ]),
  }),
  delay: 0,
  period: 7,
  rest: DRAWN,
};
MOTION["nwb-quill-rise"] = {
  build: (clock) => ({
    originX: 0,
    originY: 0,
    rotation: caseLap(clock, 62, 0),
    scale: caseLap(clock, 0.694, 1),
    x: caseLap(clock, 15.6, 0),
    y: caseLap(clock, 38.6, 0),
  }),
  delay: 0,
  period: 7,
  rest: DRAWN,
};
MOTION["nwb-case-glow"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0.15],
      [0.12, 0.15],
      [0.32, 1],
      [0.84, 1],
      [0.98, 0.15],
      [1, 0.15],
    ]),
  }),
  delay: 0,
  period: 7,
  rest: DRAWN,
};

/* Ambassador: the fanfare. */
MOTION["nwb-trumpet"] = {
  build: (clock) => ({
    originX: 0,
    originY: 0,
    rotation: at(clock, [
      [0, 0],
      [0.04, -2.2],
      [0.1, 0.6],
      [0.16, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 4.8,
};
for (const index of [0, 1, 2]) {
  MOTION[`nwb-blast-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.06, 1],
        [0.4, 0],
        [1, 0],
      ]),
      originX: 84,
      originY: 0,
      scale: at(clock, [
        [0, 0.6],
        [0.4, 1.3],
        [1, 1.3],
      ]),
    }),
    delay: index * 0.25,
    period: 4.8,
    rest: HIDDEN,
  };
}
/** Where the five land: the bell's mouth plus the reach, on their bearing. */
const LANDING = { originX: 101, originY: 0 };
for (const index of [0, 1, 2, 3, 4]) {
  const delay = 0.15 + index * 0.18;
  MOTION[`nwb-herald-${index + 1}`] = {
    build: (clock) => ({
      ...LANDING,
      opacity: at(clock, [
        [0, 0],
        [0.08, 1],
        [0.76, 1],
        [0.9, 0],
        [1, 0],
      ]),
      scale: at(clock, [
        [0, 0.3],
        [0.28, 1],
        [0.76, 1],
        [0.9, 0.9],
        [1, 0.9],
      ]),
      x: at(clock, [
        [0, -17],
        [0.28, 0],
        [0.76, 0],
        [0.9, 1],
        [1, 1],
      ]),
    }),
    delay,
    period: 4.8,
    rest: DRAWN,
  };
  MOTION[`nwb-invite-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 1],
        [0.24, 1],
        [0.32, 0],
        [1, 0],
      ]),
    }),
    delay,
    period: 4.8,
    rest: HIDDEN,
  };
  MOTION[`nwb-joined-${index + 1}`] = {
    build: (clock) => ({
      ...LANDING,
      opacity: at(clock, [
        [0, 0],
        [0.24, 0],
        [0.32, 1],
        [1, 1],
      ]),
      scale: at(clock, [
        [0, 0.3],
        [0.24, 0.3],
        [0.32, 1.4],
        [0.38, 1],
        [1, 1],
      ]),
    }),
    delay,
    period: 4.8,
    rest: DRAWN,
  };
}
for (const index of [0, 1, 2, 3]) {
  MOTION[`nwb-confetti-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.04, 1],
        [0.32, 1],
        [0.44, 0],
        [1, 0],
      ]),
      originX: 89,
      originY: 0,
      rotation: at(clock, [
        [0, 0],
        [0.32, 300],
        [0.44, 420],
        [1, 420],
      ]),
      x: at(clock, [
        [0, 0],
        [0.32, 20],
        [0.44, 25],
        [1, 25],
      ]),
    }),
    delay: index * 0.07,
    period: 4.8,
    rest: HIDDEN,
  };
}
MOTION["nwb-tube-glint"] = {
  build: (clock) => ({
    x: at(clock, [
      [0, 0],
      [0.3, 0],
      [0.56, 86],
      [1, 86],
    ]),
  }),
  delay: 0,
  period: 4.8,
};
MOTION["nwb-tassel"] = {
  build: (clock) => ({
    originX: 18.1,
    originY: 75.9,
    rotation: pingPong(clock, -6, 6),
  }),
  delay: 0,
  period: 2.6,
};
MOTION["nwb-rays"] = {
  build: (clock) => ({ ...CENTRE, rotation: sweep(clock, 0, 360) }),
  delay: 0,
  period: 40,
};
/* Web skews the banner as well; a group cannot, so the phone only breathes
   its width. */
MOTION["nwb-banner"] = {
  build: (clock) => ({
    originX: 42.8,
    originY: 60,
    scaleX: pingPong(clock, 1, 0.97),
  }),
  delay: 0,
  period: 3.2,
};

/* Campfire: the flames, the light, embers and the five voices. */
for (const [index, period, delay] of [
  [0, 1.1, 0],
  [1, 0.85, 0.3],
  [2, 0.7, 0.15],
] as const) {
  MOTION[`nwb-blaze-${index + 1}`] = {
    build: (clock) => ({
      originX: 60,
      originY: 86,
      scaleX: at(clock, [
        [0, 1],
        [0.3, 0.93],
        [0.6, 1.05],
        [0.8, 0.97],
        [1, 1],
      ]),
      scaleY: at(clock, [
        [0, 1],
        [0.3, 1.1],
        [0.6, 0.92],
        [0.8, 1.05],
        [1, 1],
      ]),
    }),
    delay,
    period,
  };
}
MOTION["nwb-firelight"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0.75],
      [0.35, 1],
      [0.7, 0.85],
      [1, 0.75],
    ]),
  }),
  delay: 0,
  period: 1.3,
};
for (const [index, period] of [2.2, 2.6, 1.9, 2.4].entries()) {
  MOTION[`nwb-ember-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.12, 1],
        [1, 0],
      ]),
      x: sweep(clock, 0, 3),
      y: sweep(clock, 0, -28),
    }),
    delay: index * 0.55,
    period,
    rest: HIDDEN,
  };
}
for (const [index, [originX, originY]] of [
  [34, 58],
  [47, 44],
  [63, 36],
  [78, 45],
  [88, 60],
].entries()) {
  MOTION[`nwb-reply-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.1, 1],
        [0.8, 1],
        [0.92, 0],
        [1, 0],
      ]),
      originX,
      originY,
      scale: at(clock, [
        [0, 0.2],
        [0.34, 1],
        [0.8, 1],
        [0.92, 0.95],
        [1, 0.95],
      ]),
      y: at(clock, [
        [0, 26],
        [0.34, 0],
        [0.8, -3],
        [0.92, -6],
        [1, -6],
      ]),
    }),
    delay: index * 0.45,
    period: 6,
    rest: DRAWN,
  };
}

/* Lorekeeper: the lock springing, the chain parting, the lore rising. */
const LORE_STOPS = [0, 0.2, 0.3, 0.8, 0.88, 1];
const loreLap = (clock: MotionClock, bound: number, loose: number) =>
  stops(clock, LORE_STOPS, [bound, bound, loose, loose, bound, bound]);
MOTION["nwb-shackle"] = {
  build: (clock) => ({
    y: at(clock, [
      [0, 0],
      [0.14, 0],
      [0.18, -3.5],
      [0.86, -3.5],
      [0.92, 0],
      [1, 0],
    ]),
  }),
  delay: 0,
  period: 7,
};
MOTION["nwb-padlock"] = {
  build: (clock) => ({
    opacity: loreLap(clock, 1, 0),
    y: loreLap(clock, 0, 14),
  }),
  delay: 0,
  period: 7,
};
MOTION["nwb-chain-l"] = {
  build: (clock) => ({
    opacity: loreLap(clock, 1, 0),
    x: loreLap(clock, 0, -12),
  }),
  delay: 0,
  period: 7,
};
MOTION["nwb-chain-r"] = {
  build: (clock) => ({
    opacity: loreLap(clock, 1, 0),
    x: loreLap(clock, 0, 12),
  }),
  delay: 0,
  period: 7,
};
MOTION["nwb-lore-glow"] = {
  build: (clock) => ({
    opacity: at(clock, [
      [0, 0.4],
      [0.24, 0.4],
      [0.34, 1],
      [0.44, 0.85],
      [0.76, 0.85],
      [0.9, 0.4],
      [1, 0.4],
    ]),
    originX: 62,
    originY: 42,
    scale: at(clock, [
      [0, 0.9],
      [0.24, 0.9],
      [0.34, 1.25],
      [0.44, 1],
      [0.76, 1],
      [0.9, 0.9],
      [1, 0.9],
    ]),
  }),
  delay: 0,
  period: 7,
};
for (const [index, [originX, delay]] of [
  [40, 0.1],
  [48, 0.45],
  [56, 0],
  [64, 0.3],
  [72, 0.6],
  [80, 0.2],
].entries()) {
  MOTION[`nwb-glyph-${index + 1}`] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [0.3, 0],
        [0.36, 1],
        [0.64, 0],
        [1, 0],
      ]),
      originX,
      originY: 17,
      scale: at(clock, [
        [0, 0.6],
        [0.3, 0.6],
        [0.64, 1],
        [1, 1],
      ]),
      y: at(clock, [
        [0, 0],
        [0.3, 0],
        [0.64, -15],
        [1, -15],
      ]),
    }),
    delay,
    period: 7,
    rest: HIDDEN,
  };
}
for (const [name, start, originX, dx, dy, turn] of [
  ["nwb-leaf-r", 0.32, 70, 13, -16, 38],
  ["nwb-leaf-l", 0.36, 48, -13, -15, -34],
] as const) {
  MOTION[name] = {
    build: (clock) => ({
      opacity: at(clock, [
        [0, 0],
        [start, 0],
        [start + 0.06, 1],
        [start + 0.36, 0],
        [1, 0],
      ]),
      originX,
      originY: 21,
      rotation: at(clock, [
        [0, 0],
        [start, 0],
        [start + 0.36, turn],
        [1, turn],
      ]),
      x: at(clock, [
        [0, 0],
        [start, 0],
        [start + 0.36, dx],
        [1, dx],
      ]),
      y: at(clock, [
        [0, 0],
        [start, 0],
        [start + 0.36, dy],
        [1, dy],
      ]),
    }),
    delay: 0,
    period: 7,
    rest: HIDDEN,
  };
}

/** Teaches the shared table about every class the crests use. */
export const registerBadgeMotion = (): void => registerMotion(MOTION);
