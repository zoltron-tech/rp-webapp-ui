"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Starts a scene's scripted animation the first time it is actually on screen,
 * then leaves it running. Three of these live on the landing page at once and
 * only one is visible at a time, so kicking them all off at mount would burn
 * timers on panels nobody is looking at — and would have the loops mid-way
 * through by the time the reader scrolls to them.
 *
 * Mirrors the observer LiveManuscript already uses; extracted because three
 * more scenes now need the same behaviour.
 */
export const useInViewOnce = <T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] => {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // No observer (older browser, jsdom) — just play.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
};

/**
 * A cancellable clock for a scripted loop.
 *
 * Every scene is an `async` script of `await wait(...)` steps. On unmount the
 * script has to stop *and* its pending timers have to be cleared, or a
 * setState fires against a dead component. Returning `stop` from the effect
 * handles both.
 */
export const createSceneClock = () => {
  let cancelled = false;
  const timeouts = new Set<ReturnType<typeof setTimeout>>();

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(() => {
        timeouts.delete(t);
        resolve();
      }, ms);
      timeouts.add(t);
    });

  return {
    /** True once the scene has been torn down; scripts check this between steps. */
    isCancelled: () => cancelled,
    stop: () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
      timeouts.clear();
    },
    wait,
  };
};
