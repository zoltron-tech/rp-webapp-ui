/**
 * The platform seam.
 *
 * Every implementation of this interface answers the same questions; only the
 * mechanism differs. `index.ts` is the web/default implementation and
 * `index.native.ts` is the React Native one — Metro resolves `.native.ts`
 * ahead of `.ts` automatically, so neither app needs bundler configuration to
 * get the right half.
 */
export interface Platform {
  /** True on iPhone / iPod / iPad, including iPads reporting as MacIntel. */
  isIOS(): boolean;
  /** True when running as an installed PWA. Always false on native. */
  isPWA(): boolean;
  /** True when the viewport is narrower than `minWidth` (default 768). */
  isCompactViewport(minWidth?: number): boolean;
  /** True when the user has asked the OS to reduce motion. */
  prefersReducedMotion(): boolean;
}
