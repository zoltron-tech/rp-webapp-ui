import { useContext, useSyncExternalStore } from "react";
import type { Context } from "react";
import type { Store } from "./context";

/**
 * The reading half of the store, over a context rather than a string id.
 *
 * The app's `use-store.ts` keeps the id-based signature its 188 call sites
 * use; it resolves the id against its own registry and calls through to here.
 * Taking the context directly is what makes these portable — a client with a
 * different set of stores reuses them unchanged.
 */
const useStoreContext = <State extends object>(
  context: Context<Store<State>>,
): Store<State> => {
  const store = useContext(context);
  if (!store) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return store;
};

/** `createGetFunction("user")` → `(state) => state.user`. */
export const createGetFunction =
  <State, K extends keyof State>(key: K) =>
  (state: State) =>
    state[key];

export const useStoreState = <State extends object, K extends keyof State>(
  context: Context<Store<State>>,
  selector: (store: State) => State[K],
) => {
  const store = useStoreContext<State>(context);

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.getServerSnapshot()),
  );
};

export const useStoreSet = <State extends object>(
  context: Context<Store<State>>,
) => useStoreContext<State>(context).set;
