import {
  createGetFunction,
  useStoreSet as useContextStoreSet,
  useStoreState as useContextStoreState,
} from "@nw/store";
import { StoreContext, type StoreKey } from "./context";

/**
 * The id-based store hooks this app's 188 call sites use.
 *
 * `@nw/store`'s hooks take a context, because a shared package cannot know
 * this app's store ids. These resolve the id against the registry in
 * `context.tsx` and call through — so nothing in the app changed when the
 * store moved into a package.
 */
export { createGetFunction };

export const useStoreState = <State extends object, K extends keyof State>(
  storeId: StoreKey,
  selector: (store: State) => State[K],
) => useContextStoreState<State, K>(StoreContext<State>(storeId), selector);

export const useStoreSet = <State extends object>(storeId: StoreKey) =>
  useContextStoreSet<State>(StoreContext<State>(storeId));
