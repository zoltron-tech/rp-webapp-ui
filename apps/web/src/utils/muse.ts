/**
 * Moved to `@nw/utils` when the native profile grew a character list — both
 * clients filter alternative verses out of it, so the rule lives in one place.
 * Re-exported here so the existing `@/utils/muse` imports keep resolving.
 */
export { mainVerseMuses } from "@nw/utils";
