import { pingPong, registerMotion, stops } from "./motion-kit";
import type { MotionClock, MotionRhythm } from "./motion-types";

/**
 * The end-of-list scene's motion, on a phone.
 *
 * Periods and values are the web keyframes' own — `bookFloat`,
 * `bookShadowBreathe`, `artGlowPulse`, `ribbonSway`, `artStarTwinkle`,
 * `artDotTwinkle` and the Zzz `drift` — so the book breathes at the same rate
 * on both clients.
 *
 * ## Keys are the whole `className`, not one class
 *
 * The web splits these in two: `.star` carries the twinkle and `.s3` carries
 * only an `animation-delay`, which is how CSS composes them. A lookup table has
 * no cascade, so an element maps to exactly one rhythm and the key is the whole
 * attribute — `"star s3"`. The drawing writes those strings in a fixed order
 * for that reason; changing the order there is a silent loss of motion here.
 *
 * ## Every origin is a view-box coordinate
 *
 * Which is only possible because the drawing wraps each moving part in a group
 * that does nothing but move, inside a group that does nothing but place. The
 * moving group's own origin is therefore `0, 0` wherever its parent put it, and
 * nothing has to be measured. See `end-of-list.tsx`.
 *
 * ## What is left still
 *
 * **The tilt.** Web's `bookTilt` is `perspective(420px) rotateX(…) rotateY(…)`,
 * a 3D transform with no counterpart in `react-native-svg`'s 2D matrix. The
 * float underneath it — the motion people actually read — is kept.
 *
 * **The ruled lines.** They draw themselves in once on mount through
 * `stroke-dashoffset`, which is a stroke property rather than a transform. They
 * render finished here, which is where that animation ends anyway.
 *
 * **The blink.** `scaleY` about each eye's own centre; `<G>` offers only a
 * uniform `scale`, and a book whose whole eye shrinks is not blinking.
 */

/** The stagger the web spells as `.s1` … `.s7`, in the same order. */
const SPARK_DELAYS = [0, 0.35, 0.7, 1.05, 1.4, 1.75, 2.1];

/** Which sparkles are stars and which are dots, matching the drawing. */
const STARS = [1, 3, 5];
const DOTS = [2, 4, 6, 7];

/** Zzz drift up and fade, staggered per letter. */
const ZZZ_DELAYS = [0, 0.6, 1.2];

export const registerEndOfListMotion = (): void => {
  registerMotion({
    /** Coloured haze behind the book, breathing. */
    glow: {
      build: (clock) => ({
        opacity: pingPong(clock, 0.4, 0.75),
        originX: 60,
        originY: 48,
        scale: pingPong(clock, 0.94, 1.06),
      }),
      delay: 0,
      period: 6.5,
    },

    /**
     * The ribbon marker, caught in the same breeze.
     *
     * It pivots where it leaves the cover — the top edge of its own shape — so
     * the free end is what swings. Its placing group puts the origin there.
     */
    ribbon: {
      build: (clock) => ({
        rotation: pingPong(clock, 0, 2),
        y: pingPong(clock, 0, 1.5),
      }),
      delay: 0,
      period: 5.2,
    },

    /** Slow drift, like the book is floating just off a desk. */
    scene: {
      build: (clock) => ({ y: pingPong(clock, 0, -3) }),
      delay: 0,
      period: 5.2,
    },

    /** The shadow tightens as the book lifts away from the desk. */
    shadow: {
      build: (clock) => ({
        opacity: pingPong(clock, 1, 0.7),
        scale: pingPong(clock, 1, 0.88),
      }),
      delay: 0,
      period: 5.2,
    },
  });

  const zzz = (delay: number): MotionRhythm => ({
    build: (clock: MotionClock) => ({
      opacity: stops(clock, [0, 0.25, 1], [0, 1, 0]),
      scale: stops(clock, [0, 0.25, 1], [0.7, 1, 1.1]),
      x: stops(clock, [0, 1], [0, 4]),
      y: stops(clock, [0, 1], [2, -8]),
    }),
    delay,
    period: 3,
  });

  registerMotion(
    Object.fromEntries(
      ZZZ_DELAYS.map(
        (delay, index) => [`z z${index + 1}`, zzz(delay)] as const,
      ),
    ),
  );

  const star = (delay: number): MotionRhythm => ({
    build: (clock: MotionClock) => ({
      opacity: pingPong(clock, 0.12, 0.95),
      rotation: pingPong(clock, 0, 45),
      scale: pingPong(clock, 0.45, 1.15),
    }),
    delay,
    period: 3.8,
  });

  const dot = (delay: number): MotionRhythm => ({
    build: (clock: MotionClock) => ({
      opacity: pingPong(clock, 0.12, 0.5),
      scale: pingPong(clock, 0.65, 1.2),
    }),
    delay,
    period: 3.4,
  });

  registerMotion(
    Object.fromEntries([
      ...STARS.map(
        (index) => [`star s${index}`, star(SPARK_DELAYS[index - 1])] as const,
      ),
      ...DOTS.map(
        (index) => [`sparkle s${index}`, dot(SPARK_DELAYS[index - 1])] as const,
      ),
    ]),
  );
};
