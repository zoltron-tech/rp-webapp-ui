import { useStoreData } from "@/hooks/use-store-data";
import { createContext } from "react";

export type Store<T = {}> = ReturnType<typeof useStoreData<T>>;
export const StoreContext = createContext<Store>({
  get: () => ({}),
  set: () => {},
  subscribe: () => () => {},
});

interface StoreProviderProps<T> {
  initial: T;
  children: React.ReactNode;
}

export const StoreProvider = <T extends object>({
  children,
  initial,
}: StoreProviderProps<T>) => {
  return (
    <StoreContext.Provider value={useStoreData(initial)}>
      {children}
    </StoreContext.Provider>
  );
};
