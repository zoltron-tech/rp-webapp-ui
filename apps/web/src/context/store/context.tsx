import type { Comment } from "@nw/types";
import {
  createStoreContext,
  GlobalStoreContext,
  type Store,
  useStoreData,
} from "@nw/store";
import type React from "react";
import type { ProfileState } from "@/app/rp/profile/edit/profile.store";
import type { MuseState } from "@/components/edit-muse/muse.store";
import type { MuseAboutSectionState } from "@/components/edit-muse-about-section/muse-about-section.store";
import type { MusicState } from "@/components/edit-music/music.store";
import type { StoryboardState } from "@/components/edit-storyboard/storyboard.store";
import type { StoryboardEventState } from "@/components/edit-storyboard-event-card/storyboard-event.store";
import type { EventThreadInputState } from "@/components/event-thread-input/event-thread-input.store";
import type { PromptStoreType } from "@/components/prompt/prompt.store";
import type { PromptInputState } from "@/components/prompt-input/prompt-input.store";

export type { Store };

/**
 * This app's stores.
 *
 * The mechanism (`createStoreContext`, `useStoreData`, the hooks) lives in
 * `@nw/store`; the *registry* stays here because most of these shapes are
 * web-editor state that has no meaning on another client — a package importing
 * `@/components/edit-muse/muse.store` would be the package reaching into the
 * app, which is exactly what `check:boundaries` forbids.
 *
 * `global-store` is the exception and points at the shared context, so
 * `useGlobalState` from `@nw/store` reads the same store this provider fills.
 */
const Stores = {
  comment: createStoreContext<Comment>("comment"),
  "event-thread-input":
    createStoreContext<EventThreadInputState>("event-thread-input"),
  "global-store": GlobalStoreContext,
  muse: createStoreContext<MuseState>("muse"),
  "muse-about-section":
    createStoreContext<MuseAboutSectionState>("muse-about-section"),
  music: createStoreContext<MusicState>("music"),
  onboarding: createStoreContext<Record<string, unknown>>("onboarding"),
  profile: createStoreContext<ProfileState>("profile"),
  prompt: createStoreContext<PromptStoreType>("prompt"),
  "prompt-input": createStoreContext<PromptInputState>("prompt-input"),
  storyboard: createStoreContext<StoryboardState>("storyboard"),
  "storyboard-event":
    createStoreContext<StoryboardEventState>("storyboard-event"),
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
