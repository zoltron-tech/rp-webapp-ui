"use client";

import type { DataType } from "@nw/types/common";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A search result list, a page at a time: the first page whenever `key`
 * changes, "Load more" for the next, and nothing stale.
 *
 * `key` is everything the search depends on (query, filters), as a string;
 * a new key starts over, and an answer for an older key — a slow first page
 * or a "Load more" that was still out — is dropped. `fetchPage` is read on
 * each call, so it may close over the current filters freely.
 *
 * Shared by the character directory and the prompt search.
 */
export const usePagedSearch = <T extends { id?: string | null }>({
  enabled = true,
  fetchPage,
  key,
  pageSize,
}: {
  /** False: fetch nothing (the search is not shown). */
  enabled?: boolean;
  fetchPage: (pageNumber: number) => Promise<DataType<T[]>>;
  key: string;
  pageSize: number;
}) => {
  const [items, setItems] = useState<T[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  /** Bumped per first-page fetch; an answer for an older one is dropped. */
  const requestRef = useRef(0);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  // The first page, again, whenever the search changes — or on `retry`,
  // which bumps `attempt`.
  useEffect(() => {
    if (!enabled) return;
    const request = ++requestRef.current;
    setItems(null);
    setFailed(false);
    setLoadingMore(false);
    void fetchRef.current(1).then((result) => {
      if (request !== requestRef.current) return;
      if (result && "message" in result) {
        setItems([]);
        setFailed(true);
        setHasMore(false);
        return;
      }
      const first = result ?? [];
      setItems(first);
      setPage(1);
      setHasMore(first.length === pageSize);
    });
  }, [enabled, key, attempt, pageSize]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const request = requestRef.current;
    const next = page + 1;
    setLoadingMore(true);
    const result = await fetchRef.current(next);
    // The search moved on while this page was out: its answer is for a list
    // that is no longer on screen.
    if (request !== requestRef.current) return;
    setLoadingMore(false);
    // A failure keeps the button, so the reader can ask again; a 404 has
    // nothing more to give.
    if (result === null) {
      setHasMore(false);
      return;
    }
    if ("message" in result) return;
    setItems((current) => {
      const seen = new Set((current ?? []).map((item) => item.id));
      return [
        ...(current ?? []),
        ...result.filter((item) => !seen.has(item.id)),
      ];
    });
    setPage(next);
    setHasMore(result.length === pageSize);
  }, [hasMore, loadingMore, page, pageSize]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { failed, hasMore, items, loadMore, loadingMore, retry, setItems };
};
