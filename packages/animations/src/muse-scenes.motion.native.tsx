import { pingPong, registerMotion, stops } from "./motion-kit";
import type { MotionRhythm } from "./motion-types";

/**
 * The muse scenes' motion, on a phone.
 *
 * Periods and values are the web keyframes' own — `bookFloat`,
 * `bookShadowBreathe`, `artGlowPulse`, `ribbonSway`, `artStarTwinkle`,
 * `artDotTwinkle`, `typingPulse` and `questionPulse` — so a scroll floats at
 * the same rate on both clients.
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
};
