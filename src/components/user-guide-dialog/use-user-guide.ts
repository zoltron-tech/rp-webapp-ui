"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getViewedGuidesAction,
  markGuideViewedAction,
} from "@/app/rp/novelists/actions";

/**
 * Which guides this novelist has finished, fetched once per page load.
 *
 * Shared rather than per-hook: several guides can be mounted at once (the
 * storyboard's, the composer's), and they would otherwise each ask. Null inside
 * the set's place means "not known" — signed out, or the service did not
 * answer — and nothing auto-opens on a guess.
 */
let viewedGuides: Promise<Set<string> | null> | null = null;

const loadViewedGuides = (): Promise<Set<string> | null> => {
  viewedGuides ??= getViewedGuidesAction()
    .then((ids) => (ids === null ? null : new Set(ids)))
    // A guide that cannot be looked up is simply not offered. Nothing here is
    // worth an error to the reader.
    .catch(() => null);
  return viewedGuides;
};

/** Keeps the shared list right after one is finished, without re-fetching. */
const rememberViewed = (guideId: string) => {
  viewedGuides = loadViewedGuides().then((current) => {
    if (current === null) return current;
    current.add(guideId);
    return current;
  });
};

/**
 * Guides dismissed in this tab.
 *
 * Only *finishing* a guide is recorded on the server — that is what "has been
 * through it" means. But a reader who skipped one should not meet it again on
 * the next page they open, so a dismissal is remembered here, for as long as
 * the tab lives.
 */
const dismissed = new Set<string>();

type Options = {
  /**
   * Open it unprompted the first time this novelist reaches the page — the
   * point of recording what they have seen. Only fires once the stored list has
   * actually arrived and does not contain this guide.
   */
  auto?: boolean;
};

/**
 * Open/close state for a [UserGuideDialog], plus this novelist's own record of
 * having been through it.
 */
export const useUserGuide = (
  guideId: string,
  { auto = false }: Options = {},
) => {
  const [open, setOpen] = useState(false);
  /** Null until the record has been read — see `loadViewedGuides`. */
  const [viewed, setViewed] = useState<boolean | null>(null);

  useEffect(() => {
    let live = true;
    loadViewedGuides().then((current) => {
      if (!live) return;
      // Not knowing counts as viewed: it is the answer that offers nothing.
      setViewed(current === null ? true : current.has(guideId));
    });
    return () => {
      live = false;
    };
  }, [guideId]);

  // First visit: show it without being asked.
  useEffect(() => {
    if (!auto || viewed !== false || dismissed.has(guideId)) return;
    setOpen(true);
  }, [auto, viewed, guideId]);

  /** Reached the end. This is what the server records. */
  const markSeen = useCallback(() => {
    setViewed(true);
    rememberViewed(guideId);
    // Fire and forget: the reader has finished either way, and the worst a
    // failed write costs them is being offered the guide once more.
    markGuideViewedAction(guideId).catch(() => {});
  }, [guideId]);

  /** Left early. Remembered for this tab only, so it can be met again later. */
  const dismiss = useCallback(() => {
    dismissed.add(guideId);
  }, [guideId]);

  return {
    close: useCallback(() => setOpen(false), []),
    dismiss,
    markSeen,
    open,
    /** Whether they have finished it before. Null while still unknown. */
    seen: viewed,
    start: useCallback(() => setOpen(true), []),
  };
};
