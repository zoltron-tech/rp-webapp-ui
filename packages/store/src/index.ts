/**
 * The client-state store.
 *
 * Three layers, smallest first: `useStoreData` is the subscribable box,
 * `createStoreContext` puts one in a React context, and the hooks read and
 * write it through `useSyncExternalStore`. `global.ts` is the one store every
 * client shares.
 *
 * Deliberately not a state library. It is ~200 lines, has no DOM references,
 * and works unchanged in React Native — replacing it with Zustand is a decision
 * worth taking after react-query absorbs the server data it currently holds,
 * not before (MONOREPO_MIGRATION_PLAN Phase 1.5).
 */
export type { Store } from "./context";
export { createStoreContext } from "./context";
export {
  GlobalStoreContext,
  useGlobalState,
  useGlobalStoreSet,
} from "./global";
export { createGetFunction, useStoreSet, useStoreState } from "./hooks";
export { useStoreData } from "./store-data";
