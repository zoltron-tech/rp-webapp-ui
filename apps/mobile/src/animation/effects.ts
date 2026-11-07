import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useA11ySettings } from "@/lib/a11y-settings";
import {
  BANNER_STRETCH_MAX,
  EFFECTS,
  MOTION,
  springTo,
  TAB_POP_SCALE,
  timeTo,
} from "./index";

/**
 * The effects, each a hook that hands back animated values and nothing else.
 * A component spreads them into a style; it never starts an animation itself.
 * See `./index.ts` for the timings and the switches.
 */

// ─── 1. Tab selection pop ───────────────────────────────────────────────────

/**
 * A scale that pops once when `selected` turns on: up past 1 and back on a
 * spring. Unselected, and while a tab stays selected, it rests at 1.
 *
 * The bar already crossfades the artwork and swells the active icon with the
 * lozenge's travel; this is the *moment* of choosing, a beat the travel alone
 * does not give. One `Animated.Value` per tab, native driver, nothing on the
 * JS thread after `start()`.
 */
export const useTabSelectPop = (selected: boolean): Animated.Value => {
  const { reduceMotion } = useA11ySettings();
  const scale = useRef(new Animated.Value(1)).current;
  const wasSelected = useRef(selected);

  useEffect(() => {
    const became = selected && !wasSelected.current;
    wasSelected.current = selected;
    if (!became || !EFFECTS.tabSelectPop || reduceMotion) return;

    scale.setValue(1);
    const pop = Animated.sequence([
      springTo(scale, TAB_POP_SCALE, MOTION.pop),
      springTo(scale, 1, MOTION.settle),
    ]);
    pop.start();
    return () => pop.stop();
  }, [reduceMotion, scale, selected]);

  return scale;
};

// ─── 2. Banner stretch on over-scroll ───────────────────────────────────────

/**
 * What a stretching banner needs: the scroll handler to attach to the list,
 * and the transform to put on the banner.
 *
 * Discord's rule: pull the page down past its top and the banner grows to fill
 * the gap, pinned to the top edge, rather than sliding down and showing the
 * page colour above it. The whole page moves down by the over-scroll, banner
 * included; scaling the banner about its *bottom* edge by exactly that much
 * over its own height lifts its top edge back by the same distance, so the top
 * stays on the screen's edge and the bottom stays on the page. The scale
 * derives from the scroll offset on the native side, so nothing runs on the JS
 * thread while the finger moves.
 *
 * The growth is unbounded on purpose. `BANNER_STRETCH_MAX` is where the scale
 * *reaches* 1.5 — the input range — not a cap: the first version clamped
 * there, and past that point the page kept moving while the banner stopped,
 * so the banner slid down the screen with everything else. The over-scroll
 * itself is the limit, and the platform sets that.
 *
 * `bannerHeight` comes from `onLayout`; until it is known the banner is still.
 * Not gated on Reduce Motion: it follows the finger, it does not move on its own.
 */
export const useBannerStretch = (
  /** Another handler for the same events — the tab bar's collapse, say. */
  listener?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
): {
  bannerStyle: { transform: { scale: Animated.AnimatedInterpolation<number> }[] };
  onBannerLayout: (event: LayoutChangeEvent) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
} => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [bannerHeight, setBannerHeight] = useState(0);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        listener,
        useNativeDriver: true,
      }),
    [listener, scrollY],
  );

  const bannerStyle = useMemo(() => {
    const height = Math.max(bannerHeight, 1);
    const reach = height * (BANNER_STRETCH_MAX - 1);
    const enabled = EFFECTS.bannerStretch && bannerHeight > 0;
    // Scale about the bottom edge: translate the centre down by half the
    // height, scale, translate back. Scale 1 + d / height for an over-scroll
    // of d: the top edge rises by d, which is exactly how far the page has
    // moved down. Open-ended below zero (see above); never above 1.
    const scale = scrollY.interpolate({
      extrapolateLeft: "extend",
      extrapolateRight: "clamp",
      inputRange: [-reach, 0],
      outputRange: enabled ? [BANNER_STRETCH_MAX, 1] : [1, 1],
    });
    return {
      transform: [
        { translateY: height / 2 },
        { scale },
        { translateY: -height / 2 },
      ],
    } as unknown as { transform: { scale: Animated.AnimatedInterpolation<number> }[] };
  }, [bannerHeight, scrollY]);

  const onBannerLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    if (next !== bannerHeight) setBannerHeight(next);
  };

  return { bannerStyle, onBannerLayout, onScroll, scrollEventThrottle: 16 };
};

// ─── 5. Motion burst ────────────────────────────────────────────────────────

