import { pingPong, registerMotion, stops } from "./motion-kit";
import type { MotionClock, MotionRhythm } from "./motion-types";

/**
 * The muse scenes' motion, on a phone.
 *
 * Periods and values are the web keyframes' own — `bookFloat`,
 * `bookShadowBreathe`, `artGlowPulse`, `ribbonSway`, `artStarTwinkle`,
 * `artDotTwinkle`, `typingPulse` and `questionPulse` — so a scroll floats at
 * the same rate on both clients. The open book (`open-book.tsx`) is the same
 * paper object and registers here too: `quillWrite` and `inkDrip`.
 *
 * ## Every key is namespaced
 *
 * The motion table is one flat map for every scene in every package, and the
 * dozing book already registers `glow`, `shadow` and `scene` with *its*
 * ellipse's view-box origin baked in. These scenes place each moving part with
 * a wrapping group instead, so every rhythm here works about `0, 0` and one
 * table entry serves all five drawings — but only under a name the book does
 * not own. Hence `nwm-`.
 *
 * ## Keys are the whole `className`
 *
 * `"nwm-star s3"`, not `"nwm-star"`: the web composes the twinkle and its
 * stagger from two classes, a lookup table cannot, so the stagger classes are
 * registered as part of the key. The drawing writes them in that fixed order.
 *
 * ## The tilt, approximately
 *
 * Web's `bookTilt` is `perspective(420px) rotateX(7deg) rotateY(-14deg)
 * rotate(-1.5deg)`, breathing to `rotateX(4deg) rotateY(-9deg) rotate(-0.5deg)`
 * over 7.4 seconds. A 2D matrix has no perspective, so what is kept is what a
 * 2D matrix can carry: the in-plane rotation exactly, and the foreshortening
 * as the cosines of the two out-of-plane angles on each axis. The trapezoid
 * the perspective adds is lost — a fraction of a degree of edge slope at this
 * size, which is well under what reads. Without this the phone's paper stood
 * bolt upright next to web's, and *that* read at once.
 *
 * ## What is left still
 *
 * The ruled lines' `stroke-dashoffset` draw-in, for the reason
 * `end-of-list.motion.native` gives.
 */

const cos = (degrees: number) => Math.cos((degrees * Math.PI) / 180);

/** The stagger the web spells as `.s1` … `.s12`, in the same order. */
const SPARK_DELAYS: Record<string, number> = {
  s1: 0,
  s2: 0.35,
  s3: 0.7,
  s4: 1.05,
  s5: 1.4,
  s6: 1.75,
  s7: 2.1,
  s8: 2.45,
  s9: 2.8,
  s10: 3.15,
  s11: 0.55,
  s12: 1.95,
};

/** Web's `.typing circle:nth-child(n)` delays. */
const DOT_DELAYS = [0, 0.2, 0.4];

const star = (delay: number): MotionRhythm => ({
  build: (clock) => ({
    opacity: pingPong(clock, 0.12, 0.95),
    rotation: pingPong(clock, 0, 45),
    scale: pingPong(clock, 0.45, 1.15),
  }),
  delay,
  period: 3.8,
});

const dot = (delay: number): MotionRhythm => ({
  build: (clock) => ({
    opacity: pingPong(clock, 0.12, 0.5),
    scale: pingPong(clock, 0.65, 1.2),
  }),
  delay,
  period: 3.4,
});

/**
 * `typingPulse`: rest, rise and brighten at 30%, back by 60%, hold.
 */
const typing = (delay: number): MotionRhythm => ({
  build: (clock) => ({
    opacity: stops(clock, [0, 0.3, 0.6, 1], [0.3, 1, 0.3, 0.3]),
    y: stops(clock, [0, 0.3, 0.6, 1], [0, -2, 0, 0]),
  }),
  delay,
  period: 1.8,
});

/** Three points inside each pair of keyframes, on the `ease-in-out` curve. */
const EASE_POINTS = [0.25, 0.5, 0.75].map(
  (t) => [t, (1 - Math.cos(Math.PI * t)) / 2] as const,
);

