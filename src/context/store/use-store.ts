import { useContext, useSyncExternalStore } from "react";
import { type Store, StoreContext, type StoreKey } from "./context";

const useStoreContext = <State>(id: StoreKey): Store<State> => {
  const context = useContext(StoreContext(id));
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context as Store<State>;
};

export const createGetFunction =
  <State, K extends keyof State>(key: K) =>
  (state: State) => {
    return state[key];
  };

export const useStoreState = <State, K extends keyof State>(
  storeId: StoreKey,
  selector: (store: State) => State[K],
) => {
  const store = useStoreContext<State>(storeId);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  const state = useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.getServerSnapshot()),
  );
  return state;
};

export const useStoreSet = <State>(storeId: StoreKey) => {
  const store = useStoreContext<State>(storeId);
  if (!store) {
    throw new Error("useStoreDispatch must be used within a StoreProvider");
  }

  return store.set;
};
