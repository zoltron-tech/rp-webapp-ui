"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { paginate } from "./measure";
import { EMPTY_PAGE_MAP, type PageMap } from "./types";

/** Coalesces the bursts of mutations a rich-text render produces. */
const DEBOUNCE_MS = 150;

/**
 * Measuring is the expensive part, and readers flip between the scroll and
 * page layouts constantly — keep the last few results so re-entry is instant.
 * Keyed by (chapter, page geometry, content), so any real change misses.
 */
const CACHE_LIMIT = 12;
const cache = new Map<string, PageMap>();

const remember = (key: string, map: PageMap) => {
  cache.delete(key);
  cache.set(key, map);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
};

interface Options {
  /** The off-screen container holding the chapter's flow at page width. */
  ref: RefObject<HTMLElement | null>;
  /** Page content height, in the same design pixels the container uses. */
  pageHeight: number;
  /** Identifies the content being measured, for the cache. */
  cacheKey: string;
  /** Skip measuring entirely (e.g. the scroll reader is active). */
  enabled?: boolean;
}

/**
 * Paginates whatever is rendered inside `ref`, re-measuring when the content,
 * the page geometry, or the fonts change.
 */
export const usePaginator = ({
  ref,
  pageHeight,
  cacheKey,
  enabled = true,
}: Options): PageMap => {
  const fullKey = `${cacheKey}|${pageHeight}`;
  const [pageMap, setPageMap] = useState<PageMap>(
    () => cache.get(fullKey) ?? EMPTY_PAGE_MAP,
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const map = paginate(root, pageHeight);
    if (map.totalHeight <= 0) return;
    remember(fullKey, map);
    setPageMap(map);
  }, [ref, pageHeight, fullKey]);

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(measure, DEBOUNCE_MS);
  }, [measure]);

  useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root) return;

    const cached = cache.get(fullKey);
    if (cached) setPageMap(cached);

    // The rich-text renderer injects its HTML in an effect, so the first
    // measure has to wait for that; images and web fonts land later still.
    schedule();

    const mutations = new MutationObserver(schedule);
    mutations.observe(root, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    // Catches image/embed loads, which change heights without mutating markup.
    const resizes = new ResizeObserver(schedule);
    resizes.observe(root);

    const onLoad = () => schedule();
    root.addEventListener("load", onLoad, true); // capture: <img> load doesn't bubble

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) schedule();
    });

    return () => {
      cancelled = true;
      mutations.disconnect();
      resizes.disconnect();
      root.removeEventListener("load", onLoad, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, ref, schedule, fullKey]);

  return pageMap;
};
