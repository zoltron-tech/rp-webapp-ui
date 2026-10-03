/**
 * The global store's hooks now live in `@nw/store` — mobile needs the same two.
 * Re-exported from here so the 172 existing `@/context/store/stores` imports
 * keep working; new code can import from `@nw/store` directly.
 */
export { useGlobalState, useGlobalStoreSet } from "@nw/store";