/**
 * Keyframes with CSS `ease-in-out` between each pair.
 *
 * `stops` joins its keyframes with straight lines, which is right for a fade
 * and wrong for anything that travels: the quill would reach each end of its
 * swing at full speed and turn on the spot. The browser eases every segment,
 * so this fills each one in on the same cosine `pingPong` uses.
 */
const eased = (clock: MotionClock, input: number[], output: number[]) => {
  const at: number[] = [];
  const to: number[] = [];

  for (let index = 0; index < input.length - 1; index += 1) {
    const span = input[index + 1] - input[index];
    const rise = output[index + 1] - output[index];
    at.push(input[index]);
    to.push(output[index]);
    for (const [t, weight] of EASE_POINTS) {
      at.push(input[index] + span * t);
      to.push(output[index] + rise * weight);
    }
  }

  at.push(input[input.length - 1]);
  to.push(output[output.length - 1]);
  return stops(clock, at, to);
};

/** Web's `quillWrite` and `inkDrip` share a period, so the drop keeps time. */
const QUILL_PERIOD = 4.8;
const QUILL_KEYS = [0, 0.3, 0.65, 1];
const INK_KEYS = [0, 0.2, 0.7, 1];
const LENS_KEYS = [0, 0.35, 0.7, 1];

export const registerMuseSceneMotion = (): void => {
  registerMotion({
    /** The open link where a bond would close, pulsing like a question. */
    "nwm-bond": {
      build: (clock) => ({ opacity: pingPong(clock, 0.5, 0.95) }),
      delay: 0,
      period: 3.4,
    },

    /** Coloured haze behind the paper, breathing about its own centre. */
    "nwm-glow": {
      build: (clock) => ({
        opacity: pingPong(clock, 0.4, 0.75),
        scale: pingPong(clock, 0.94, 1.06),
      }),
      delay: 0,
      period: 6.5,
    },
    /** Ink gathers at the nib, falls, and fades before it ever lands. */
    "nwm-ink": {
      build: (clock) => ({
        opacity: eased(clock, INK_KEYS, [0, 0.45, 0.2, 0]),
        scale: eased(clock, INK_KEYS, [0.4, 1, 0.85, 0.4]),
        y: eased(clock, INK_KEYS, [-5, 0, 7, 12]),
      }),
      delay: 0,
      period: QUILL_PERIOD,
      // Web's reduced-motion pose.
      rest: { opacity: 0.35 },
    },

    /** The quill hovers over the page as if searching for the first word. */
    "nwm-quill": {
      build: (clock) => ({
        rotation: eased(clock, QUILL_KEYS, [0, -5, 4, 0]),
        x: eased(clock, QUILL_KEYS, [0, -4, 3, 0]),
        y: eased(clock, QUILL_KEYS, [0, 2, -1, 0]),
      }),
      delay: 0,
      period: QUILL_PERIOD,
    },

    /** A ribbon or corner tab, pivoting where it leaves the paper. */
    "nwm-ribbon": {
      build: (clock) => ({
        rotation: pingPong(clock, 0, 2),
        y: pingPong(clock, 0, 1.5),
      }),
      delay: 0,
      period: 5.2,
    },

    /** Slow drift, like the paper is floating just off a desk. */
    "nwm-scene": {
      build: (clock) => ({ y: pingPong(clock, 0, -3) }),
      delay: 0,
      period: 5.2,
    },

    /** The shadow tightens as the paper lifts away from the desk. */
    "nwm-shadow": {
      build: (clock) => ({
        opacity: pingPong(clock, 1, 0.7),
        scale: pingPong(clock, 1, 0.88),
      }),
      delay: 0,
      period: 5.2,
    },
    /** The lean, breathing between web's two keyframes. Origin: the scene's centre. */
    "nwm-tilt": {
      build: (clock) => ({
        rotation: pingPong(clock, -1.5, -0.5),
        scaleX: pingPong(clock, cos(14), cos(9)),
        scaleY: pingPong(clock, cos(7), cos(4)),
      }),
      delay: 0,
      period: 7.4,
      // Web's reduced-motion pose: `rotateX(6deg) rotateY(-12deg) rotate(-1deg)`.
      rest: { rotation: -1, scaleX: cos(12), scaleY: cos(6) },
    },
  });

  registerMotion(
    Object.fromEntries(
      DOT_DELAYS.map(
        (delay, index) => [`nwm-dot d${index + 1}`, typing(delay)] as const,
      ),
    ),
  );

  registerMotion(
    Object.fromEntries(
      Object.entries(SPARK_DELAYS).flatMap(([name, delay]) => [
        [`nwm-star ${name}`, star(delay)] as const,
        [`nwm-sparkle ${name}`, dot(delay)] as const,
      ]),
    ),
  );

  // ─── The empty scenes' own parts (`empty-scenes.tsx`) ─────────────────────

  registerMotion({
    /** `iceDrift`: a smaller, colder bob — the scene is rail-sized. */
    "nwm-ice": {
      build: (clock) => ({
        rotation: pingPong(clock, 0, -2),
        y: pingPong(clock, 0, -1.5),
      }),
      delay: 0,
      period: 4.4,
    },

    /** `lensSweep`: the magnifier swings over the cards, held by its handle. */
    "nwm-lens": {
      build: (clock) => ({
        rotation: eased(clock, LENS_KEYS, [0, -4, 3, 0]),
        x: eased(clock, LENS_KEYS, [0, -6, 3, 0]),
        y: eased(clock, LENS_KEYS, [0, 3, -2, 0]),
      }),
      delay: 0,
      period: 5.6,
    },

    /** `scrapSlip`: the torn-off half sags from the tear and drifts back. */
    "nwm-scrap": {
      build: (clock) => ({
        opacity: pingPong(clock, 0.85, 0.55),
        rotation: pingPong(clock, -1.5, -4),
        x: pingPong(clock, 0, 4),
        y: pingPong(clock, 0, 6),
      }),
      delay: 0,
      period: 6.2,
      // Web's reduced-motion pose.
      rest: { opacity: 0.7, rotation: -3, x: 3, y: 4 },
    },

    /** `shelfSettle`: the outer spine sinks a touch further into its lean, and back. */
    "nwm-settle": {
      build: (clock) => ({ rotation: pingPong(clock, 0, 1.2) }),
      delay: 0,
      period: 6.4,
    },

    /** `figureFade`: the figure thins to almost nothing and gathers again. */
    "nwm-vanish": {
      build: (clock) => ({
        opacity: pingPong(clock, 0.85, 0.16),
        y: pingPong(clock, 0, -2),
      }),
      delay: 0,
      period: 5.6,
      rest: { opacity: 0.45 },
    },
  });

  /** `flakeLift`: paper lifts off the tear and fades, staggered along it. */
  const flake = (delay: number): MotionRhythm => ({
    build: (clock) => ({
      opacity: stops(clock, [0, 0.25, 1], [0, 0.9, 0]),
      rotation: stops(clock, [0, 1], [0, 35]),
      scale: stops(clock, [0, 1], [0.6, 1]),
      x: stops(clock, [0, 1], [0, 6]),
      y: stops(clock, [0, 1], [2, -12]),
    }),
    delay,
    period: 3.6,
    rest: { opacity: 0.6 },
  });

  /** `moteRise`: what the figure is made of, up and off the card's corner. */
  const mote = (delay: number): MotionRhythm => ({
    build: (clock) => ({
      opacity: stops(clock, [0, 0.22, 1], [0, 0.95, 0]),
      scale: stops(clock, [0, 1], [0.5, 1]),
      x: stops(clock, [0, 1], [0, 11]),
      y: stops(clock, [0, 1], [3, -24]),
    }),
    delay,
    period: 3.8,
    rest: { opacity: 0.6 },
  });

  registerMotion(
    Object.fromEntries([
      ...[0, 1.2, 2.4].map(
        (delay, index) => [`nwm-flake f${index + 1}`, flake(delay)] as const,
      ),
      ...[0, 0.75, 1.5, 2.25, 3].map(
        (delay, index) => [`nwm-mote m${index + 1}`, mote(delay)] as const,
      ),
    ]),
  );
};
