import type { ReactNode } from "react";
import type {
  MotionClock,
  MotionProps,
  MotionTable,
  MotionValue,
} from "./motion-types";

/**
 * Scene motion, on the web: nothing.
 *
 * Every scene in this package marks its moving parts with a class name, and on
 * the web those names are matched by keyframes in the app's own stylesheet. The
 * browser does the animating, which is what lets it honour
 * `prefers-reduced-motion` and what keeps this package free of a styling engine.
 *
 * So the whole kit is a no-op here, and exists only so the drawings and the
 * primitives can import one set of names that resolves on both platforms.
 *
 * ⚠ This file is `.tsx` and has no JSX in it, and the pairing matters. Metro
 * resolves an extensionless import by walking `sourceExts` in order —
 * `["ts", "tsx", …]` — trying the platform suffix, then `.native`, then bare for
 * *each* extension before moving to the next. A `motion-kit.ts` would therefore
 * be found before `motion-kit.native.tsx` ever got a look in, and the phone
 * would silently bundle this stub and draw every scene still. Both halves of a
 * platform pair must share a base extension.
 */

export type {
  MotionClock,
  MotionProps,
  MotionRhythm,
  MotionTable,
  MotionValue,
} from "./motion-types";

/** A scene declaring how its class names move. Inert here. */
export const registerMotion = (_table: MotionTable): void => {};

/*
 * The curve helpers a native table is written with.
 *
 * Present and useless on the web, because a scene's table is one module that
 * both platforms type-check even though only one of them ever runs it. A stub
 * that throws would be worse than one that returns nothing: nothing calls these
 * in a browser, and a throw would turn a dead branch into a crash.
 */
export const pingPong = (
  _clock: MotionClock,
  _from: number,
  _to: number,
): MotionValue => undefined;

export const sweep = (
  _clock: MotionClock,
  _from: number,
  _to: number,
): MotionValue => undefined;

export const stops = (
  _clock: MotionClock,
  _input: number[],
  _output: number[],
): MotionValue => undefined;

export const MotionProvider = ({
  children,
}: {
  children: ReactNode;
  enabled: boolean;
}): ReactNode => children;

/** Never wraps on the web — the class name alone is the whole mechanism. */
export const useMotion = (_className?: string): MotionProps | null => null;
