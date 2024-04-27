"use client";

import { useStoreData } from "@/hooks/use-store-data";
import { Logger } from "@/utils/services";
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
  Logger.info("StoreProvider rendered");

  return (
    <StoreContext.Provider value={useStoreData(initial)}>
      {children}
    </StoreContext.Provider>
  );
};
