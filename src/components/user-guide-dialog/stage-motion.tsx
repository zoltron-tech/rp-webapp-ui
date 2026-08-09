"use client";

import {
  type FC,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as S from "./styles";

/**
 * The machinery a stage uses to tell its step as a flow: a beat that advances
 * on its own, a pointer that travels to whatever the beat is about, and a ring
 * around it.
 *
 * Shared rather than per-guide, so the next feature's guide animates the same
 * way this one does.
 */

/** Elements a stage has named, so a beat can point at one. */
export type StageMarks = RefObject<Record<string, HTMLElement | null>>;

export const useStageMarks = (): StageMarks =>
  useRef<Record<string, HTMLElement | null>>({});

/**
 * Names an element for the pointer.
 *
 * Only what is actually on screen is registered: the mocks carry both a desktop
 * rail and a mobile tab bar, one of which is always `display: none`, and the
 * pointer must travel to the one the reader can see.
 */
export const mark =
  (marks: StageMarks, name: string) => (element: HTMLElement | null) => {
    if (element && element.offsetParent === null) return;
    marks.current[name] = element;
  };

/**
 * Names elements the stage did not render itself.
 *
 * Some stages mount a whole real component — the rich-text editor, toolbar and
 * all — rather than mocking its controls. There is no ref to hand those
 * buttons, so they are found by what they already say: their own `title`.
 * Re-run whenever the beat could have changed what is mounted.
 */
export const useQueryMarks = (
  rootRef: RefObject<HTMLElement | null>,
  marks: StageMarks,
  selectors: Record<string, string>,
  /** A dependency list, exactly as useEffect takes one. */
  deps: unknown[] = [],
) => {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    for (const [name, selector] of Object.entries(selectors)) {
      const found = root.querySelector<HTMLElement>(selector);
      if (found) marks.current[name] = found;
    }
    // The selectors object is written inline at the call site, so it is a new
    // object every render; the caller's own deps say when to look again.
  }, deps);
};

export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
};

/** How long the pointer takes to travel — must match `Pointer`'s transition. */
export const POINTER_TRAVEL_MS = 420;

/**
 * The beat: which step of a stage's own little sequence is playing.
 *
 * It comes in two parts, because a hand moves before what it touches does.
 * `aim` changes first and is where the pointer is heading; `beat` follows once
 * the pointer has arrived, and is what the stage should actually *do* — switch
 * the tab, ring the control, lift the row. A stage that acted on `aim` would
 * play its action while the pointer was still crossing the screen, which reads
 * as the pointer chasing the UI rather than working it.
 *
 * The flow is the only thing driving a stage: the model is inert, so there is
 * no reader input to yield to. It does not advance for a reader who asked for
 * less motion; they get the first beat, held.
 */
export const useStageFlow = (
  count: number,
  intervalMs = 2600,
  travelMs = POINTER_TRAVEL_MS,
) => {
  const reduced = usePrefersReducedMotion();
  const [aim, setAim] = useState(0);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduced || count <= 1) return;
    const timer = window.setInterval(
      () => setAim((current) => (current + 1) % count),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [reduced, count, intervalMs]);

  // The action lands when the pointer does.
  useEffect(() => {
    if (reduced) {
      setBeat(aim);
      return;
    }
    const timer = window.setTimeout(() => setBeat(aim), travelMs);
    return () => window.clearTimeout(timer);
  }, [aim, travelMs, reduced]);

  const last = Math.max(count - 1, 0);
  return {
    /** Where the pointer is heading — set the moment the beat turns over. */
    aim: Math.min(aim, last),
    /** What the stage shows — set once the pointer has got there. */
    beat: Math.min(beat, last),
  };
};

/** The offset of an element's centre inside `root`, in the model's own units. */
const centreWithin = (element: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  // offsetLeft/offsetTop are layout values, so they are untouched by the scale
  // the model is drawn at — which is exactly why the pointer is placed this
  // way rather than from getBoundingClientRect.
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x: x + element.offsetWidth / 2, y: y + element.offsetHeight / 2 };
};

type PointerProps = {
  /** The positioned box the pointer is placed inside. */
  rootRef: RefObject<HTMLElement | null>;
  marks: StageMarks;
  /** The element the pointer is heading for — a stage's `aim`. */
  at: string | null;
  /**
   * Changes when the beat lands. It restarts the tap, and re-measures, since
   * the beat's own action (a tab switching) may have moved the target.
   */
  tapKey?: string | number;
};

/** The travelling hand. Purely decorative — every beat is also in the copy. */
export const StagePointer: FC<PointerProps> = ({
  rootRef,
  marks,
  at,
  tapKey,
}) => {
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const target = at ? marks.current[at] : null;
    if (!root) return;
    if (!at) {
      setSpot(null);
      return;
    }
    // A target that is not on the page yet — the beat that reveals it has not
    // landed — leaves the pointer where it is rather than blinking it out.
    if (!target) return;
    const place = () => setSpot(centreWithin(target, root));
    place();
    // Again after the frame the beat's own layout change lands in.
    const frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [at, tapKey, rootRef, marks]);

  if (!spot) return null;

  return (
    <S.Pointer style={{ left: spot.x, top: spot.y }} aria-hidden>
      <svg viewBox="0 0 24 24">
        <title>Pointer</title>
        <path d="M5.5 2.5 L18.5 12.4 L12.2 13.2 L9.4 19.4 Z" />
      </svg>
      {/* Keyed by the landing, so the tap plays on arrival, not on departure. */}
      <S.PointerTap key={`${tapKey ?? ""}:${at ?? "none"}`} />
    </S.Pointer>
  );
};

/** The class that rings whatever the current beat is about. */
export const ring = (isCurrent: boolean) =>
  isCurrent ? "guide-emphasis" : undefined;
