import { Logger } from "@/utils/services";
import { useCallback, useRef } from "react";

export const useStoreData = <StoreState = {}>(
  initial: StoreState
): {
  get: () => StoreState;
  set: (value: Partial<StoreState>) => void;
  subscribe: (callback: () => void) => () => void;
} => {
  const store = useRef<StoreState>(initial);
  const subsribers = useRef(new Set<() => void>());

  const get = useCallback(() => store.current, []);

  const set = useCallback((value: Partial<StoreState>) => {
    store.current = { ...store.current, ...value };
    subsribers.current.forEach((callback) => callback());
  }, []);

  const unsubscribe = useCallback(
    (callback: () => void) => () => {
      subsribers.current.delete(callback);
    },
    []
  );

  const subscribe = useCallback((callback: () => void) => {
    subsribers.current.add(callback);

    return unsubscribe(callback);
  }, []);

  Logger.info("useStoreData rendered");

  return {
    get,
    set,
    subscribe,
  };
};
