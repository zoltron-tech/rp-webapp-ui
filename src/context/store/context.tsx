import type React from "react";
import { createContext } from "react";
import type { PromptStoreType } from "@/components/prompt/prompt.store";
import type { PromptInputState } from "@/components/prompt-input/prompt-input.store";
import type { Comment } from "@/types";
import type { StoreState } from "@/types/state";
import { useStoreData } from "./use-store-data";

type SimpleRecord = Record<string, any>;

export type Store<T = object> = ReturnType<typeof useStoreData<T>>;

const createStoreContext = <T extends SimpleRecord>(
  id: string,
): React.Context<Store<T>> => {
  const Context = createContext<Store<T>>({
    get: () => ({}) as T,
    getServerSnapshot: () => ({}) as T,
    id,
    set: () => {},
    subscribe: () => () => {},
  });

  return Context;
};

const Stores = {
  comment: createStoreContext<Comment>("comment"),
  "global-store": createStoreContext<StoreState>("global-store"),
  onboarding: createStoreContext("onboarding"),
  prompt: createStoreContext<PromptStoreType>("prompt"),
  "prompt-input": createStoreContext<PromptInputState>("prompt-input"),
} as const;

export type StoreKey = keyof typeof Stores;

export const StoreContext = <State extends object>(
  id: StoreKey,
): React.Context<Store<State>> => {
  if (Stores[id]) {
    return Stores[id] as unknown as React.Context<Store<State>>;
  }

  throw new Error(`Store with id ${id} not found`);
};

interface StoreProviderProps<T> {
  storeId: StoreKey;
  initial: T;
  children: React.ReactNode;
}

export const StoreProvider = <T extends object>({
  storeId,
  children,
  initial,
}: StoreProviderProps<T>) => {
  const Context = StoreContext<T>(storeId);

  return (
    <Context.Provider value={useStoreData(storeId, initial)}>
      {children}
    </Context.Provider>
  );
};
