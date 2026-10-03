/**
 * Badge motion, on the web: nothing.
 *
 * The crests carry `className="nwb-…"` on the parts that move, and on the web
 * those classes are matched by keyframes in `apps/web/src/components/badges/
 * artwork/styles.ts`. The browser does the animating; this module exists only so
 * `index.ts` can register one name that resolves on both platforms.
 *
 * ⚠ This file is `.tsx` and has no JSX in it, and the pairing matters — see the
 * same note on `@nw/animations`'s `motion-kit.tsx`. Metro finds a `.ts` before
 * it finds the `.native.tsx` beside it, and the phone silently draws every
 * crest still.
 */
export const registerBadgeMotion = (): void => {};
