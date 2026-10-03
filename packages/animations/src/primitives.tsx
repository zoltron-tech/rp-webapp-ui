import type { ComponentType, ReactNode } from "react";

/**
 * The SVG elements every shared drawing is made of, on the web.
 *
 * The artwork in this package and in `@nw/badges` is one drawing rendered by
 * two very different engines: the browser's SVG, and `react-native-svg`'s
 * native views. The elements are the same and the attributes are the same —
 * only the *component* behind each tag differs — so a drawing imports its tags
 * from here and Metro swaps in `primitives.native.tsx` when it builds for a
 * phone. Nothing in a scene has to know which client it is on.
 *
 * The tags are string literals cast to components rather than JSX intrinsics on
 * purpose. `<path>` typed by `@types/react` drags in `SVGPathElement` and the
 * rest of lib.dom, which this package deliberately does not have — a package
 * that can see the DOM is a package that can accidentally use it. React accepts
 * a tag name where a component is expected, so the cast is exact at runtime and
 * the type is the one below.
 */

/**
 * SVG attributes as JSX passes them.
 *
 * Deliberately open. A closed union would be a third transcription of the SVG
 * attribute set — after `@types/react` and `react-native-svg` — kept in step by
 * hand, and the artwork is constants rather than logic: the value a typo would
 * corrupt is a number in a path, which no type catches either.
 */
export interface SvgProps {
  children?: ReactNode;
  className?: string;
  [attribute: string]: unknown;
}

const tag = (name: string) => name as unknown as ComponentType<SvgProps>;

export const Svg = tag("svg");
/** `<text>`. Named apart so native can map it to a component, not a host tag. */
export const SvgText = tag("text");
export const G = tag("g");
export const Path = tag("path");
export const Circle = tag("circle");
export const Ellipse = tag("ellipse");
export const Rect = tag("rect");
export const Line = tag("line");
export const Defs = tag("defs");
export const LinearGradient = tag("linearGradient");
export const RadialGradient = tag("radialGradient");
export const Stop = tag("stop");
export const ClipPath = tag("clipPath");
export const Mask = tag("mask");
export const Filter = tag("filter");
export const FeGaussianBlur = tag("feGaussianBlur");
export const FeMerge = tag("feMerge");
export const FeMergeNode = tag("feMergeNode");
export const SvgImage = tag("image");
