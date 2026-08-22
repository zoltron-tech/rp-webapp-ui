import type { Platform } from "./types";

export type { Platform } from "./types";

/**
 * Browser globals, typed locally rather than via the DOM lib.
 *
 * This package compiles with `lib: ["ES2022"]` — no DOM — which is what proves
 * the rest of it is portable. This file is the one sanctioned exception, so it
 * declares the narrow surface it needs instead of widening the lib for
 * everything.
 */
interface BrowserGlobals {
  innerWidth?: number;
  screen?: { width: number };
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: {
    userAgent?: string;
    platform?: string;
    maxTouchPoints?: number;
  };
}

const browser = globalThis as unknown as BrowserGlobals;

/** False during SSR, where none of these questions have an answer yet. */
const hasWindow = () => typeof globalThis !== "undefined" && !!browser.navigator;

const matches = (query: string): boolean =>
  hasWindow() && !!browser.matchMedia?.(query).matches;

export const isIOS: Platform["isIOS"] = () => {
  if (!hasWindow()) return false;
  const nav = browser.navigator;
  if (!nav) return false;
  if (/iP(ad|hone|od)/i.test(nav.userAgent ?? "")) return true;
  // iPadOS 13+ reports itself as MacIntel. A real Mac is separated out by
  // having a fine pointer; a touch iPad does not.
  return (
    nav.platform === "MacIntel" &&
    (nav.maxTouchPoints ?? 0) > 1 &&
    !matches("(pointer: fine)")
  );
};

export const isPWA: Platform["isPWA"] = () => matches("(display-mode: standalone)");

export const isCompactViewport: Platform["isCompactViewport"] = (
  minWidth = 768,
) => {
  if (!hasWindow()) return false;
  const width = browser.innerWidth ?? Number.POSITIVE_INFINITY;
  const screenWidth = browser.screen?.width ?? Number.POSITIVE_INFINITY;
  return width < minWidth || screenWidth < minWidth;
};

export const prefersReducedMotion: Platform["prefersReducedMotion"] = () =>
  matches("(prefers-reduced-motion: reduce)");
