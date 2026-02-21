import type React from "react";
import { createContext } from "react";
import type { ProfileState } from "@/app/rp/profile/edit/profile.store";
import type { MuseState } from "@/components/edit-muse/muse.store";
import type { MusicState } from "@/components/edit-music/music.store";
import type { EventThreadInputState } from "@/components/event-thread-input/event-thread-input.store";
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
  "event-thread-input":
    createStoreContext<EventThreadInputState>("event-thread-input"),
  "global-store": createStoreContext<StoreState>("global-store"),
  muse: createStoreContext<MuseState>("muse"),
  music: createStoreContext<MusicState>("music"),
  onboarding: createStoreContext("onboarding"),
  profile: createStoreContext<ProfileState>("profile"),
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
