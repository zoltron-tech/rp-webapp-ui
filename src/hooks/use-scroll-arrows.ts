"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the left/right nav buttons on a horizontally-scrollable row: tracks
 * whether there's more content to scroll to on either side, and exposes a
 * scroll-by-one-page action. `deps` should include whatever reactive value
 * changes the row's content length (e.g. a loaded-items array), since content
 * growth doesn't fire a resize on the scroll container itself.
 */
export function useScrollArrows<T extends HTMLElement>(
  // biome-ignore lint: deps forwarded verbatim into the effect below
  deps: React.DependencyList = [],
) {
  const ref = useRef<T>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const refreshArrows = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    refreshArrows();
    el.addEventListener("scroll", refreshArrows, { passive: true });
    const resizeObserver = new ResizeObserver(refreshArrows);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", refreshArrows);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshArrows, ...deps]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return { ref, canScrollLeft, canScrollRight, scrollByPage };
}
