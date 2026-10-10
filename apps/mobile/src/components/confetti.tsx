import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { EFFECTS } from "@/animation";
import { useA11ySettings } from "@/lib/a11y-settings";

/**
 * A burst of confetti, once.
 *
 * Paper thrown up from a point, spreading, tumbling and falling off the foot
 * of the screen. It plays when `burst` changes and then takes itself out of
 * the tree: there is nothing to draw between bursts, so nothing is mounted.
 *
 * ## What it costs
 *
 * One `Animated.Value`, driven once from 0 to 1 on the native driver. Every
 * piece derives its position, tumble and fade from that one value by
 * interpolation, so the whole burst is a single animation node on the UI
 * thread with a few dozen transforms hanging off it — the JS thread does
 * nothing after `start()`. Only `transform` and `opacity` move, which is
 * what the native driver can carry (see `animation/index.ts`).
 *
 * The flight is a real parabola, sampled. The native driver interpolates
 * linearly between stops, so the arc is given as eight samples of
 * `-v·t + ½·g·t²`; with `v` and `g` chosen so every piece peaks where it
 * should and ends below the screen,
 * the last frame has nothing visible left and the unmount is not seen.
 *
 * Nothing loops. A welcome that kept raining would be a screen that costs a
 * core for as long as it is open (the idle-load work measured exactly that
 * for a looping crest); this is two and a half seconds and then silence.
 *
 * ## Reduce Motion
 *
 * Off entirely: this is decoration that moves on its own, the exact thing
 * the setting asks not to see. `EFFECTS.confetti` turns it off for everyone.
 */

const PIECES = 44;
const DURATION = 2600;

/** The samples of `t` the parabola is given at. */
const STOPS = [0, 0.06, 0.13, 0.21, 0.3, 0.42, 0.58, 0.78, 1];

/** Festive whatever the accent is; the accent itself is added by the caller. */
const PAPER = [
  "#F5C542",
  "#FF6B9D",
  "#4CC9F0",
  "#9B5DE5",
  "#3DDC97",
  "#FF8A3D",
];

/** A small deterministic generator: the same burst is the same burst. */
const seeded = (seed: number) => {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

interface Piece {
  color: string;
  height: number;
  key: string;
  opacity: number[];
  radius: number;
  range: number[];
  spin: string;
  tumble: string;
  width: number;
  x: number[];
  y: number[];
}

const buildPieces = (
  seed: number,
  colors: string[],
  origin: { x: number; y: number },
  screen: { height: number; width: number },
): Piece[] => {
  const random = seeded(seed * 7919 + 13);
  const fall = screen.height - origin.y + 80;

  return Array.from({ length: PIECES }, (_, index) => {
    // A short stagger, so the burst is a bang with a tail, not one frame.
    const delay = random() * 0.1;
    const range = STOPS.map((stop) => delay + stop * (1 - delay));

    // Thrown upward and outward; wider throws go less high.
    const side = random() * 2 - 1;
    const reach = side * screen.width * (0.2 + random() * 0.4);
    // How high this piece gets above the origin. The origin sits near the
    // top of the screen, so the tallest throws leave it for a moment.
    const apex =
      origin.y * (0.3 + random() * 0.9) * (1 - Math.abs(side) * 0.3) + 24;
    // y(t) = -v·t + ½·g·t², with y(1) = fall and a peak of `apex`:
    // g = 2(fall + v) and apex = v² / 2g, which solves to the line below.
    // Picking `v` first and deriving `g` from the fall alone (the first
    // version) gave a peak of twenty points: the paper dropped, not flew.
    const velocity = 2 * apex + 2 * Math.sqrt(apex * apex + apex * fall);
    const gravity = 2 * (fall + velocity);

    const circle = random() < 0.25;
    const size = 6 + random() * 6;

    return {
      color: colors[index % colors.length],
      height: circle ? size : size * (1.3 + random() * 0.8),
      key: `piece-${index}`,
      opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
      radius: circle ? size / 2 : 1.5,
      range,
      spin: `${Math.round((random() * 2 - 1) * 900)}deg`,
      tumble: `${Math.round(360 * (2 + random() * 4))}deg`,
      width: size,
      // Air drag: most of the sideways travel happens early.
      x: STOPS.map((stop) => reach * (1 - (1 - stop) ** 2.2)),
      y: STOPS.map((stop) => -velocity * stop + 0.5 * gravity * stop * stop),
    };
  });
};

const ConfettiView = ({
  accent,
  burst,
  origin,
}: {
  /** The theme's accent, thrown in with the paper colours. */
  accent?: string;
  /** Plays when this changes to a new non-zero value. */
  burst: number;
  /** Where the paper is thrown from, in window points. */
  origin: { x: number; y: number };
}) => {
  const screen = useWindowDimensions();
  const { reduceMotion } = useA11ySettings();
  const progress = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);

  const enabled = EFFECTS.confetti && !reduceMotion;

  useEffect(() => {
    if (burst === 0 || !enabled) return;
    progress.setValue(0);
    setPlaying(true);
    const run = Animated.timing(progress, {
      duration: DURATION,
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: true,
    });
    run.start(({ finished }) => {
      if (finished) setPlaying(false);
    });
    return () => run.stop();
  }, [burst, enabled, progress]);

  const pieces = useMemo(
    () =>
      playing
        ? buildPieces(burst, accent ? [accent, ...PAPER] : PAPER, origin, {
            height: screen.height,
            width: screen.width,
          })
        : [],
    // The origin is read when a burst starts, not tracked while it flies.
    [accent, burst, playing, screen.height, screen.width],
  );

  if (!playing) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <Animated.View
          key={piece.key}
          style={[
            styles.piece,
            {
              backgroundColor: piece.color,
              borderRadius: piece.radius,
              height: piece.height,
              left: origin.x - piece.width / 2,
              opacity: progress.interpolate({
                extrapolate: "clamp",
                inputRange: piece.range,
                outputRange: piece.opacity,
              }),
              top: origin.y,
              transform: [
                {
                  translateX: progress.interpolate({
                    extrapolate: "clamp",
                    inputRange: piece.range,
                    outputRange: piece.x,
                  }),
                },
                {
                  translateY: progress.interpolate({
                    extrapolate: "clamp",
                    inputRange: piece.range,
                    outputRange: piece.y,
                  }),
                },
                {
                  rotate: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", piece.spin],
                  }),
                },
                {
                  rotateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", piece.tumble],
                  }),
                },
              ],
              width: piece.width,
            },
          ]}
        />
      ))}
    </View>
  );
};

export const Confetti = memo(ConfettiView);

const styles = StyleSheet.create({
  piece: { position: "absolute" },
});
