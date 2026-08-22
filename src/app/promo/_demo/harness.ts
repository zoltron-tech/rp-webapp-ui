"use client";

import { useEffect, useRef } from "react";

/**
 * What `promo-gif/render.mjs` drives a scene through.
 *
 * The capture calls `seek` once per output frame and screenshots afterwards, so
 * a scene never animates on its own clock.
 */
export type PromoHarness = {
  duration: number;
  seek: (t: number) => void;
  /** True once the scene has mounted and can be stepped. */
  ready: boolean;
};

declare global {
  interface Window {
    __promo?: PromoHarness;
  }
}

/**
 * Publishes `window.__promo` for the capture, and runs the scene in real time
 * when the page is opened with `?play=1` so a human can watch it.
 *
 * `seek` is held in a ref rather than a dependency: a scene rebuilds the
 * closure on every render, and re-registering the harness (or restarting the
 * preview loop) each time would make the animation stutter for no reason.
 */
export const usePromoHarness = (
  duration: number,
  seek: (t: number) => void,
) => {
  const seekRef = useRef(seek);
  seekRef.current = seek;

  useEffect(() => {
    const step = (t: number) => seekRef.current(t);
    window.__promo = { duration, ready: true, seek: step };

    let frame = 0;
    if (new URLSearchParams(window.location.search).has("play")) {
      const started = performance.now();
      const tick = () => {
        step((performance.now() - started) % (duration + 600));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.__promo = undefined;
    };
  }, [duration]);
};
