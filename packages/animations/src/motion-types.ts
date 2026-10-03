/**
 * The shape of a scene's motion, described without naming a platform.
 *
 * These types are read by code on both clients — the table one package writes
 * and the primitives another package draws with — so they cannot mention
 * `Animated`, which only exists on the phone, and they cannot mention CSS,
 * which only exists in the browser.
 *
 * The concrete values behind them are `Animated.Value` and
 * `Animated.AnimatedInterpolation` on native, and nothing at all on the web,
 * where the browser animates from a stylesheet and this file is only a type.
 */

/** Whatever the platform animates from. `Animated.Value` satisfies it. */
export interface MotionClock {
  interpolate(config: {
    inputRange: number[];
    outputRange: number[] | string[];
  }): unknown;
}

/** One animated quantity. Opaque: only the renderer knows what to do with it. */
export type MotionValue = unknown;

/**
 * What a wrapping group is given.
 *
 * Deliberately the props `react-native-svg`'s `<G>` builds its matrix from,
 * because that is the one element both scenes wrap their moving parts in. The
 * origins are plain numbers in view-box coordinates — never measured — for the
 * reason `motion-kit.native` sets out.
 */
export interface MotionProps {
  opacity?: MotionValue;
  originX?: number;
  originY?: number;
  rotation?: MotionValue;
  scale?: MotionValue;
  /** Per-axis scale, for a foreshortening a uniform `scale` cannot express. */
  scaleX?: MotionValue;
  scaleY?: MotionValue;
  x?: MotionValue;
  y?: MotionValue;
}

/** How one class name moves. */
export interface MotionRhythm {
  /** Seconds for one lap, matching the web keyframes' `animation-duration`. */
  period: number;
  /** Seconds of one-off offset, matching `animation-delay`. */
  delay: number;
  build: (clock: MotionClock) => MotionProps;
  /**
   * The pose to hold while motion is gated off — web's `prefers-reduced-motion`
   * value. Most parts rest where they are drawn and need none; a part whose
   * *rest* is itself a transform (the paper's lean) gives plain numbers here,
   * or it would snap upright every time the reader scrolls.
   */
  rest?: MotionProps;
}

/** Class name to rhythm, as a scene registers it. */
export type MotionTable = Record<string, MotionRhythm>;
