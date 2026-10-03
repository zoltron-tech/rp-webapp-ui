import { createContext } from "react";
import type { Context } from "react";
import { useStoreData } from "./store-data";

/**
 * The value a store context carries: the `useStoreData` handle.
 *
 * `useSyncExternalStore` reads through it, so what is in the context is a
 * stable set of functions rather than the state itself — the whole reason a
 * `set()` does not re-render every consumer of the provider.
 */
export type Store<T = object> = ReturnType<typeof useStoreData<T>>;

/**
 * Creates one store context with a sane empty default.
 *
 * The default exists so `useContext` never returns `undefined` and the type
 * stays non-nullable; a consumer rendered outside its provider reads an empty
 * object rather than crashing on a property access.
 *
 * Each client builds its own registry of these — the shapes differ (the web
 * app has editor stores that do not exist on mobile), the mechanism does not.
 */
export const createStoreContext = <T extends object>(
  id: string,
): Context<Store<T>> =>
  createContext<Store<T>>({
    get: () => ({}) as T,
    getServerSnapshot: () => ({}) as T,
    id,
    set: () => {},
    subscribe: () => () => {},
  });
