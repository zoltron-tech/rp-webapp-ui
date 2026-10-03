import { type ComponentType, createElement } from "react";
import { Animated } from "react-native";
import * as RNSvg from "react-native-svg";
import { useMotion } from "./motion-kit";
import type { SvgProps } from "./primitives";

/**
 * The same elements, as `react-native-svg` views.
 *
 * Metro prefers `*.native.tsx` over `*.tsx`, so this file is what the phone
 * gets and `primitives.tsx` is what Vite bundles. Neither app imports either
 * directly — the artwork imports `./primitives` and the bundler decides.
 *
 * The casts go through `unknown` because `react-native-svg` types each element
 * with its own closed prop set, and `SvgProps` here is deliberately open (see
 * `primitives.tsx`). Runtime is unaffected: these are the real components.
 *
 * ## The one thing this file does beyond swapping tags
 *
 * It honours `className`. Every shared drawing marks its moving parts with a
 * class name, which on the web is matched by keyframes and here means nothing
 * at all — `react-native-svg` drops the prop, and the phone draws the same
 * artwork completely still.
 *
 * So the elements that can move are wrapped: `motioned` asks `motion-kit`
 * whether the class name has a rhythm registered against it and, if it does,
 * puts an animated `<G>` around the element carrying the transform. A class
 * nothing registered, or a scene drawn without motion, renders exactly as
 * before — one extra function call and no wrapper.
 */
const as = (component: unknown) => component as ComponentType<SvgProps>;

/** The animated group every moving part is wrapped in. */
const AnimatedG = Animated.createAnimatedComponent(
  RNSvg.G as unknown as ComponentType<Record<string, unknown>>,
);

/**
 * The same element, animated when its class name has a rhythm.
 *
 * `className` is still passed through to the inner element — it is inert on
 * this platform, and dropping it would make the two primitive files disagree
 * about what an artwork prop means.
 */
const motioned = (Base: ComponentType<SvgProps>): ComponentType<SvgProps> => {
  const Motioned = (props: SvgProps) => {
    // Unconditional: this is a hook, and every element goes through it.
    const motion = useMotion(
      typeof props.className === "string" ? props.className : undefined,
    );

    const element = createElement(Base, props);
    if (!motion) return element;

    // `MotionProps` is a closed shape and the animated component's props are an
    // open bag; the cast is the join between the two, and the values inside are
    // the animated nodes `Animated` is built to receive.
    return createElement(
      AnimatedG,
      motion as unknown as Record<string, unknown>,
      element,
    );
  };

  Motioned.displayName = "SceneMotion";
  return Motioned;
};

/**
 * Filter primitives are the one part of SVG `react-native-svg` has not always
 * had, and a missing export renders as `<undefined />`, which throws rather
 * than degrading. Two badges use a blur for a glow behind the emblem, so the
 * fallback drops the glow and keeps the badge: a crest without its halo is a
 * cosmetic loss, a red screen is not.
 */
const optional = (component: unknown): ComponentType<SvgProps> =>
  component ? as(component) : () => null;

export type { SvgProps };

export const Svg = as(RNSvg.Svg);

/*
 * The five tags a scene hangs a `className` on. Everything else is inside one
 * of these and moves with it, so it needs no wrapper of its own.
 */
export const G = motioned(as(RNSvg.G));
export const Path = motioned(as(RNSvg.Path));
export const Circle = motioned(as(RNSvg.Circle));
export const Ellipse = motioned(as(RNSvg.Ellipse));
export const Rect = motioned(as(RNSvg.Rect));

export const Line = as(RNSvg.Line);
export const Defs = as(RNSvg.Defs);
export const LinearGradient = as(RNSvg.LinearGradient);
export const RadialGradient = as(RNSvg.RadialGradient);
export const Stop = as(RNSvg.Stop);
export const ClipPath = as(RNSvg.ClipPath);
export const Mask = as(RNSvg.Mask);
export const SvgImage = as(RNSvg.Image);
export const SvgText = as(RNSvg.Text);

export const Filter = optional(
  (RNSvg as unknown as Record<string, unknown>).Filter,
);
export const FeGaussianBlur = optional(
  (RNSvg as unknown as Record<string, unknown>).FeGaussianBlur,
);
export const FeMerge = optional(
  (RNSvg as unknown as Record<string, unknown>).FeMerge,
);
export const FeMergeNode = optional(
  (RNSvg as unknown as Record<string, unknown>).FeMergeNode,
);