/**
 * Motion for a moment, then stillness — Discord's rule for decorations.
 *
 * A crest that breathes forever costs the JS thread a prop push per moving
 * part per tick for as long as the screen is open, and a profile is open for
 * minutes. Discord's avatar decorations play when the profile opens and then
 * hold; a game's idle animation runs a cycle and settles. This is that: when
 * `wanted` turns on, motion runs for `ms`, then stops (the motion kit finishes
 * the lap, so nothing snaps). `replay()` runs it again — on a tap, say.
 *
 * `wanted` off is off at once: a screen being left does not get to finish
 * its burst.
 */
export const useMotionBurst = (
  wanted: boolean,
  ms: number,
): { live: boolean; replay: () => void } => {
  const [burst, setBurst] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!wanted || !EFFECTS.motionBurst) {
      setLive(false);
      return;
    }
    setLive(true);
    const timer = setTimeout(() => setLive(false), ms);
    return () => clearTimeout(timer);
  }, [burst, ms, wanted]);

  const replay = useCallback(() => setBurst((n) => n + 1), []);
  return { live: wanted && live, replay };
};

// ─── 4. Offline banner ──────────────────────────────────────────────────────

/**
 * Whether to mount the offline pill, and the style that drops it in.
 *
 * The same shape as the comments reveal — mount, fade and slide, unmount
 * after the fade — in the other direction: it comes *down* from under the
 * status bar. Reduce Motion: on and off at once.
 */
const BANNER_DROP = 12;

export const useOfflineBannerReveal = (
  visible: boolean,
): {
  mounted: boolean;
  style: { opacity: Animated.Value; transform: { translateY: Animated.AnimatedInterpolation<number> }[] };
} => {
  const { reduceMotion } = useA11ySettings();
  const instant = !EFFECTS.offlineBanner || reduceMotion;
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (instant) {
        progress.setValue(1);
        return;
      }
      const reveal = timeTo(progress, 1, MOTION.reveal);
      reveal.start();
      return () => reveal.stop();
    }
    if (instant) {
      progress.setValue(0);
      setMounted(false);
      return;
    }
    const hide = timeTo(progress, 0, MOTION.fade);
    hide.start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return () => hide.stop();
  }, [instant, progress, visible]);

  const style = useMemo(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-BANNER_DROP, 0],
          }),
        },
      ],
    }),
    [progress],
  );

  return { mounted, style };
};

// ─── 3. Comments reveal ─────────────────────────────────────────────────────

/**
 * Whether to mount the comment list, and the style that reveals it.
 *
 * The list stays mounted through its closing animation (`mounted` lags `open`
 * by the fade), then unmounts so the query inside it stops. The reveal is an
 * opacity fade and a short rise from a few points below — transform and
 * opacity only, so a recycled feed cell is not re-laid out while it moves; the
 * *height* change is instant, which a list's own layout handles in the same
 * frame. Reduce Motion: mount and unmount at once.
 */
const COMMENTS_RISE = 8;

export const useCommentsReveal = (
  open: boolean,
): {
  mounted: boolean;
  style: { opacity: Animated.Value; transform: { translateY: Animated.AnimatedInterpolation<number> }[] };
} => {
  const { reduceMotion } = useA11ySettings();
  const instant = !EFFECTS.commentsReveal || reduceMotion;
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (instant) {
        progress.setValue(1);
        return;
      }
      const reveal = timeTo(progress, 1, MOTION.reveal);
      reveal.start();
      return () => reveal.stop();
    }
    if (instant) {
      progress.setValue(0);
      setMounted(false);
      return;
    }
    const hide = timeTo(progress, 0, MOTION.fade);
    hide.start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return () => hide.stop();
  }, [instant, open, progress]);

  const style = useMemo(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-COMMENTS_RISE, 0],
          }),
        },
      ],
    }),
    [progress],
  );

  return { mounted, style };
};

// ─── 6. Fold reveal ─────────────────────────────────────────────────────────

/**
 * Where a fold is: resting shut, on its way open, resting open, on its way
 * shut. Only the two resting phases are what `open` says; the moving ones
 * are what the box looks like while it travels.
 */
type FoldPhase = "folded" | "opening" | "open" | "closing";

