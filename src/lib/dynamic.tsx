/**
 * Client-only lazy loading — the Next implementation.
 *
 * Every call site in the app used `dynamic(loader, { ssr: false })`, i.e. "load
 * this in the browser only". Under Vite the option is meaningless (there is no
 * server render), so the two implementations differ and are chosen by build:
 * `vite.config.ts` aliases this module to `dynamic.vite.tsx`.
 *
 * The seam exists rather than a straight swap because React.lazy inside a Next
 * client component still participates in Next's server render, which is exactly
 * what `ssr: false` was there to prevent. Keeping this file as-is means the Next
 * build stays byte-identical while both builds coexist.
 *
 * Deleted at D7 along with Next, at which point `dynamic.vite.tsx` can be
 * renamed over it.
 *
 * See REACT_MIGRATION_STEPS.md B7.
 */

export { default as dynamic } from "next/dynamic";
