import { useCallback, useRef } from "react";

export const useStoreData = <StoreState = object>(
  id: string,
  initial: StoreState,
): {
  id: string;
  get: () => StoreState;
  set: (
    value:
      | Partial<StoreState>
      | ((prevValue: StoreState) => Partial<StoreState>),
  ) => void;
  subscribe: (callback: () => void) => () => void;
} => {
  const store = useRef<StoreState>(initial);
  const subsribers = useRef(new Set<() => void>());

  const get = useCallback(() => store.current, []);

  const set = useCallback(
    (
      value:
        | Partial<StoreState>
        | ((prevValue: StoreState) => Partial<StoreState>),
    ) => {
      store.current =
        typeof value === "function"
          ? {
              ...store.current,
              ...value(store.current),
            }
          : { ...store.current, ...value };
      subsribers.current.forEach((callback) => callback());
    },
    [],
  );

  const unsubscribe = useCallback(
    (callback: () => void) => () => {
      subsribers.current.delete(callback);
    },
    [],
  );

  const subscribe = useCallback(
    (callback: () => void) => {
      subsribers.current.add(callback);

      return unsubscribe(callback);
    },
    [unsubscribe],
  );

  return {
    id,
    get,
    set,
    subscribe,
  };
};