/**
 * Long rich text growing to its full height and shrinking back to the fold,
 * as web's `ContentWrapper` transitions `max-height`.
 *
 * ## A height, so the JS driver
 *
 * The rest of this file is transform and opacity on the native driver. A fold
 * changes how much room the text takes — the card grows, the feed below it
 * moves — and only layout can do that, so the cap is driven from JS for the
 * 400ms it travels. The fade over the fold's foot is opacity, and stays native.
 *
 * ## Opening needs the full height first
 *
 * A folded document may be drawn only in part (`maxBlocks`), so how tall it
 * is open is unknown until the whole of it is laid out. Opening therefore
 * draws everything at once under the old cap (`full`), waits for `natural` to
 * report the whole document, and only then lets the cap travel. Shutting runs
 * the other way: the cap travels down first, and the document is cut back to
 * its first blocks once it is out of sight.
 *
 * ## Only a tap animates
 *
 * Feeds recycle cells, and a recycled cell is handed another post and that
 * post's open state at once. That must not play as a fold. `arm` is called by
 * the tap; a change of `open` without it — or a new `resetKey`, which is the
 * document — jumps straight to the resting phase. Off, or under Reduce Motion,
 * every change jumps.
 */
export const useFoldReveal = ({
  collapsedHeight,
  natural,
  open,
  resetKey,
}: {
  collapsedHeight: number;
  /** The whole document's laid-out height, once known. */
  natural: number | null;
  open: boolean;
  /** What is being folded; a new one is never animated into. */
  resetKey: unknown;
}): {
  arm: () => void;
  /** The box that clips the text: no cap at all once resting open. */
  clipStyle: { maxHeight?: number | Animated.Value; overflow?: "hidden" };
  /** The fade over the fold's foot. Native driver. */
  fadeOpacity: Animated.Value;
  /** Draw the whole document, not only the blocks a fold shows. */
  full: boolean;
  /** Whether the fade is drawn at all. */
  showFade: boolean;
} => {
  const { reduceMotion } = useA11ySettings();
  const instant = !EFFECTS.foldReveal || reduceMotion;
  const height = useRef(new Animated.Value(collapsedHeight)).current;
  const fadeOpacity = useRef(new Animated.Value(open ? 0 : 1)).current;
  const [phase, setPhase] = useState<FoldPhase>(open ? "open" : "folded");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const naturalRef = useRef(natural);
  naturalRef.current = natural;
  const armed = useRef(false);
  /** The opening travel has begun; later measurements do not restart it. */
  const growing = useRef(false);
  const last = useRef({ open, resetKey });

  const arm = useCallback(() => {
    armed.current = true;
  }, []);

  // Stopped, not left running, when the cell goes away.
  useEffect(
    () => () => {
      height.stopAnimation();
      fadeOpacity.stopAnimation();
    },
    [fadeOpacity, height],
  );

  // A change of `open` either starts a fold (armed) or jumps to rest.
  useEffect(() => {
    const prev = last.current;
    last.current = { open, resetKey };
    if (prev.open === open && prev.resetKey === resetKey) return;

    const animate = armed.current && !instant && prev.resetKey === resetKey;
    armed.current = false;
    // A second tap mid-travel turns the fold round where it stands.
    const from = phaseRef.current;
    height.stopAnimation();
    fadeOpacity.stopAnimation();

    if (!animate) {
      height.setValue(collapsedHeight);
      fadeOpacity.setValue(open ? 0 : 1);
      setPhase(open ? "open" : "folded");
      return;
    }

    if (open) {
      growing.current = false;
      if (from === "folded") height.setValue(collapsedHeight);
      setPhase("opening");
      return;
    }

    // Shutting: travel down from where the document stands, then cut it
    // back to its first blocks once that is out of sight.
    if (from === "open") {
      height.setValue(
        Math.max(naturalRef.current ?? collapsedHeight, collapsedHeight),
      );
    }
    setPhase("closing");
    Animated.timing(height, {
      ...MOTION.fold,
      toValue: collapsedHeight,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPhase("folded");
    });
    timeTo(fadeOpacity, 1, MOTION.fold).start();
  }, [collapsedHeight, fadeOpacity, height, instant, open, resetKey]);

  // Opening: travel once the whole document has said how tall it is.
  useEffect(() => {
    if (phase !== "opening" || natural === null || growing.current) return;
    growing.current = true;
    Animated.timing(height, {
      ...MOTION.fold,
      toValue: Math.max(natural, collapsedHeight),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setPhase("open");
    });
    timeTo(fadeOpacity, 0, MOTION.fade).start();
  }, [collapsedHeight, fadeOpacity, height, natural, phase]);

  const clipStyle =
    phase === "open"
      ? {}
      : phase === "folded"
        ? { maxHeight: collapsedHeight, overflow: "hidden" as const }
        : { maxHeight: height, overflow: "hidden" as const };

  return {
    arm,
    clipStyle,
    fadeOpacity,
    full: phase !== "folded",
    showFade: phase !== "open",
  };
};
