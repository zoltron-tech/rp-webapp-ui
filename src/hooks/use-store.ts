import { Store, StoreContext } from "@/context";
import { useContext, useSyncExternalStore } from "react";

export const useStore = <State, K extends keyof State>(
  selector: (store: State) => State[K]
): [State[K], (value: Partial<State>) => void] => {
  const store = useContext(StoreContext) as Store<State>;
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  const state = useSyncExternalStore(store.subscribe, () =>
    selector(store.get())
  );

  return [state, store.set];
};
