import React, { createContext } from "react";
import { useStoreData } from "./use-store-data";
import { StoreState } from "@/types/state";
import { PromptInputState } from "@/components/prompt-input/prompt-input.store";
import { Comment } from "@/types";
import { PromptStoreType } from "@/components/prompt/prompt.store";

type SimpleRecord = Record<string, any>;

export type Store<T = object> = ReturnType<typeof useStoreData<T>>;

const createStoreContext = <T extends SimpleRecord>(
  id: string
): React.Context<Store<T>> => {
  const Context = createContext<Store<T>>({
    id,
    get: () => ({} as T),
    set: () => {},
    subscribe: () => () => {},
  });

  return Context;
};

const Stores = {
  "global-store": createStoreContext<StoreState>("global-store"),
  "prompt-input": createStoreContext<PromptInputState>("prompt-input"),
  prompt: createStoreContext<PromptStoreType>("prompt"),
  comment: createStoreContext<Comment>("comment"),
} as const;

export type StoreKey = keyof typeof Stores;

export const StoreContext = <State extends object>(
  id: StoreKey
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
