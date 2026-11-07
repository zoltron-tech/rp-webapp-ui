/**
 * The app's small motions, in one place.
 *
 * Three things live here and nowhere else: the **timings** every effect is
 * built from (`MOTION`), the **switches** that turn an effect off (`EFFECTS`),
 * and the **helpers** that drive an `Animated.Value` with those timings. A
 * screen that wants an effect imports one hook from `./effects`; a screen
 * that wants it gone flips its switch, and the hook renders the still state.
 *
 * ## Why `react-native`'s `Animated`, not Reanimated
 *
 * Everything that moves in this app — the tab bar, the chat composer lift, the
 * crop editor, the scene art — runs on `Animated` with the native driver.
 * Reanimated is installed (a dependency of `react-native-screens`) but nothing
 * is built on it yet, and a second animation system for three small effects
 * is a second mental model, a second worklet runtime on the JS thread, and a
 * second set of rules about what may touch what. These effects are all
 * transform and opacity, which the native driver carries off the JS thread;
 * nothing here needs a worklet.
 *
 * ## Reduce Motion
 *
 * Every hook honours the system setting through `useA11ySettings`: the value
 * jumps to its end state rather than animating. Scroll-driven effects (the
 * banner stretch) are *not* motion in that sense — they follow the finger —
 * and stay on, as the HIG allows for direct manipulation.
 */

import { Animated, Easing } from "react-native";

/** Milliseconds and spring shapes. Change a number here, every user follows. */
export const MOTION = {
  /** A quick fade for content that appears or leaves. */
  fade: { duration: 160, easing: Easing.inOut(Easing.quad) },
  /** Long text unfolding and folding: web's `max-height 0.4s ease-in-out`. */
  fold: { duration: 400, easing: Easing.inOut(Easing.ease) },
  /** One short overshoot: a tab chosen, a count changed. */
  pop: { bounciness: 9, speed: 24 },
  /** A brief settle, for things that open and close. */
  reveal: { duration: 220, easing: Easing.out(Easing.cubic) },
  /** A fast snap back. */
  settle: { bounciness: 0, speed: 20 },
  /**
   * A highlight gliding to its new place: web's section switcher pill,
   * `transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)`.
   */
  slide: { duration: 380, easing: Easing.bezier(0.22, 1, 0.36, 1) },
} as const;

/**
 * Switches. Flip one to `false` and the effect's hook returns its resting
 * values; nothing else in the app changes.
 */
export const EFFECTS = {
  /** The profile banner stretching under an over-scroll, Discord style. */
  bannerStretch: true,
  /** A prompt's comment list sliding open rather than appearing. */
  commentsReveal: true,
  /** The one-shot paper burst on the onboarding welcome. */
  confetti: true,
  /**
   * Long rich text growing to its full height on "Read more" and shrinking
   * back, rather than jumping. The one effect here on the JS driver: it
   * animates a height, which the native driver cannot.
   */
  foldReveal: true,
  /**
   * Crests move for a moment when they appear, then hold still. Off, they
   * move for as long as their screen allows — the pre-2026-10 behaviour,
   * and the one that measured 136% of a core at rest.
   */
  motionBurst: true,
  /** The offline pill dropping in under the status bar, and lifting away. */
  offlineBanner: true,
  /**
   * The pill in a character's in-card switcher (Info · Story · Canon) sliding
   * from the section you left to the one you chose.
   */
  sectionSwitcherSlide: true,
  /** The tab icon's little bounce as a tab becomes selected. */
  tabSelectPop: true,
} as const;

/**
 * How long a crest moves after it appears, before it settles — see
 * `useMotionBurst`. Two of the aura's 3.4-second breaths, which is enough to
 * say "this is alive" and short enough that a profile left open costs
 * nothing a minute later.
 */
export const MOTION_BURST_MS = 7000;

/** How far the tab icon overshoots on selection, as a scale. */
export const TAB_POP_SCALE = 1.18;

/** The farthest the banner stretches, in multiples of its own height. */
export const BANNER_STRETCH_MAX = 1.5;

/**
 * Drives `value` to `to` with a spring. Native driver, so only `transform`
 * and `opacity` may read it.
 */
export const springTo = (
  value: Animated.Value,
  to: number,
  shape: { bounciness: number; speed: number },
): Animated.CompositeAnimation =>
  Animated.spring(value, { ...shape, toValue: to, useNativeDriver: true });

/** Drives `value` to `to` on a curve. Native driver, same rule. */
export const timeTo = (
  value: Animated.Value,
  to: number,
  shape: { duration: number; easing: (t: number) => number },
): Animated.CompositeAnimation =>
  Animated.timing(value, { ...shape, toValue: to, useNativeDriver: true });
