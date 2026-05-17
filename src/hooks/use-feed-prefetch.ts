/**
 * Drives the shared feed prefetch:
 *   1. On `authState` → "LOGGED_IN", silently prefetches page 1 of the three
 *      shared feeds (explore prompts, OOC posts, home activities).
 *   2. While logged in, polls page 1 of all three at `FEED_POLL_INTERVAL_MS`,
 *      *skipping* ticks where the user is currently viewing /rp/home or
 *      /rp/explore (to avoid disrupting the visible feed — updates land on
 *      the next navigation instead).
 *
 * Mount this hook exactly once, high up in the tree (see `src/app/rp/layout.tsx`).
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { FEED_POLL_INTERVAL_MS, prefetchAllFeeds } from "@/lib/feed-prefetch";

const isFeedRoute = (pathname: string | null) =>
  !!pathname &&
  (pathname.startsWith("/rp/home") || pathname.startsWith("/rp/explore"));

export const useFeedPrefetch = () => {
  const authState = useGlobalState("authState");
  const setGlobalState = useGlobalStoreSet();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep latest pathname accessible from the interval callback.
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // 1) One-shot prefetch when the user transitions to LOGGED_IN.
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    // Fire and forget. `prefetchAllFeeds` internally dedupes via the in-flight
    // map, so duplicate calls (e.g. login + auto-login on refresh) are safe.
    void prefetchAllFeeds(setGlobalState);
  }, [authState, setGlobalState]);

  // 2) Background polling — skip if the user is on a feed-rendering page.
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    const id = setInterval(() => {
      if (isFeedRoute(pathnameRef.current)) return;
      void prefetchAllFeeds(setGlobalState);
    }, FEED_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [authState, setGlobalState]);
};
